import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { authService } from '../services/authService';
import { signupSchema, loginSchema, refreshTokenSchema } from '../validators/authValidator';
import { logger } from '../utils/logger';

export const authController = {
  /**
   * POST /api/auth/signup
   */
  signup: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = signupSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.errors,
        });
        return;
      }

      const { email, name, password } = parsed.data;

      const user = await authService.createUser(email, name, password);
      const { accessToken, refreshToken } = authService.generateTokens({
        id: user.id,
        email: user.email,
      });

      res.status(201).json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      logger.error('Signup error:', error);

      if (error instanceof Error && error.message === 'Email already in use') {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Signup failed' });
    }
  },

  /**
   * POST /api/auth/login
   */
  login: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.errors,
        });
        return;
      }

      const { email, password } = parsed.data;

      const user = await authService.authenticateUser(email, password);

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const { accessToken, refreshToken } = authService.generateTokens({
        id: user.id,
        email: user.email,
      });

      logger.info(`User logged in: ${email}`);

      res.json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  /**
   * POST /api/auth/refresh
   */
  refresh: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = refreshTokenSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.errors,
        });
        return;
      }

      const { refreshToken } = parsed.data;

      const payload = authService.verifyRefreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens({
        id: payload.id,
        email: payload.email,
      });

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  },

  /**
   * POST /api/auth/logout
   */
  logout: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      logger.info(`User logged out: ${req.user?.email}`);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },
};
