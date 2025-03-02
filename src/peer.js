import Peer from "peerjs";



export const createPeer = () => {
  return new Peer(undefined, {
    host: "0.peerjs.com",
    port: 443,
    secure: true
  });
};
