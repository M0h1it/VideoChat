import Peer from "peerjs";



export const createPeer = () => {
  return new Peer(undefined, {
    host: "/",
    port: 9000,
  });
};
