import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import serverless from "serverless-http";

import userRoutes from "../routes/userRoutes.js";
import petRoutes from "../routes/pets.js";
import dashboardRoutes from "../routes/dashboard.js";
import vaccinationRoutes from "../routes/vaccination.js";
import dewormingRoutes from "../routes/deworming.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// MongoDB connection (cached for Vercel)
let isConnected;
async function connectDB() {
  if (isConnected) return;
  const conn = await mongoose.connect(process.env.MONGO_URI);
  isConnected = conn.connections[0].readyState;
  console.log("MongoDB connected");
}
connectDB();

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/dewormings", dewormingRoutes);

// Export handler for Vercel
export default serverless(app);

