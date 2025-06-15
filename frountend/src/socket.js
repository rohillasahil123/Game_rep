// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (token) => {
  socket = io("http://localhost:5000", {
    auth: { token },
  });

  return socket;
};

export const getSocket = () => socket;
