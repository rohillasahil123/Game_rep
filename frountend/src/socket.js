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

// ✅ Join a quiz room with roomId and fullname
export const joinQuizRoom = (roomId, fullname) => {
  if (socket) {
    socket.emit("joinQuiz", { roomId, fullname });
  }
};

// ✅ Send user's final score to backend
export const finishGame = (roomId, score) => {
  if (socket) {
    socket.emit("gameFinished", { roomId, score });
  }
};

// ✅ Listen when a player joins
export const onPlayerJoined = (callback) => {
  if (socket) {
    socket.on("playerJoined", callback);
  }
};

// ✅ Listen when a player leaves
export const onPlayerLeft = (callback) => {
  if (socket) {
    socket.on("playerLeft", callback);
  }
};

// ✅ Listen for game result (win/lose)
export const onGameResult = (callback) => {
  if (socket) {
    socket.on("gameResult", callback);
  }
};
