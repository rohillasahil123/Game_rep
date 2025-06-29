import React from "react";
import { useNavigate } from "react-router-dom";
import useContestStore from "../../../Store/useContestStore";

const QuizSelection = () => {
  const navigate = useNavigate();
  const { joinQuiz } = useContestStore();

  const handleJoin = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    const contest = await joinQuiz(token); 
    if (contest) {
      navigate("/quiz/play");
    } else {
      alert("Failed to join contest");
    }
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg p-8 rounded-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">🎯 Join a Quiz Match</h1>
        <p className="mb-4 text-gray-600">Click the button below to find a match and begin your quiz.</p>
        <button
          onClick={handleJoin}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Join Quiz
        </button>
      </div>
    </div>
    </>
  );
};

export default QuizSelection;
