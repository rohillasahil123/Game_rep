import { io } from "socket.io-client";

let socket = null;

// ✅ Initialize Socket
export const initializeSocket = (token) => {
const socket = io("https://foodenergy.shop", {
  transports: ["websocket"],
  auth: { token },
  withCredentials: true,
});


  socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
  });

  return socket;
};

export const getSocket = () => socket;

//////////////////// ✅ QUIZ GAME EVENTS ////////////////////

export const joinQuizRoom = (roomId, fullname, userId) => {
  if (socket) {
    socket.emit("joinQuiz", { roomId, fullname, userId });
  }
};

export const finishGame = (roomId, score) => {
  if (socket) {
    socket.emit("gameFinished", { roomId, score });
  }
};

export const onPlayerJoined = (callback) => {
  if (socket) socket.on("playerJoined", callback);
};

export const onPlayerLeft = (callback) => {
  if (socket) socket.on("playerLeft", callback);
};

export const onGameResult = (callback) => {
  if (socket) socket.on("gameResult", callback);
};

//////////////////// ✅ FLAPPY BIRD EVENTS ////////////////////

export const joinFlappyRoom = (roomId, fullname, userId) => {
  if (socket) {
    socket.emit("joinFlappy", { roomId, fullname, userId });
  }
};

export const finishFlappyGame = (roomId, score) => {
  if (socket) {
    socket.emit("flappyOver", { roomId, score });
  }
};

export const onFlappyStart = (callback) => {
  if (socket) socket.on("startFlappyGame", callback);
};

export const onFlappyResult = (callback) => {
  if (socket) socket.on("flappyResult", callback);
};
