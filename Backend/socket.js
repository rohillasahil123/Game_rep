const io = require("socket.io")(server, { cors: { origin: "*" } });
const quizRoomUsers = {};
const quizFinishedPlayers = {};
const flappyRoomUsers = {};
const flappyFinishedPlayers = {};

const Wallet = require("./Models/Wallet_Model");

function initializeSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    //////////////////// ✅ QUIZ GAME ////////////////////

    socket.on("joinQuiz", ({ roomId, fullname, userId }) => {
      if (!quizRoomUsers[roomId]) quizRoomUsers[roomId] = [];

      if (quizRoomUsers[roomId].length >= 2) {
        socket.emit("roomFull", { message: "Room is full" });
        return;
      }

      socket.join(roomId);
      quizRoomUsers[roomId].push({ socketId: socket.id, fullname, userId });

      io.to(roomId).emit("playerJoined", {
        players: quizRoomUsers[roomId],
      });
    });

    socket.on("gameFinished", async ({ roomId, score }) => {
      const user = quizRoomUsers[roomId]?.find(u => u.socketId === socket.id);
      if (!user) return;

      if (!quizFinishedPlayers[roomId]) quizFinishedPlayers[roomId] = [];
      quizFinishedPlayers[roomId].push({ ...user, score });

      if (quizFinishedPlayers[roomId].length === 2) {
        const [p1, p2] = quizFinishedPlayers[roomId];
        const entryFee = parseInt(roomId);
        const totalPrize = entryFee * 2;
        const winnerPrize = Math.floor(totalPrize * 0.82);
        const systemCut = totalPrize - winnerPrize;

        let result = { winner: null, loser: null, draw: false };

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
          }
        } catch (err) {
          console.error("❌ Wallet update error (quiz):", err.message);
        }

        io.to(roomId).emit("gameResult", {
          ...result,
          players: quizFinishedPlayers[roomId],
          winnerPrize,
          systemCut,
        });

        delete quizFinishedPlayers[roomId];
      }
    });

    //////////////////// ✅ FLAPPY BIRD GAME ////////////////////

    socket.on("joinFlappy", ({ roomId, fullname, userId }) => {
      if (!flappyRoomUsers[roomId]) flappyRoomUsers[roomId] = [];

      if (flappyRoomUsers[roomId].length >= 2) {
        socket.emit("roomFull", { message: "Room full." });
        return;
      }

      socket.join(roomId);
      flappyRoomUsers[roomId].push({ socketId: socket.id, fullname, userId });

      if (flappyRoomUsers[roomId].length === 2) {
        io.to(roomId).emit("startFlappyGame");
      }
    });

    socket.on("flappyOver", async ({ roomId, score }) => {
      const user = flappyRoomUsers[roomId]?.find(u => u.socketId === socket.id);
      if (!user) return;

      if (!flappyFinishedPlayers[roomId]) flappyFinishedPlayers[roomId] = [];
      flappyFinishedPlayers[roomId].push({ ...user, score });

      if (flappyFinishedPlayers[roomId].length === 2) {
        const [p1, p2] = flappyFinishedPlayers[roomId];
        const entryFee = parseInt(roomId);
        const totalPrize = entryFee * 2;
        const winnerPrize = Math.floor(totalPrize * 0.82);
        const systemCut = totalPrize - winnerPrize;

        let result = { winner: null, loser: null, draw: false };

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
                      description: `Refund for draw in Flappy ₹${entryFee} room`,
                    },
                  },
                }
              );
            }
          } else {
            await Wallet.findOneAndUpdate(
              { userId: result.winner.userId },
              {
                $inc: { balance: winnerPrize },
                $push: {
                  transactions: {
                    type: "credit",
                    amount: winnerPrize,
                    description: `Won ₹${winnerPrize} in Flappy ₹${entryFee} room`,
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
                    description: `Lost ₹${entryFee} in Flappy ₹${entryFee} room`,
                  },
                },
              }
            );
            await FlappyContest.updateOne(
              { roomId, "players.userId": result.winner?.userId },
              { $set: { "players.$.score": result.winner?.score, "players.$.isWinner": true } }
            );

            await FlappyContest.updateOne(
              { roomId, "players.userId": result.loser?.userId },
              { $set: { "players.$.score": result.loser?.score, "players.$.isWinner": false } }
            );
          }
        } catch (err) {
          console.error("❌ Wallet update error (flappy):", err.message);
        }

        io.to(roomId).emit("flappyResult", {
          ...result,
          players: flappyFinishedPlayers[roomId],
          winnerPrize,
          systemCut,
        });

        delete flappyFinishedPlayers[roomId];
        delete flappyRoomUsers[roomId];
      }
    });

    //////////////////// ✅ DISCONNECT ////////////////////

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);

      for (const roomId in quizRoomUsers) {
        quizRoomUsers[roomId] = quizRoomUsers[roomId].filter(u => u.socketId !== socket.id);
        if (quizRoomUsers[roomId].length === 0) delete quizRoomUsers[roomId];
        delete quizFinishedPlayers[roomId];
      }

      for (const roomId in flappyRoomUsers) {
        flappyRoomUsers[roomId] = flappyRoomUsers[roomId].filter(u => u.socketId !== socket.id);
        if (flappyRoomUsers[roomId].length === 0) delete flappyRoomUsers[roomId];
        delete flappyFinishedPlayers[roomId];
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
