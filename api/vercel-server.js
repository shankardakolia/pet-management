// vercel-server.js
import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./backend/routes/auth.js";
import petRoutes from "./backend/routes/pets.js";
import dashboardRoutes from "./backend/routes/dashboard.js";
import vaccinationRoutes from "./backend/routes/vaccinations.js";
import dewormingRoutes from "./backend/routes/dewormings.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// --- Cached MongoDB connection ---
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect once before requests
await connectDB();

// --- Routes ---
app.get("/", (req, res) =>
  res.send("🐾 Pet Management API deployed on Vercel")
);
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/dewormings", dewormingRoutes);

// Export for Vercel
export const handler = serverless(app);
export default app;
