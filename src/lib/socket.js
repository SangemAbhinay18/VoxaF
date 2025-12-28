import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://voxachats.vercel.app/",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Join specific chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${userId} joined chat ${chatId}`);
  });

  // ✅ Handle new message
  socket.on("sendMessage", async ({ chatId, senderId, content }) => {
    const newMessage = new Message({ chatId, senderId, content });
    await newMessage.save();

    io.to(chatId).emit("message:new", newMessage);
  });

  // ✅ Handle message read event
  socket.on("message:read", async ({ chatId, messageIds, readerId }) => {
    await Message.updateMany(
      { _id: { $in: messageIds }, chatId },
      { $set: { status: "seen" } }
    );

    io.to(chatId).emit("message:read:update", { messageIds, readerId });
  });

  // 🔴 Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server };
