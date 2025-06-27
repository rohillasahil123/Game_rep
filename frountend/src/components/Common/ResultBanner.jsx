// components/Common/ResultBanner.jsx
import React from "react";
import { FaCrown, FaSadTear } from "react-icons/fa";

const ResultBanner = ({ winnerName, loserName }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-[90%] text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-green-600 mb-4">🏆 Match Result</h2>
        <div className="flex justify-between items-center">
          <div className="bg-green-100 p-3 rounded-xl w-[45%]">
            <FaCrown className="text-yellow-500 text-3xl mx-auto mb-2" />
            <p className="font-semibold">{winnerName}</p>
            <p className="text-green-600">Winner</p>
          </div>
          <div className="text-gray-500 font-bold text-xl">VS</div>
          <div className="bg-red-100 p-3 rounded-xl w-[45%]">
            <FaSadTear className="text-red-500 text-3xl mx-auto mb-2" />
            <p className="font-semibold">{loserName}</p>
            <p className="text-red-600">Loser</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultBanner;
