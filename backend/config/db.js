import mongoose from "mongoose";
import "dotenv/config";

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || typeof uri !== "string" || !uri.trim()) {
    console.error("[DB] MONGO_URI is not set or empty in .env. Copy backend/.env.example to .env and set MONGO_URI.");
    process.exit(1);
  }
  try {
    console.log("[DB] Connecting to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    const { host, name } = mongoose.connection;
    console.log("[DB] Connected →", host + "/" + name);
  } catch (err) {
    console.error("[DB] Connection error:", err.message);
    process.exit(1);
  }
}
