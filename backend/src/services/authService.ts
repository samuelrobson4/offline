import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface TokenPayload {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

export const authService = {
  /**
   * Hash a password
   */
  hashPassword: async (password: string): Promise<string> => {
    return bcryptjs.hash(password, SALT_ROUNDS);
  },

  /**
   * Compare password with hash
   */
  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    return bcryptjs.compare(password, hash);
  },

  /**
   * Generate JWT tokens
   */
  generateTokens: (payload: TokenPayload): AuthTokens => {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  },

  /**
   * Verify access token
   */
  verifyAccessToken: (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken: (token: string): TokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  },

  /**
   * Create a new user
   */
  createUser: async (
    email: string,
    name: string,
    password: string,
  ): Promise<{ id: string; email: string; name: string }> => {
    try {
      const hashedPassword = await authService.hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      logger.info(`User created: ${email}`);
      return user;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint failed')) {
        throw new Error('Email already in use');
      }
      throw error;
    }
  },

  /**
   * Find user by email and verify password
   */
  authenticateUser: async (
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; name?: string } | null> => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await authService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
