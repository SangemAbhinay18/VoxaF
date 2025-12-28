import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __dirname = path.resolve();

// Middlewares FIRST
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://voxachats.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));


app.options("*", cors());

// Routes AFTER CORS
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
