import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const App = () => {
  const server = import.meta.env.VITE_APP_SERVER_URL;
  const socket = useMemo(
    () =>
      io(server, {
        withCredentials: true,
      }),
    []
  );

  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && room.trim() && username.trim()) {
      console.log(`message sent:`, { username, message, room });
      socket.emit("user-message", { username, message, room });
      setMessage("");
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      console.log(`room joined:`, roomName);
      socket.emit("join-room", roomName);
      setRoom(roomName);
      setRoomName("");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("user connected:", socket.id);
      setSocketId(socket.id);
    });

    socket.on("receive-message", (data) => {
      console.log("message received:", data);
      setAllMessages((allMessages) => [...allMessages, data]);
    });

    socket.on("welcome", (s) => {
      console.log(s);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <h3 style={{display:"flex",justifyContent:"center"}}>Use more than 2 different tabs to experience the chat</h3>
      <Container
        maxWidth="xl"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "50px",
        }}
      >
        <Box sx={{ height: 50 }} />
        <Box style={{ width: "40%" }}>
          <Typography variant="h3" component="div" gutterBottom>
            Welcome to Chat App
          </Typography>

          <Typography variant="h6" component="div" gutterBottom>
            <strong> Receiver Room Id : </strong>
            {socketId}
          </Typography>

          <form onSubmit={handleJoinRoom} style={{ marginBottom: "1rem" }}>
            <h4>Join a group</h4>
            <Stack spacing={2}>
              <TextField
                variant="outlined"
                id="outlined-basic"
                label="Group Name"
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);
                }}
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary">
                Join
              </Button>
            </Stack>
          </form>

          <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
            <Stack spacing={2}>
              <TextField
                variant="outlined"
                id="outlined-basic"
                label="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                fullWidth
              />
              <TextField
                variant="outlined"
                id="outlined-basic"
                label="Message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                fullWidth
              />
              <TextField
                variant="outlined"
                id="outlined-basic"
                label="Receiver Room Id"
                value={room}
                onChange={(e) => {
                  setRoom(e.target.value);
                }}
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary">
                Send
              </Button>
            </Stack>
          </form>
        </Box>

        <Box style={{ width: "55%" }}>
          <h4>Your Chats</h4>
          <Stack
            spacing={2}
            style={{
              backgroundColor: "#eaeaea",
              height: "60vh",
              overflowY: "scroll",
            }}
          >
            {allMessages.map((msg, i) => (
              <Typography
                key={i}
                variant="body1"
                component="div"
                style={{
                  backgroundColor: "#b6c1c5", // Light blue background color
                  color: "black", // White text color
                  padding: "10px 14px 10px 14px", // Padding around the content
                  borderRadius: "8px", // Rounded corners
                  maxWidth: "75%", // Limit width to 75% of container
                }}
              >
                <strong>{msg.username}:</strong> {msg.message}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Container>
    </>
  );
};

export default App;
