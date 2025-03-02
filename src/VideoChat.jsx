import React, { useEffect, useRef, useState } from "react";
import { createPeer } from "./peer";
import io from "socket.io-client";
import { Button, TextField, Typography, Container, Box, Grid, Paper } from "@mui/material";
import { Mic, MicOff, Videocam, VideocamOff, ScreenShare, CallEnd } from "@mui/icons-material";

const socket = io("https://videochat-yq4y.onrender.com");

const VideoChat = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
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
          setPeers((prevPeers) => ({ 
            ...prevPeers, [incomingCall.peer]: remoteStream }));
        });
      });
    });

    socket.on("user-connected", (peerId) => {
      setPeers((prevPeers) => ({ ...prevPeers, [peerId]: null }));
    });
    
    socket.on("user-disconnected", (peerId) => {
      setPeers((prevPeers) => {
        const updatedPeers = { ...prevPeers };
        delete updatedPeers[peerId];
        return updatedPeers;
      });
    });
  }, []);

  const callPeer = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;
      
      const outgoingCall = peer.call(remotePeerId, stream);
      outgoingCall.on("stream", (remoteStream) => {
        setPeers((prevPeers) => ({ ...prevPeers, [remotePeerId]: remoteStream }));
      });
    });
  };

  // Ensure video elements update correctly when peers object changes
  
  useEffect(() => {
    Object.keys(peers).forEach((peerKey) => {
      const videoElement = document.getElementById(`video-${peerKey}`);
      if (videoElement && peers[peerKey]) {
        videoElement.srcObject = peers[peerKey];
      }
    });
  }, [peers]);
  

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: "flex",flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", overflowY: "auto"}}>
      <Paper elevation={3} sx={{ padding: 4, textAlign: "center", width: "100%",overflowY: "auto", maxHeight: "90vh" }}>
        <Typography variant="h4" gutterBottom>
          Video Chat
        </Typography>
        <Typography variant="h6" color="green">
          Your Peer ID: <strong>{peerId}</strong>
        </Typography>

        <TextField
          label="Enter Peer ID to Connect"
          variant="outlined"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
          sx={{ mt: 2, width: "100%" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={callPeer}
          disabled={!remotePeerId}
          sx={{ mt: 2 }}
        >
          Call Peer
        </Button>

        <Grid container spacing={2} justifyContent="center" mt={3}>
          <Grid item>
            <video ref={localVideoRef} autoPlay playsInline muted width="300" height="200" style={{ borderRadius: 10, border: "2px solid #3f51b5" }} />
          </Grid>
          {Object.keys(peers).map((peerKey) => (
            <Grid item key={peerKey}>
            <video
              ref={(ref) => ref && (ref.srcObject = peers[peerKey])}
              autoPlay
              playsInline
              width="300"
              height="200"
              style={{ borderRadius: 10, border: peers[peerKey] ? "2px solid lime" : "2px solid gray" }}
            />
          </Grid>
          ))}
        </Grid>

        <Box mt={2}>
          <Button variant="contained" color={isMuted ? "secondary" : "success"} onClick={toggleMute} sx={{ mr: 2 }}>
            {isMuted ? <MicOff /> : <Mic />} 
          </Button>
          <Button variant="contained" color={isVideoOff ? "secondary" : "success"} onClick={toggleVideo} sx={{ mr: 2 }}>
            {isVideoOff ? <VideocamOff /> : <Videocam />} 
          </Button>
          <Button variant="contained" color="warning" sx={{ mr: 2 }}>
            <ScreenShare />
          </Button>
          <Button variant="contained" color="error">
            <CallEnd />
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VideoChat;
