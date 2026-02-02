import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ParsedEvent } from '../types';

const client = new Anthropic({
  apiKey: env.CLAUDE_API_KEY,
});

const EVENT_EXTRACTION_PROMPT = `You are an expert at extracting event information from emails.

Extract event details from the following email. Return the data as a JSON object with these fields:
- title (string, required): The name of the event
- startTime (string, required): ISO 8601 datetime (e.g., "2024-01-15T19:00:00")
- endTime (string, optional): ISO 8601 datetime
- location (string, optional): The venue address or location name
- description (string, optional): Event description or highlights
- category (string, optional): One of: music, food, special, other

If you cannot find event information, return null.

Email:
---
Subject: {subject}
---
{body}
---

Return only valid JSON. Do not include markdown formatting.`;

export interface ExtractedEvent extends ParsedEvent {
  confidence: number;
}

export const claudeService = {
  /**
   * Extract event data from email text
   */
  extractEventFromEmail: async (
    subject: string,
    body: string,
  ): Promise<ExtractedEvent | null> => {
    try {
      const prompt = EVENT_EXTRACTION_PROMPT.replace('{subject}', subject).replace(
        '{body}',
        body.substring(0, 5000), // Limit to 5000 chars
      );

      const response = await client.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        logger.warn('Unexpected response type from Claude');
        return null;
      }

      const text = content.text.trim();

      // Check if Claude couldn't extract event info
      if (text === 'null' || text === 'null.') {
        logger.debug('No event found in email');
        return null;
      }

      const parsed = JSON.parse(text);

      // Validate required fields
      if (!parsed.title || !parsed.startTime) {
        logger.debug('Event missing required fields');
        return null;
      }

      // Parse ISO dates
      const startTime = new Date(parsed.startTime);
      const endTime = parsed.endTime ? new Date(parsed.endTime) : undefined;

      if (isNaN(startTime.getTime())) {
        logger.warn('Invalid start time:', parsed.startTime);
        return null;
      }

      return {
        title: parsed.title,
        description: parsed.description,
        startTime: startTime.toISOString(),
        endTime: endTime?.toISOString(),
        location: parsed.location,
        category: parsed.category || 'other',
        imageUrl: undefined, // Could be extracted from email if needed
        externalUrl: undefined,
        confidence: 0.85, // Base confidence for Claude extraction
      };
    } catch (error) {
      logger.error('Error extracting event from email:', error);
      return null;
    }
  },

  /**
   * Determine if an email is likely from an event venue
   */
  isLikelyEventEmail: async (subject: string, body: string): Promise<boolean> => {
    try {
      const prompt = `Is this email about an event (concert, show, restaurant special, bar event, etc.)?

Respond with only "yes" or "no".

Subject: ${subject}
Body (first 1000 chars): ${body.substring(0, 1000)}`;

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return false;
      }

      return content.text.toLowerCase().includes('yes');
    } catch (error) {
      logger.error('Error checking if email is likely event:', error);
      return false;
    }
  },

  /**
   * Categorize an email
   */
  categorizeEmail: async (subject: string): Promise<string> => {
    try {
      const prompt = `Categorize this event email into one category. Respond with ONLY the category name (no explanation).

Categories: music, food, special, other

Subject: ${subject}`;

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 20,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return 'other';
      }

      const category = content.text.toLowerCase().trim();
      if (['music', 'food', 'special', 'other'].includes(category)) {
        return category;
      }

      return 'other';
    } catch (error) {
      logger.error('Error categorizing email:', error);
      return 'other';
    }
  },
};
