import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/database';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth';
import placeRoutes from './routes/places';
import eventRoutes from './routes/events';
import emailSourceRoutes from './routes/emailSources';
import gmailRoutes from './routes/gmail';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/email-sources', emailSourceRoutes);
app.use('/api/gmail', gmailRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
