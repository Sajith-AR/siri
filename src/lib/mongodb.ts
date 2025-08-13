import mongoose from 'mongoose';
import { logger } from './logging';
import { env } from './env';

// MongoDB connection configuration
const MONGODB_URI = env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare';

interface MongoConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global connection cache to prevent multiple connections
let cached: MongoConnection = {
  conn: null,
  promise: null,
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    
    // Log successful connection
    await logger.log({
      level: 'info',
      message: 'Successfully connected to MongoDB',
      metadata: {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    });

    // Set up connection event listeners
    mongoose.connection.on('error', async (error) => {
      await logger.log({
        level: 'error',
        message: 'MongoDB connection error',
        metadata: { error: error.message }
      });
    });

    mongoose.connection.on('disconnected', async () => {
      await logger.log({
        level: 'warn',
        message: 'MongoDB disconnected'
      });
    });

    mongoose.connection.on('reconnected', async () => {
      await logger.log({
        level: 'info',
        message: 'MongoDB reconnected'
      });
    });

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    await logger.log({
      level: 'error',
      message: 'Failed to connect to MongoDB',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    throw error;
  }
}

// Health check for MongoDB connection
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  details: any;
}> {
  const start = Date.now();
  
  try {
    await connectToDatabase();
    
    // Perform a simple ping operation
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
      details: {
        connected: mongoose.connection.readyState === 1,
        database: mongoose.connection.name,
        collections: (await mongoose.connection.db.listCollections().toArray()).length,
        ping: result
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        connected: false
      }
    };
  }
}

// Graceful shutdown
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    
    await logger.log({
      level: 'info',
      message: 'Disconnected from MongoDB'
    });
  } catch (error) {
    await logger.log({
      level: 'error',
      message: 'Error disconnecting from MongoDB',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
}

// Database utilities
export async function createIndexes(): Promise<void> {
  try {
    await connectToDatabase();
    
    // Create indexes for better performance
    const db = mongoose.connection.db;
    
    // Patient indexes
    await db.collection('patients').createIndex({ email: 1 }, { unique: true });
    await db.collection('patients').createIndex({ phone: 1 });
    await db.collection('patients').createIndex({ createdAt: -1 });
    
    // Health records indexes
    await db.collection('healthrecords').createIndex({ patientId: 1, timestamp: -1 });
    await db.collection('healthrecords').createIndex({ type: 1 });
    await db.collection('healthrecords').createIndex({ tags: 1 });
    
    // Appointments indexes
    await db.collection('appointments').createIndex({ patientId: 1, dateTime: 1 });
    await db.collection('appointments').createIndex({ doctorId: 1, dateTime: 1 });
    await db.collection('appointments').createIndex({ status: 1 });
    
    // Doctors indexes
    await db.collection('doctors').createIndex({ email: 1 }, { unique: true });
    await db.collection('doctors').createIndex({ specialization: 1 });
    
    await logger.log({
      level: 'info',
      message: 'Database indexes created successfully'
    });
  } catch (error) {
    await logger.log({
      level: 'error',
      message: 'Failed to create database indexes',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
}

// Database statistics
export async function getDatabaseStats(): Promise<{
  collections: Record<string, number>;
  totalSize: number;
  indexes: number;
  connections: number;
}> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    
    const stats = await db.stats();
    const collections = await db.listCollections().toArray();
    
    const collectionCounts: Record<string, number> = {};
    let totalIndexes = 0;
    
    for (const collection of collections) {
      const collectionStats = await db.collection(collection.name).stats();
      collectionCounts[collection.name] = collectionStats.count || 0;
      totalIndexes += collectionStats.nindexes || 0;
    }
    
    return {
      collections: collectionCounts,
      totalSize: stats.dataSize || 0,
      indexes: totalIndexes,
      connections: mongoose.connections.length
    };
  } catch (error) {
    await logger.log({
      level: 'error',
      message: 'Failed to get database statistics',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return {
      collections: {},
      totalSize: 0,
      indexes: 0,
      connections: 0
    };
  }
}

// Export the mongoose instance for direct use if needed
export { mongoose };
export default connectToDatabase;