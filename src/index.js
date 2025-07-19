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

//Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",                     // local dev
  "https://voxafrontend-i2xc.vercel.app",         // production domain
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


app.get("/", (req, res) => {
  res.send("✅ Voxa backend is running!");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    connectDB();
});