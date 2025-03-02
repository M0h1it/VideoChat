import React, { useEffect, useRef, useState } from "react";
import { createPeer } from "./peer";
import io from "socket.io-client";
import { Button, TextField, Typography, Container, Box, Grid, Paper } from "@mui/material";
import { MicOff, VideocamOff, CallEnd, Mic, Videocam } from "@mui/icons-material";
import Swal from "sweetalert2";

const socket = io( process.env.NODE_ENV === "production"
  ? "https://videochat-yq4y.onrender.com"
  : "http://localhost:5000", {
  transports: ["websocket", "polling"],
});

const VideoChat = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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
      Swal.fire({
        title: "Incoming Call",
        text: "Do you want to accept the call?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Accept",
        cancelButtonText: "Reject",
      }).then((result) => {
        if (result.isConfirmed) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            localStreamRef.current = stream;
            localVideoRef.current.srcObject = stream;
            incomingCall.answer(stream);

            incomingCall.on("stream", (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                console.log("Local Stream: ", localStreamRef.current); // Debug log
  console.log("Remote Stream: ", remoteVideoRef.current?.srcObject);
                remoteVideoRef.current.play();
              }
            });

            setCall(incomingCall);
            setIsConnected(true);
          });
        }
      });
    });

    socket.on("user-connected", (peerId) => setIsConnected(true));
    socket.on("user-disconnected", () => {
      setIsConnected(false);
      endCall();
    });

    return () => {
      socket.off("user-connected");
      socket.off("user-disconnected");
    };
  }, []);

  const callPeer = () => {
    Swal.fire({
      title: "Start Call",
      text: "Are you sure you want to start the call?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Call!",
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
          localStreamRef.current = stream;
          localVideoRef.current.srcObject = stream;

          const outgoingCall = peer.call(remotePeerId, stream);
          outgoingCall.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              console.log("Local Stream: ", localStreamRef.current); // Debug log
  console.log("Remote Stream: ", remoteVideoRef.current?.srcObject);
              remoteVideoRef.current.play();
            }
          });

          setCall(outgoingCall);
          setIsConnected(true);
        });
      }
    });
  };

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

  const endCall = () => {
    if (call) {
      call.close();
      setCall(null);
      setIsConnected(false);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop()); // Stop all local tracks
        // localStreamRef.current = null;
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      Swal.fire("Call Ended", "The call has been successfully ended.", "info");
    }
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
          <Typography>Your Peer ID: <strong>{peerId}</strong></Typography>
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
            <video ref={localVideoRef} autoPlay playsInline muted width="300" height="200" style={{ borderRadius: 10, border: "2px solid #3f51b5" }} />
          </Grid>
          <Grid item>
            <video ref={remoteVideoRef} autoPlay playsInline width="300" height="200" style={{ borderRadius: 10, border: "2px solid #3f51b5" }} />
          </Grid>
        </Grid>

        {isConnected && (
          <Box mt={2}>
            <Button variant="contained" color={isMuted ? "secondary" : "success"} onClick={toggleMute} sx={{ mr: 2 }}>
              {isMuted ? <MicOff /> : <Mic />} Mute
            </Button>
            <Button variant="contained" color={isVideoOff ? "secondary" : "success"} onClick={toggleVideo} sx={{ mr: 2 }}>
              {isVideoOff ? <VideocamOff /> : <Videocam />} Video
            </Button>
            <Button variant="contained" color="error" onClick={endCall}>
              <CallEnd /> End Call
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VideoChat;
