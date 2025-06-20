import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useContestStore from "../../Store/useContestStore";
import {
  getSocket,
  joinQuizRoom,
  onPlayerJoined,
} from "../../socket";

const QuizContestJoinBanner = () => {
  const [players, setPlayers] = useState([]);
  const { joinResult } = useContestStore();
  const contestId = joinResult?.contest?._id;
  const currentUser = joinResult?.contest?.players?.[joinResult?.contest?.players.length - 1];
  const fullName = currentUser?.fullName || "You";
  const userId = currentUser?.userId;
  const navigate = useNavigate();

  useEffect(() => {
    if (!contestId || !fullName || !userId) return;

    // ✅ Join room
    joinQuizRoom(contestId, fullName, userId);

    // ✅ Listen for players in room
    onPlayerJoined(({ players }) => {
      setPlayers(players);
    });

    // ✅ Cleanup
    return () => {
      const socket = getSocket();
      if (socket) socket.off("playerJoined");
    };
  }, [contestId, fullName, userId]);

  // ✅ Start quiz 2s after both joined
  useEffect(() => {
    if (players.length === 2) {
      const timer = setTimeout(() => {
        navigate("/quiz/question");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [players, navigate]);

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white shadow-xl rounded-xl p-6 w-[90%] max-w-md border-2 border-blue-400 text-center animate-scale-up">
        <h2 className="text-2xl font-bold text-blue-700 mb-5">🎮 Contest Ready!</h2>
        <div className="flex justify-between items-center gap-6">
          {players.length === 2 ? (
            <>
              <div className="flex-1 text-center">
                <div className="text-xl font-semibold text-gray-800">🚹 {players[0]?.fullname}</div>
                <div className="text-sm text-green-600 mt-1">✅ Joined</div>
              </div>
              <div className="text-3xl font-extrabold text-red-500">VS</div>
              <div className="flex-1 text-center">
                <div className="text-xl font-semibold text-gray-800">🚹 {players[1]?.fullname}</div>
                <div className="text-sm text-green-600 mt-1">✅ Joined</div>
              </div>
            </>
          ) : players.length === 1 ? (
            <>
              <div className="flex-1 text-center">
                <div className="text-xl font-semibold text-gray-800">🚹 {players[0]?.fullname}</div>
                <div className="text-sm text-green-600 mt-1">✅ Joined</div>
              </div>
              <div className="text-3xl font-extrabold text-red-500">VS</div>
              <div className="flex-1 text-center">
                <div className="text-xl font-semibold text-gray-400 animate-pulse">🕵 Finding Player...</div>
                <div className="text-sm text-yellow-500 mt-1">⏳ Waiting</div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 font-medium">Waiting for players...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizContestJoinBanner;
