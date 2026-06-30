# 🎥 VideoChat

A real-time **Video Chat Application** built with **React** and **WebRTC**, enabling users to connect instantly through peer-to-peer video communication. The project demonstrates real-time networking concepts, media streaming, and responsive frontend development.

> **Live Demo:** https://video-chat-pv5ea1sak-m0h1its-projects.vercel.app/

---

## 📖 Overview

VideoChat lets users start a video call by sharing their **Peer ID** and connect seamlessly in real time. Each user is assigned a unique Peer ID on load; to call someone, you enter their ID and the call connects directly, browser-to-browser. It showcases WebRTC peer connections (via PeerJS) with a Socket.io signaling server, wrapped in a clean Material UI interface.

---

## ✨ Features

* 📹 Real-time video calling
* 🎤 Audio communication (mute / unmute)
* 🎥 Toggle camera on / off
* 🔗 Connect by sharing a unique Peer ID
* 👥 Live online-users awareness via Socket.io
* ⚡ Direct peer-to-peer media (low latency)
* 📱 Responsive Material UI interface
* 🔒 Encrypted media by default (WebRTC/DTLS-SRTP)

---

## 🛠️ Technologies Used

**Frontend**
* React 19
* Vite
* PeerJS (WebRTC peer connections)
* Socket.io Client (signaling)
* Material UI (MUI) + Emotion
* SweetAlert2

**Backend** (`webrtc-backend/`)
* Node.js
* Express.js
* Socket.io
* `peer` (ExpressPeerServer)

---

## 📁 Project Structure

```
VideoChat/
│
├── index.html                # Vite entry HTML
├── vite.config.js
├── eslint.config.js
├── package.json              # frontend (React + Vite)
├── public/
│   └── vite.svg
├── src/
│   ├── main.jsx              # React entry
│   ├── App.jsx / App.css
│   ├── VideoChat.jsx         # main video-chat component (calls, streams, UI)
│   ├── peer.js               # PeerJS client setup
│   ├── index.css
│   └── assets/
│
└── webrtc-backend/           # separate Node backend
    ├── server.js             # Express + Socket.io + PeerJS server
    └── package.json
```

---

## 🚀 Getting Started

This is a two-part project: a **React frontend** (repo root) and a **Node backend** (`webrtc-backend/`).

### 1. Clone the repository

```bash
git clone https://github.com/M0h1it/VideoChat.git
cd VideoChat
```

### 2. Start the backend

```bash
cd webrtc-backend
npm install
npm start            # runs on http://localhost:5000  (npm run dev for auto-restart)
```

### 3. Start the frontend (in a second terminal)

```bash
npm install
npm run dev          # Vite dev server, http://localhost:5173
```

Open **http://localhost:5173** in your browser.

> **Note on configuration:** the connection URLs are currently hardcoded.
> `src/VideoChat.jsx` points the Socket.io client at the deployed backend
> (`wss://videochat-yq4y.onrender.com`), and `src/peer.js` uses the public
> PeerJS cloud (`0.peerjs.com`). To run fully against your **local** backend,
> update those URLs to your local server (e.g. `http://localhost:5000`) and
> point PeerJS at the bundled `/peerjs` server.

### How to make a call

1. Open the app in two browser tabs/devices — each shows its own **Peer ID**.
2. Copy one tab's Peer ID into the other tab's "remote ID" field and start the call.
3. Allow camera/microphone access when prompted.

---

## 🎯 Learning Objectives

This project gave me hands-on experience with:

* WebRTC fundamentals and peer-to-peer media
* PeerJS for managing peer connections
* Socket.io-based signaling and presence
* Accessing media devices (camera & microphone)
* React hooks, refs, and asynchronous flows
* Building UIs with Material UI
* Client–server architecture and deployment (Vercel + Render)

---

## 🔮 Future Improvements

* 💬 Real-time text chat
* 🖥️ Screen sharing
* 📹 Video recording
* 😊 Emoji reactions
* 👥 Group video calls
* 🏷️ Named rooms (instead of sharing raw Peer IDs)
* 🔐 User authentication
* 📱 Progressive Web App (PWA) support
* 🌙 Dark mode

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your branch
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request

---

## 👨‍💻 Author

**Mohit Kumar**

* GitHub: https://github.com/M0h1it
* Portfolio: https://portfolio-m0h1its-projects.vercel.app/
* LinkedIn: https://www.linkedin.com/in/mohit-kumar-b2a80a20a/

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub. Your support motivates me to build and share more open-source projects.

---

## 📄 License

This project is open-source and intended for learning, experimentation, and educational purposes.
