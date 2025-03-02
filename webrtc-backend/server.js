const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "https://video-chat-theta-self.vercel.app" }));

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "https://video-chat-theta-self.vercel.app",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = {};

// Handle new user connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user-joined", (peerId) => {
    onlineUsers[socket.id] = { id: socket.id, peerId };
    io.emit("online-users", Object.values(onlineUsers));
    io.emit("user-connected", peerId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const peerId = onlineUsers[socket.id]?.peerId; // Get Peer ID before deletion
    delete onlineUsers[socket.id];
    io.emit("online-users", Object.values(onlineUsers));

    if (peerId) {
      io.emit("user-disconnected", peerId); // Emit Peer ID instead of socket ID
    }
  });
});

// PeerJS Server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use("/peerjs", peerServer);

// Default Route
app.get("/", (req, res) => {
  res.send("Video Chat Server is Running 🚀");
});

// Start the server
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
