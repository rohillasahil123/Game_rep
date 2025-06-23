import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCrown, FaCoins } from "react-icons/fa";
import useContestStore from "../../Store/useContestStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


const Api_URL = "https://foodenergy.shop"

const QuizContestList = () => {
  const [contests, setContests] = useState([]);
  const [joiningContestId, setJoiningContestId] = useState(null);

  const { joinContest, loading, joinResult, error } = useContestStore();
  const navigate = useNavigate();

  // ✅ Fetch contests on load
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get(`${Api_URL}/v1/get-contests`);
        setContests(response.data.contests);
      } catch (error) {
        console.error("Error fetching contests:", error);
        toast.error("Failed to fetch contests");
      }
    };
    fetchContests();
  }, []);

  // ✅ Join contest handler
  const HandleJoinContest = async (contestId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login first");

      setJoiningContestId(contestId);
      await joinContest(contestId, token);
      setJoiningContestId(null);

      toast.success("Joined successfully!");
      navigate("/quiz/banner");
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Failed to join contest");
      setJoiningContestId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] to-[#f9fafb] flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-12 text-center tracking-tight">
        🎯 Select Your Contest & Double Your Money
      </h1>

      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest, index) => (
          <div
            key={contest._id}
            className="relative bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col items-center text-center"
          >
            {index === 3 && (
              <div className="absolute top-0 left-0 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-tr-xl rounded-bl-xl">
                🔥 Most Played
              </div>
            )}

            <div className="bg-blue-100 p-3 rounded-full mb-4 shadow-sm">
              <FaCrown className="text-yellow-500 text-3xl" />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Entry Fee: <span className="text-blue-700">₹{contest.entryFee}</span>
            </h2>

            <p className="text-base text-gray-500 mb-4">
              Win: <span className="text-green-600 font-bold">₹{contest.prize}</span>
            </p>

            <div className="flex flex-wrap justify-center gap-2 text-xs font-medium text-gray-600 mb-4">
              <span className="bg-gray-100 px-3 py-1 rounded-full">2 Players</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Instant Pay</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">100% Legal</span>
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full mb-4">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: "50%" }}></div>
            </div>

            <button
              onClick={() => HandleJoinContest(contest._id)}
              className="mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm py-2.5 px-6 rounded-full flex items-center gap-2 shadow-lg"
            >
              <FaCoins className="text-yellow-300" />
              {joiningContestId === contest._id && loading ? "Joining..." : "Join Now"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-gray-500 text-center">
        🔒 Safe & Secure | 🏦 Real Money Payouts | ⚡ Instant Start
      </p>
    </div>
  );
};

export default QuizContestList;
