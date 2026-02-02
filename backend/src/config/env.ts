export const env = {
  // Server
  PORT: process.env.PORT || '3001',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

  // Gmail OAuth
  GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID!,
  GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET!,
  GMAIL_REDIRECT_URI: process.env.GMAIL_REDIRECT_URI!,

  // Claude API
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY!,

  // Google Maps
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY!,

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // V2: Email service (Mailgun, etc)
  EMAIL_SERVICE_PROVIDER: process.env.EMAIL_SERVICE_PROVIDER || 'mailgun',
  EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY,
  EMAIL_SERVICE_DOMAIN: process.env.EMAIL_SERVICE_DOMAIN,
};
