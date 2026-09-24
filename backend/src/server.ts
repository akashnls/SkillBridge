import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';
import { connectMongoDB } from './db/mongoose.js';
import { seedDatabase } from './db/seed.js';
import { verifyEmailConnection } from './services/email.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize MongoDB & Seed initial data
async function startServer() {
  const isConnected = await connectMongoDB();
  if (isConnected) {
    await seedDatabase();
  } else {
    console.warn('⚠️  Skipping database seeding because MongoDB is not connected.');
  }

  // Verify SMTP connection at startup (fire-and-forget — never crashes server)
  verifyEmailConnection();

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SkillBridge Backend API',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      db: 'MongoDB'
    });
  });

  // API Routes
  app.use('/api', apiRoutes);

  // Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error occurred',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 SkillBridge Backend API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
  });
}

startServer();
