import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectMongoDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        dbName: "Parla-Backend",
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB Connected via cache");
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectMongoDB;

