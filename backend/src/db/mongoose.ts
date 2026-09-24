import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge';
const MONGO_MAX_RETRIES = Number(process.env.MONGO_MAX_RETRIES) || 5;
const MONGO_RETRY_INTERVAL_MS = Number(process.env.MONGO_RETRY_INTERVAL_MS) || 5000;

// Lifecycle event listeners
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Waiting for reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function connectMongoDB(): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === 'production';

  for (let attempt = 1; attempt <= MONGO_MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 4000
      });
      console.log('✅ MongoDB connected successfully at', MONGODB_URI);
      return true;
    } catch (error: any) {
      if (attempt < MONGO_MAX_RETRIES) {
        console.warn(
          `⚠️  MongoDB connection failed (attempt ${attempt}/${MONGO_MAX_RETRIES}). Retrying in ${MONGO_RETRY_INTERVAL_MS / 1000}s...`
        );
        await sleep(MONGO_RETRY_INTERVAL_MS);
      } else {
        console.error(`❌ MongoDB connection failed after ${MONGO_MAX_RETRIES} attempts.`);
        console.error('👉 Please make sure MongoDB is installed and running locally, or check MONGODB_URI in your .env file.');
        console.error(`   Configured MONGODB_URI: ${MONGODB_URI}`);

        if (isProduction) {
          console.error('🚨 Production environment detected: Exiting process due to database failure.');
          process.exit(1);
        } else {
          console.warn(
            '⚠️  [DEVELOPMENT MODE] Continuing server startup without MongoDB. Database-dependent API routes will fail until MongoDB is started.'
          );
          return false;
        }
      }
    }
  }

  return false;
}

export default mongoose;
