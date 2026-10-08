import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://neondb_owner:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require',
  jwtSecret: process.env.JWT_SECRET || 'acxiom_crm_super_secret_jwt_key_2026_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15
};
