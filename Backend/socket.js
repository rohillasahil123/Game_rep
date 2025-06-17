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
      if (!roomUsers[roomId]) roomUsers[roomId] = [];

      // ✅ Limit room to 2 players
      if (roomUsers[roomId].length >= 2) {
        socket.emit("roomFull", { message: "Room is already full." });
        return;
      }

      socket.join(roomId);
      roomUsers[roomId].push({ socketId: socket.id, fullname, userId });

      console.log(`✅ ${fullname} joined room ${roomId}`);
      io.to(roomId).emit("playerJoined", { players: roomUsers[roomId] });
    });

    // ✅ Player finishes the game
    socket.on("gameFinished", async ({ roomId, score }) => {
      const user = roomUsers[roomId]?.find(u => u.socketId === socket.id);
      if (!user) return;

      if (!finishedPlayers[roomId]) finishedPlayers[roomId] = [];
      finishedPlayers[roomId].push({ ...user, score });

      console.log(`🏁 ${user.fullname} finished with score ${score}`);

      // ✅ Continue only when both players finished
      if (finishedPlayers[roomId].length === 2) {
        const [p1, p2] = finishedPlayers[roomId];
        let result = { winner: null, loser: null, draw: false };

        const entryFee = parseInt(roomId); // assumes roomId is the fee
        const totalPrize = entryFee * 2;
        const winnerPrize = Math.floor(totalPrize * 0.82); // 82%
        const systemCut = totalPrize - winnerPrize;

        // ✅ Determine winner/loser or draw
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
            // ✅ Refund both players
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
          } else {
            // ✅ Winner gets 82%, loser gets nothing (loss recorded)
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

        // ✅ Cleanup
        delete finishedPlayers[roomId];
      }
    });

    // ✅ User Disconnects
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);

      for (const roomId in roomUsers) {
        const prevLength = roomUsers[roomId].length;
        roomUsers[roomId] = roomUsers[roomId].filter(
          (user) => user.socketId !== socket.id
        );

        // ✅ Notify if someone left
        if (prevLength !== roomUsers[roomId].length) {
          io.to(roomId).emit("playerLeft", {
            players: roomUsers[roomId],
          });

          // ✅ Clean empty rooms
          if (roomUsers[roomId].length === 0) {
            delete roomUsers[roomId];
            delete finishedPlayers[roomId];
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
