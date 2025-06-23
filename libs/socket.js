// libs/socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("⚡ New client connected:", socket.id);

      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      });

      socket.on("send_message", async (data) => {
        console.log("📩 Message received:", data);
        try {
          const { default: dbConnect } = await import("./dbConnect.js");
          const { default: Message } = await import("../models/Message.js");

          await dbConnect();
          const message = await Message.create(data);

          // Send to receiver
          io.to(data.receiverId).emit("receive_message", message);
        } catch (err) {
          console.error("❌ Error saving message:", err.message);
        }
      });

      socket.on("disconnect", () => {
        console.log("🔌 Client disconnected:", socket.id);
      });
    });

    console.log("✅ Socket server initialized");
    global._io = io;
  }

  return io;
};

export const getSocket = () => io;
