import Peer from "peerjs";



export const createPeer = () => {
  return new Peer(undefined, {
    host: "your-server.com",
  port: 443,
  path: "/peerjs",
  secure: true,
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Google's free STUN server
    ]
  }
  });
};
