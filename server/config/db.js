import mongoose from 'mongoose';
import dns from 'dns';

// Use Google DNS to resolve MongoDB Atlas SRV records
// (fixes ECONNREFUSED on networks where the local router DNS doesn't support SRV lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`⚠️  MongoDB connection attempt ${retries}/${maxRetries} failed: ${error.message}`);
      if (retries < maxRetries) {
        console.log(`   Retrying in 5 seconds...`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  console.error('❌ Could not connect to MongoDB after multiple attempts. Server will continue running but DB operations will fail.');
};

export default connectDB;
