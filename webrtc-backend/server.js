const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);

// Use dynamic port for deployment
const PORT = process.env.PORT || 5000;

// Enable CORS (Allow frontend domain)
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

// Initialize Socket.io with proper CORS settings
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your frontend URL for security
    methods: ["GET", "POST"],
  },
});

// Store online users
let onlineUsers = {};

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add new user to onlineUsers
  onlineUsers[socket.id] = { id: socket.id };
  io.emit("online-users", Object.values(onlineUsers)); // Send updated user list

  // User joined with Peer ID
  socket.on("user-joined", (peerId) => {
    onlineUsers[socket.id].peerId = peerId; // Store PeerJS ID
    io.emit("online-users", Object.values(onlineUsers)); // Update user list
    io.emit("user-connected", peerId);
  });

  // User disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete onlineUsers[socket.id]; // Remove from online users list
    io.emit("online-users", Object.values(onlineUsers)); // Update user list
    io.emit("user-disconnected", socket.id);
  });
});

// PeerJS Server with explicit path
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/peerjs",
});
app.use("/peerjs", peerServer);

// Start server with dynamic port
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
