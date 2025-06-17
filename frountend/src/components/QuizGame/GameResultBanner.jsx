import React from "react";
import { FaCrown, FaSadTear } from "react-icons/fa";

const GameResultBanner = ({ winnerName = "Player 1", loserName = "Player 2" }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-2xl px-6 py-8 w-[90%] max-w-xl text-center animate-fade-in">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6">🏆 Match Result</h2>

        <div className="flex items-center justify-between gap-6">
          {/* Winner Card */}
          <div className="flex-1 bg-green-100 border-2 border-green-500 rounded-xl p-4 shadow-md">
            <FaCrown className="text-yellow-500 text-4xl mx-auto mb-2" />
            <p className="text-lg font-bold text-green-800">{winnerName}</p>
            <p className="text-sm text-green-600">Winner</p>
          </div>

          <div className="text-2xl font-bold text-gray-500">VS</div>

          {/* Loser Card */}
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 opacity-70">
            <FaSadTear className="text-red-400 text-3xl mx-auto mb-2" />
            <p className="text-lg font-semibold text-red-600">{loserName}</p>
            <p className="text-sm text-red-500">Lost</p>
          </div>
        </div>

        <p className="mt-6 text-gray-500 text-sm">Better luck next time, {loserName}! 💪</p>
      </div>
    </div>
  );
};

export default GameResultBanner;
