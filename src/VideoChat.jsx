import React, { useEffect, useRef, useState } from "react";
import { createPeer } from "./peer";
import io from "socket.io-client";
import { Button, TextField, Typography, Container, Box, Grid, Paper } from "@mui/material";

// Use WebSocket for socket connection
// const socket = io("https://videochat-yq4y.onrender.com", {
//   transports: ["websocket","polling"],
// });

const socket = io("wss://videochat-yq4y.onrender.com", {
  transports: ["websocket"], // Force WebSocket transport
  reconnection: true, // Allow reconnections
  reconnectionAttempts: 5, // Retry up to 5 times
});


const VideoChat = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    const peerInstance = createPeer();
    setPeer(peerInstance);

    peerInstance.on("open", (id) => {
      setPeerId(id);
      socket.emit("user-joined", id);
    });

    peerInstance.on("call", (incomingCall) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        localStreamRef.current = stream;
        incomingCall.answer(stream);
        localVideoRef.current.srcObject = stream;

        incomingCall.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });

        setCall(incomingCall);
        setIsConnected(true);
      });
    });

    socket.on("user-connected", (peerId) => {
      console.log("User connected with Peer ID:", peerId);
      setIsConnected(true);
    });

    socket.on("user-disconnected", () => {
      console.log("User disconnected.");
      setIsConnected(false);
      endCall();
    });

    return () => {
      socket.off("user-connected");
      socket.off("user-disconnected");
    };
  }, []);

  const callPeer = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;
      const outgoingCall = peer.call(remotePeerId, stream);

      outgoingCall.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      setCall(outgoingCall);
      setIsConnected(true);
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = !isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (call) {
      call.close();
      setCall(null);
      setIsConnected(false);
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    }
  };

  const copyPeerId = () => {
    if (!peerId) return;
    navigator.clipboard.writeText(peerId);
    alert("Peer ID copied to clipboard!");
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Video Chat
        </Typography>
        <Typography variant="h6" color={isConnected ? "green" : "red"}>
          Status: {isConnected ? "Connected ✅" : "Waiting for Peer..."}
        </Typography>

        <Box mt={2}>
        <Typography variant="subtitle1">
          My ID: <strong>{peerId}</strong>
          <Button
            variant="contained"
            color="secondary"
            onClick={copyPeerId}
            sx={{ ml: 2 }}
          >
            Copy
          </Button>
        </Typography>
          <TextField
            label="Enter Peer ID to Call"
            variant="outlined"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            sx={{ mt: 2, width: "100%" }}
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={callPeer}
            disabled={!remotePeerId || isConnected}
            sx={{ mt: 2 }}
          >
            Call
          </Button>
        </Box>

        <Grid container spacing={2} justifyContent="center" mt={3}>
          <Grid item>
          <h3>User 1</h3>
            <video ref={localVideoRef} autoPlay playsInline muted width="300" height="200" style={{ borderRadius: 10, border: "2px solid #3f51b5" }} />
          </Grid>
          <Grid item>
          <h3>User 2</h3>
            <video ref={remoteVideoRef} autoPlay playsInline width="300" height="200" style={{ borderRadius: 10, border: "2px solid #3f51b5" }} />
          </Grid>
        </Grid>

        {isConnected && (
          <Box mt={2}>
            <Button variant="contained" color={isMuted ? "secondary" : "success"} onClick={toggleMute} sx={{ mr: 2 }}>
            {isMuted ? "Mute" : "Unmute"}
            </Button>
            <Button variant="contained" color={isVideoOff ? "secondary" : "success"} onClick={toggleVideo} sx={{ mr: 2 }}>
            {isVideoOff ? "Turn Video off" : "Turn Video on"}
            </Button>
            <Button variant="contained" color="error" onClick={endCall}>
              End Call
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VideoChat;
