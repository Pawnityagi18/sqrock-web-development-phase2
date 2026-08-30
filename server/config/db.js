import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workpulse', {
      serverSelectionTimeoutMS: 8000 // fail fast with a clear error instead of hanging for the ~30s default
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Warning: ${error.message}`);
    if (error.message.includes('whitelist') || error.message.includes('ETIMEDOUT') || error.message.includes('querySrv') || error.message.includes('could not connect')) {
      console.warn(`⚡ This usually means your current IP address is not allowed in MongoDB Atlas.`);
      console.warn(`⚡ Fix: Atlas dashboard → Network Access → Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0) for local dev.`);
    }
    console.warn(`⚡ Operating in resilient mode (routes that need the database will fail until this is fixed).`);
  }
};

export default connectDB;
