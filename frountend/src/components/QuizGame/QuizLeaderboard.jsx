import React from "react";
import { FaCrown, FaMedal } from "react-icons/fa";

const leaderboardData = [
  { id: 1, name: "Sahil", score: 95 },
  { id: 2, name: "Rahul", score: 88 },
  { id: 3, name: "Ankit", score: 80 },
  { id: 4, name: "Pooja", score: 75 },
  { id: 5, name: "Neha", score: 65 },
];

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-[#f9fafb] py-10 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">
        🏆 Quiz Leaderboard
      </h1>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-3 text-lg font-semibold">
          Top Players
        </div>

        <ul className="divide-y divide-gray-200">
          {leaderboardData.map((player, index) => (
            <li
              key={player.id}
              className={`flex items-center justify-between px-6 py-4 ${
                index === 0 ? "bg-yellow-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xl font-bold w-6 text-center ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-gray-600"
                      : index === 2
                      ? "text-orange-400"
                      : "text-gray-500"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="font-medium text-gray-800">{player.name}</span>
                {index === 0 && <FaCrown className="text-yellow-500 ml-1" />}
                {index === 1 && <FaMedal className="text-gray-500 ml-1" />}
                {index === 2 && <FaMedal className="text-orange-400 ml-1" />}
              </div>

              <span className="text-blue-700 font-semibold">{player.score} pts</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-gray-400 mt-6">🎯 Keep playing to reach the top!</p>
    </div>
  );
};

export default Leaderboard;
