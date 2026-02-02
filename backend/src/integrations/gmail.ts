import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let oauth2Client: OAuth2Client;

export const initializeGmailClient = (): OAuth2Client => {
  oauth2Client = new google.auth.OAuth2(
    env.GMAIL_CLIENT_ID,
    env.GMAIL_CLIENT_SECRET,
    env.GMAIL_REDIRECT_URI,
  );

  return oauth2Client;
};

export const getGmailClient = (): OAuth2Client => {
  if (!oauth2Client) {
    return initializeGmailClient();
  }
  return oauth2Client;
};

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  headers: {
    name: string;
    value: string;
  }[];
  parts?: Array<{
    mimeType: string;
    body: {
      size: number;
      data?: string;
    };
    parts?: any[];
  }>;
  body?: {
    size: number;
    data?: string;
  };
}

export interface EmailData {
  id: string;
  threadId: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  date: Date;
  body: string;
  snippet: string;
}

export const gmailService = {
  /**
   * Get OAuth URL for user authorization
   */
  getOAuthUrl: (): string => {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return getGmailClient().generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  },

  /**
   * Exchange authorization code for tokens
   */
  exchangeCodeForTokens: async (code: string) => {
    try {
      const { tokens } = await getGmailClient().getToken(code);
      return tokens;
    } catch (error) {
      logger.error('Failed to exchange code for tokens:', error);
      throw error;
    }
  },

  /**
   * Set credentials for a user session
   */
  setCredentials: (accessToken: string, refreshToken?: string) => {
    getGmailClient().setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  },

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken: async (refreshToken: string): Promise<string> => {
    try {
      getGmailClient().setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await getGmailClient().refreshAccessToken();
      const newAccessToken = credentials.access_token;

      if (!newAccessToken) {
        throw new Error('Failed to get new access token');
      }

      return newAccessToken;
    } catch (error) {
      logger.error('Failed to refresh access token:', error);
      throw error;
    }
  },

  /**
   * Fetch emails from Gmail
   */
  fetchEmails: async (
    accessToken: string,
    limit: number = 50,
    pageToken?: string,
  ): Promise<{ messages: GmailMessage[]; nextPageToken?: string }> => {
    try {
      gmailService.setCredentials(accessToken);

      const gmailAPI = google.gmail({
        version: 'v1',
        auth: getGmailClient(),
      });

      const response = await gmailAPI.users.messages.list({
        userId: 'me',
        q: 'from:(has:attachment OR has:link)',
        maxResults: limit,
        pageToken,
      });

      return {
        messages: response.data.messages || [],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      logger.error('Failed to fetch emails:', error);
      throw error;
    }
  },

  /**
   * Get full email message with body
   */
  getFullMessage: async (accessToken: string, messageId: string): Promise<GmailMessage> => {
    try {
      gmailService.setCredentials(accessToken);

      const gmailAPI = google.gmail({
        version: 'v1',
        auth: getGmailClient(),
      });

      const response = await gmailAPI.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return response.data as GmailMessage;
    } catch (error) {
      logger.error('Failed to get full message:', error);
      throw error;
    }
  },

  /**
   * Parse Gmail message to extract email data
   */
  parseGmailMessage: (message: GmailMessage): EmailData => {
    const headers = message.payload?.headers || [];

    const getHeader = (name: string): string => {
      return headers.find((h) => h.name === name)?.value || '';
    };

    // Extract name from email address
    const fromEmail = getHeader('From');
    const fromMatch = fromEmail.match(/(?:"([^"]*)")?\s*<([^>]+)>/);
    const from = fromMatch ? fromMatch[2] : fromEmail;
    const fromName = fromMatch ? fromMatch[1] : undefined;

    // Parse date
    const dateStr = getHeader('Date');
    const date = new Date(dateStr);

    // Extract body
    let body = '';
    if (message.payload?.parts) {
      const textPart = message.payload.parts.find(
        (part) => part.mimeType === 'text/plain' || part.mimeType === 'text/html',
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    } else if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }

    return {
      id: message.id,
      threadId: message.threadId,
      from,
      fromName,
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date,
      body,
      snippet: message.snippet || '',
    };
  },
};
