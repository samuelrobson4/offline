import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { gmailService } from '../integrations/gmail';
import { gmailSyncService } from '../services/gmailSyncService';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export const gmailController = {
  /**
   * GET /api/gmail/oauth-url
   */
  getOAuthUrl: (_req: AuthenticatedRequest, res: Response): void => {
    try {
      const url = gmailService.getOAuthUrl();
      res.json({ authUrl: url });
    } catch (error) {
      logger.error('Error getting OAuth URL:', error);
      res.status(500).json({ error: 'Failed to get OAuth URL' });
    }
  },

  /**
   * POST /api/gmail/callback
   */
  handleOAuthCallback: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { code } = req.body;

      if (!code) {
        res.status(400).json({ error: 'Authorization code required' });
        return;
      }

      // Exchange code for tokens
      const tokens = await gmailService.exchangeCodeForTokens(code);

      if (!tokens.access_token) {
        res.status(400).json({ error: 'Failed to get access token' });
        return;
      }

      // Save tokens to user
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          gmailAccessToken: tokens.access_token,
          gmailRefreshToken: tokens.refresh_token || undefined,
        },
      });

      logger.info(`Gmail connected for user ${req.user.id}`);

      res.json({
        message: 'Gmail connected successfully',
        gmailConnected: true,
      });
    } catch (error) {
      logger.error('Error in OAuth callback:', error);
      res.status(500).json({ error: 'Failed to connect Gmail' });
    }
  },

  /**
   * POST /api/gmail/sync
   */
  syncEmails: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Run sync asynchronously
      gmailSyncService.syncUserEmails(req.user.id).catch((error) => {
        logger.error('Error during async email sync:', error);
      });

      res.json({
        message: 'Email sync started',
        status: 'processing',
      });
    } catch (error) {
      logger.error('Error starting email sync:', error);
      res.status(500).json({ error: 'Failed to start email sync' });
    }
  },

  /**
   * GET /api/gmail/sync-status
   */
  getSyncStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          gmailAccessToken: true,
          gmailSyncedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        gmailConnected: !!user.gmailAccessToken,
        lastSync: user.gmailSyncedAt,
      });
    } catch (error) {
      logger.error('Error getting sync status:', error);
      res.status(500).json({ error: 'Failed to get sync status' });
    }
  },
};
