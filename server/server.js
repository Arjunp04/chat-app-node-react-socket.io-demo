import express from "express";
import { configDotenv } from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
configDotenv();

const secretKey = "jndvfdvfnnbrnbr";
const port = process.env.PORT || 8000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

io.on("connection", (socket) => {
  console.log("✅ New user connected having Id :", socket.id);

  socket.on("user-message", ({ username, message, room }) => {
    console.log({ username, message, room });
    socket.to(room).emit("receive-message", { username, message });
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ user disconnected :", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to server's home page");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "bscjisbvjfdbdas" }, secretKey);
  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

const user = false;
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (error) => {
    if (error) {
      return next(error);
    }

    const token = socket.request.cookies.token;
    if (!token) {
      return next(new Error("Authentication Error"));
    }

    const decoded = jwt.verify(token, secretKey);
    next();
  });
});

server.listen(port, () => {
  console.log(`⚡ Server is running on http://localhost:${port}`);
});
