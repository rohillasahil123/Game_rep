import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useContestStore from "../../Store/useContestStore";

const QuizContestJoinBanner = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const { joinResult } = useContestStore();
  const contestId = joinResult?.contest?._id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!contestId) return;

    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/contest/${contestId}/players`);
        setPlayers(res.data.players);
      } catch (err) {
        console.error("Error fetching players:", err);
      }
    };

    // ✅ Fetch immediately
    fetchPlayers();

    // ✅ Polling every 2 seconds
    const interval = setInterval(() => {
      fetchPlayers();
    }, 2000);

    // ✅ Stop polling if both players joined
    if (players.length === 2) {
      clearInterval(interval);
      setTimeout(() => {
        navigate("/quiz/gk");
      }, 1500); // 1.5 sec delay for UI
    }

    return () => clearInterval(interval);
  }, [contestId, players, navigate]);

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black bg-opacity-40 z-50">
      {loading ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-300 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium">Waiting for players to join...</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl p-6 w-[90%] max-w-md border-2 border-blue-400 text-center animate-scale-up">
          <h2 className="text-2xl font-bold text-blue-700 mb-5">🎮 Contest Ready!</h2>
          <div className="flex justify-between items-center gap-6">
            {players.length === 2 ? (
              <>
                <div className="flex-1 text-center">
                  <div className="text-xl font-semibold text-gray-800">🚹 {players[0]?.fullName}</div>
                  <div className="text-sm text-green-600 mt-1">✅ Joined</div>
                </div>
                <div className="text-3xl font-extrabold text-red-500">VS</div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-semibold text-gray-800">🚹 {players[1]?.fullName}</div>
                  <div className="text-sm text-green-600 mt-1">✅ Joined</div>
                </div>
              </>
            ) : players.length === 1 ? (
              <>
                <div className="flex-1 text-center">
                  <div className="text-xl font-semibold text-gray-800">🚹 {players[0]?.fullName}</div>
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
      )}
    </div>
  );
};

export default QuizContestJoinBanner;
