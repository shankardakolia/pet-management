// backend/api/index.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import serverless from "serverless-http";

import authRoutes from "../routes/auth.js";
import petRoutes from "../routes/pets.js";
import dashboardRoutes from "../routes/dashboard.js";
import vaccinationRoutes from "../routes/vaccinations.js";
import dewormingRoutes from "../routes/dewormings.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// ✅ Cached MongoDB connection for serverless (Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ Lazy connect for each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// Routes
app.get("/", (req, res) => res.send("🐾 Pet Management API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/dewormings", dewormingRoutes);

// Export for Vercel
export default serverless(app);

