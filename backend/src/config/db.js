import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo-app';

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB connection lost.');
    });

  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`
------------------------------------------------------------------------
[MongoDB Connection Guide]
Could not connect to MongoDB at "${mongoURI}".
- If using Local MongoDB: Ensure MongoDB Service / mongod is running.
- If using MongoDB Atlas (Cloud): Set MONGODB_URI in backend/.env to your
  Atlas connection string:
  mongodb+srv://<user>:<password>@cluster.mongodb.net/todo-app?retryWrites=true&w=majority
------------------------------------------------------------------------
`);
    // In production we would exit, but for dev we let the server start so users can configure .env
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
