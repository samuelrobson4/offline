import { prisma } from '../config/database';
import { gmailService } from '../integrations/gmail';
import { claudeService } from '../integrations/claude';
import { eventService } from './eventService';
import { placeService } from './placeService';
import { logger } from '../utils/logger';

export interface SyncResult {
  processed: number;
  eventsCreated: number;
  errors: string[];
}

export const gmailSyncService = {
  /**
   * Sync emails for a user and extract events
   */
  syncUserEmails: async (userId: string): Promise<SyncResult> => {
    const result: SyncResult = {
      processed: 0,
      eventsCreated: 0,
      errors: [],
    };

    try {
      // Get user with Gmail credentials
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          gmailAccessToken: true,
          gmailRefreshToken: true,
          gmailSyncedAt: true,
        },
      });

      if (!user || !user.gmailAccessToken) {
        logger.warn(`User ${userId} has no Gmail credentials`);
        result.errors.push('Gmail not connected');
        return result;
      }

      let accessToken = user.gmailAccessToken;

      // Refresh token if needed
      if (user.gmailRefreshToken) {
        try {
          accessToken = await gmailService.refreshAccessToken(user.gmailRefreshToken);
          // Update user with new token
          await prisma.user.update({
            where: { id: userId },
            data: { gmailAccessToken: accessToken },
          });
        } catch (error) {
          logger.error('Failed to refresh Gmail token:', error);
          result.errors.push('Failed to refresh Gmail token');
          return result;
        }
      }

      // Fetch emails
      let allMessages: any[] = [];
      let pageToken: string | undefined;
      let pageCount = 0;
      const maxPages = 5; // Limit to 5 pages per sync

      do {
        try {
          const { messages, nextPageToken } = await gmailService.fetchEmails(
            accessToken,
            50,
            pageToken,
          );

          allMessages = allMessages.concat(messages);
          pageToken = nextPageToken;
          pageCount++;
        } catch (error) {
          logger.error('Error fetching emails page:', error);
          result.errors.push(`Failed to fetch email page ${pageCount}`);
          break;
        }
      } while (pageToken && pageCount < maxPages);

      logger.info(`Fetched ${allMessages.length} messages for user ${userId}`);

      // Process each email
      for (const message of allMessages) {
        try {
          result.processed++;

          // Get full message
          const fullMessage = await gmailService.getFullMessage(accessToken, message.id);
          const emailData = gmailService.parseGmailMessage(fullMessage);

          // Check if email is likely an event
          const isEvent = await claudeService.isLikelyEventEmail(
            emailData.subject,
            emailData.body,
          );

          if (!isEvent) {
            logger.debug(`Email not an event: ${emailData.subject}`);
            continue;
          }

          // Extract event from email
          const extractedEvent = await claudeService.extractEventFromEmail(
            emailData.subject,
            emailData.body,
          );

          if (!extractedEvent) {
            logger.debug(`Could not extract event from: ${emailData.subject}`);
            continue;
          }

          // Find or create place from email sender
          let place = await placeService.findByEmailDomain(userId, emailData.from);

          if (!place) {
            // Create new place
            place = await placeService.createPlace(userId, {
              name: emailData.fromName || emailData.from,
              website: `mailto:${emailData.from}`,
              category: extractedEvent.category,
            });
          }

          // Create email source record
          await prisma.emailSource.upsert({
            where: {
              userId_fromEmail: {
                userId,
                fromEmail: emailData.from,
              },
            },
            update: {
              lastEmailReceivedAt: emailData.date,
            },
            create: {
              userId,
              fromEmail: emailData.from,
              fromName: emailData.fromName,
              placeId: place.id,
              sourceType: 'gmail',
              lastEmailReceivedAt: emailData.date,
            },
          });

          // Create event
          try {
            await eventService.createEvent(userId, {
              placeId: place.id,
              title: extractedEvent.title,
              description: extractedEvent.description,
              startTime: new Date(extractedEvent.startTime),
              endTime: extractedEvent.endTime ? new Date(extractedEvent.endTime) : undefined,
              location: extractedEvent.location,
              category: extractedEvent.category,
              sourceEmail: emailData.from,
              sourceType: 'gmail',
              externalId: `gmail_${emailData.id}`,
            });

            result.eventsCreated++;
            logger.info(`Event created: ${extractedEvent.title}`);
          } catch (error) {
            logger.error('Error creating event:', error);
            // Continue to next email even if event creation fails
          }
        } catch (error) {
          logger.error('Error processing email:', error);
          result.errors.push(`Error processing email: ${message.id}`);
        }
      }

      // Update sync timestamp
      await prisma.user.update({
        where: { id: userId },
        data: { gmailSyncedAt: new Date() },
      });

      logger.info(
        `Sync completed for ${userId}: ${result.eventsCreated} events created from ${result.processed} emails`,
      );

      return result;
    } catch (error) {
      logger.error('Error in gmailSyncService.syncUserEmails:', error);
      result.errors.push('Unexpected error during sync');
      return result;
    }
  },

  /**
   * Sync emails for all users
   */
  syncAllUsers: async (): Promise<Map<string, SyncResult>> => {
    const results = new Map<string, SyncResult>();

    try {
      // Get all users with Gmail connected
      const users = await prisma.user.findMany({
        where: {
          gmailAccessToken: {
            not: null,
          },
        },
        select: {
          id: true,
        },
      });

      logger.info(`Starting sync for ${users.length} users`);

      for (const user of users) {
        try {
          const result = await gmailSyncService.syncUserEmails(user.id);
          results.set(user.id, result);
        } catch (error) {
          logger.error(`Error syncing user ${user.id}:`, error);
          results.set(user.id, {
            processed: 0,
            eventsCreated: 0,
            errors: ['Unexpected sync error'],
          });
        }
      }
    } catch (error) {
      logger.error('Error in gmailSyncService.syncAllUsers:', error);
    }

    return results;
  },
};
