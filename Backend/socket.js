let io;
const roomUsers = {}; // ✅ roomId => [ { socketId, fullname } ]

function initializeSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    socket.on("joinQuiz", ({ roomId, fullname }) => {
      socket.join(roomId);

      // Track user in room
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }

      roomUsers[roomId].push({ socketId: socket.id, fullname });

      console.log(`✅ ${fullname} (${socket.id}) joined room: ${roomId}`);

      // Send updated user list to everyone in room
      io.to(roomId).emit("playerJoined", {
        players: roomUsers[roomId],
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);

      // Remove user from all rooms
      for (const roomId in roomUsers) {
        const prevCount = roomUsers[roomId].length;
        roomUsers[roomId] = roomUsers[roomId].filter(
          (user) => user.socketId !== socket.id
        );

        if (prevCount !== roomUsers[roomId].length) {
          console.log(`⚠️ Removed ${socket.id} from room: ${roomId}`);

          // Notify others in room
          io.to(roomId).emit("playerLeft", {
            players: roomUsers[roomId],
          });

          // Clean up empty room
          if (roomUsers[roomId].length === 0) {
            delete roomUsers[roomId];
          }
        }
      }
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
