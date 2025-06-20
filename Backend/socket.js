let io;
const roomUsers = {};
const finishedPlayers = {}; 

const Wallet = require("./Models/Wallet_Model");

function initializeSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // ✅ Join Quiz Room
    socket.on("joinQuiz", ({ roomId, fullname, userId }) => {
      console.log("📥 joinQuiz called with:", { roomId, fullname, userId });

      if (!roomUsers[roomId]) roomUsers[roomId] = [];

      // Already full
      if (roomUsers[roomId].length >= 2) {
        console.log("❌ Room full:", roomId);
        socket.emit("roomFull", { message: "Room is already full." });
        return;
      }

      socket.join(roomId);
      roomUsers[roomId].push({ socketId: socket.id, fullname, userId });

      console.log(`✅ ${fullname} joined room ${roomId}`);
      console.log("👥 Current room users:", roomUsers[roomId]);

      io.to(roomId).emit("playerJoined", { players: roomUsers[roomId] });
    });

    // ✅ Player finishes the game
    socket.on("gameFinished", async ({ roomId, score }) => {
      const user = roomUsers[roomId]?.find(u => u.socketId === socket.id);
      if (!user) return;

      console.log(`🏁 ${user.fullname} finished game with score: ${score}`);

      if (!finishedPlayers[roomId]) finishedPlayers[roomId] = [];
      finishedPlayers[roomId].push({ ...user, score });

      // Wait until both players finish
      if (finishedPlayers[roomId].length === 2) {
        const [p1, p2] = finishedPlayers[roomId];
        let result = { winner: null, loser: null, draw: false };

        const entryFee = parseInt(roomId); // RoomId used as fee
        const totalPrize = entryFee * 2;
        const winnerPrize = Math.floor(totalPrize * 0.82);
        const systemCut = totalPrize - winnerPrize;

        if (p1.score > p2.score) {
          result.winner = p1;
          result.loser = p2;
        } else if (p2.score > p1.score) {
          result.winner = p2;
          result.loser = p1;
        } else {
          result.draw = true;
        }

        try {
          if (result.draw) {
            for (const player of [p1, p2]) {
              await Wallet.findOneAndUpdate(
                { userId: player.userId },
                {
                  $inc: { balance: entryFee },
                  $push: {
                    transactions: {
                      type: "credit",
                      amount: entryFee,
                      description: `Refund for draw in ₹${entryFee} room`,
                    },
                  },
                }
              );
            }
            console.log("↩️ Match draw: Refund issued to both players");
          } else {
            await Wallet.findOneAndUpdate(
              { userId: result.winner.userId },
              {
                $inc: { balance: winnerPrize },
                $push: {
                  transactions: {
                    type: "credit",
                    amount: winnerPrize,
                    description: `Won ₹${winnerPrize} in ₹${entryFee} room`,
                  },
                },
              }
            );

            await Wallet.findOneAndUpdate(
              { userId: result.loser.userId },
              {
                $push: {
                  transactions: {
                    type: "debit",
                    amount: entryFee,
                    description: `Lost ₹${entryFee} in ₹${entryFee} room`,
                  },
                },
              }
            );

            console.log(`🏆 ${result.winner.fullname} won ₹${winnerPrize}`);
          }
        } catch (err) {
          console.error("❌ Wallet update error:", err.message);
        }

        io.to(roomId).emit("gameResult", {
          ...result,
          players: finishedPlayers[roomId],
          winnerPrize,
          systemCut,
        });

        // Clean up
        delete finishedPlayers[roomId];
      }
    });

    // ✅ Handle Disconnection
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);

      for (const roomId in roomUsers) {
        const prevLength = roomUsers[roomId].length;
        roomUsers[roomId] = roomUsers[roomId].filter(
          (user) => user.socketId !== socket.id
        );

        if (prevLength !== roomUsers[roomId].length) {
          io.to(roomId).emit("playerLeft", {
            players: roomUsers[roomId],
          });

          if (roomUsers[roomId].length === 0) {
            delete roomUsers[roomId];
            delete finishedPlayers[roomId];
            console.log(`🧹 Cleaned up empty room: ${roomId}`);
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
