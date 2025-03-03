import React, { useState, useRef, useEffect } from "react";
import Peer from "peerjs";

const VideoChat = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [call, setCall] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const userVideoRef = useRef();
  const peerVideoRef = useRef();

  useEffect(() => {
    const newPeer = new Peer();
    newPeer.on("open", (id) => {
      setPeerId(id);
    });

    newPeer.on("call", (incomingCall) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((userStream) => {
          setStream(userStream);
          userVideoRef.current.srcObject = userStream;
          incomingCall.answer(userStream);
          incomingCall.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
            peerVideoRef.current.srcObject = remoteStream;
          });
        });
      setCall(incomingCall);
    });

    setPeer(newPeer);
  }, []);

  const startCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((userStream) => {
        setStream(userStream);
        userVideoRef.current.srcObject = userStream;

        const outgoingCall = peer.call(remotePeerId, userStream);
        outgoingCall.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          peerVideoRef.current.srcObject = remoteStream;
        });

        setCall(outgoingCall);
      });
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
    }
  };

  const endCall = () => {
    if (call) {
      call.close();
      setCall(null);
      setRemoteStream(null);
      peerVideoRef.current.srcObject = null;
    }
  };

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    alert("Peer ID copied!");
  };

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <h2>Video Chat</h2>
      </nav>

      {/* Video Feeds */}
      <div className="video-container">
        <div className="video-box">
          <h3>User 1</h3>
          <video ref={userVideoRef} autoPlay playsInline />
        </div>
        <div className="video-box">
          <h3>User 2</h3>
          <video ref={peerVideoRef} autoPlay playsInline />
        </div>
      </div>

      {/* Peer ID Section */}
      <div className="controls">
        <p>My ID: {peerId} <button className="primary" onClick={copyPeerId}>Copy</button></p>
        <input
          type="text"
          placeholder="Enter Peer ID to call"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
        />
        <button className="primary" onClick={startCall}>Call</button>
      </div>

      {/* Call Controls */}
      <div className="controls">
        <button className="secondary" onClick={toggleMute}>Mute</button>
        <button className="secondary" onClick={toggleVideo}>Video Off</button>
        <button className="danger" onClick={endCall}>End Call</button>
      </div>
    </div>
  );
};

export default VideoChat;
