import React, { useEffect, useState } from "react";

const QuizContestJoinBanner = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate 2 seconds loader
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black bg-opacity-40 z-50">
      {loading ? (
        // Loader section
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-300 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium">Waiting for players to join...</p>
        </div>
      ) : (
        // Banner section
        <div className="bg-white shadow-xl rounded-xl p-6 w-[90%] max-w-md border-2 border-blue-400 text-center animate-scale-up">
          <h2 className="text-2xl font-bold text-blue-700 mb-5">🎮 Contest Ready!</h2>
          <div className="flex justify-between items-center gap-6">
            <div className="flex-1 text-center">
              <div className="text-xl font-semibold text-gray-800">🚹 Rahul</div>
              <div className="text-sm text-green-600 mt-1">✅ Joined</div>
            </div>
            <div className="text-3xl font-extrabold text-red-500">VS</div>
            <div className="flex-1 text-center">
              <div className="text-xl font-semibold text-gray-800">🚹 Sahil</div>
              <div className="text-sm text-green-600 mt-1">✅ Joined</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizContestJoinBanner;
