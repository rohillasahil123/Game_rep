import { useEffect, useState } from "react";
import { getSocket } from "../../socket"; 
const GameEndBanner = ({ onDone }) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    socket.on("gameResult", (data) => {
      setResult(data);

      setTimeout(() => {
        onDone(); 
      }, 3000);
    });

    return () => {
      socket.off("gameResult");
    };
  }, [onDone]);

  if (!result) return null;

  const { winner, loser, draw, players } = result;
  const socketId = localStorage.getItem("socketId");
  const me = players.find((p) => p.socketId === socketId);

  return (
    <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 z-50 text-center border-2 border-gray-200">
      {draw ? (
        <h2 className="text-xl font-bold text-yellow-500">🤝 Match Draw!</h2>
      ) : (
        <>
          <h2 className={`text-xl font-bold ${winner.socketId === socketId ? "text-green-600" : "text-red-500"}`}>
            {winner.socketId === socketId ? "🎉 You Won!" : "😢 You Lost!"}
          </h2>
          <p className="text-md mt-1">Your Score: {me?.score}</p>
        </>
      )}
    </div>
  );
};

export default GameEndBanner;
