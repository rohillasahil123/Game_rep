// socket.js
import { io } from "socket.io-client";

let socket = null;

// ✅ Initialize socket connection
export const initializeSocket = (token) => {
  socket = io("http://localhost:5000", {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("✅ Connected to socket server:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket server");
  });

  return socket;
};

// ✅ Get existing socket instance
export const getSocket = () => socket;

// ✅ Join a quiz room
export const joinQuizRoom = (roomId, fullname, userId) => {
  if (socket) {
    socket.emit("joinQuiz", { roomId, fullname, userId });
  }
};

// ✅ Send final score
export const finishGame = (roomId, score) => {
  if (socket) {
    socket.emit("gameFinished", { roomId, score });
  }
};

// ✅ Listeners
export const onPlayerJoined = (callback) => {
  if (socket) {
    socket.on("playerJoined", callback);
  }
};

export const onPlayerLeft = (callback) => {
  if (socket) {
    socket.on("playerLeft", callback);
  }
};

export const onGameResult = (callback) => {
  if (socket) {
    socket.on("gameResult", callback);
  }
};
