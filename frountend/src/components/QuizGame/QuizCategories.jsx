import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const quizCategories = [
  { title: "General Knowledge", route: "/quiz/gk", color: "bg-blue-500", api: "/quiz/join" },
  { title: "Sports Quiz", route: "/quiz/sports", color: "bg-green-500", api: "/api/quiz/sports" },
  { title: "Filmy Quiz", route: "/quiz/filmy", color: "bg-yellow-500", api: "/api/quiz/filmy" },
  { title: "Science Quiz", route: "/quiz/science", color: "bg-purple-500", api: "/api/quiz/science" },
  { title: "History Quiz", route: "/quiz/history", color: "bg-red-500", api: "/api/quiz/history" },
  { title: "Maths Quiz", route: "/quiz/maths", color: "bg-pink-500", api: "/api/quiz/maths" },
  { title: "Computer Quiz", route: "/quiz/computer", color: "bg-indigo-500", api: "/api/quiz/computer" },
  { title: "Coding Quiz", route: "/quiz/coding", color: "bg-rose-500", api: "/api/quiz/coding" },
  { title: "English Quiz", route: "/quiz/english", color: "bg-lime-500", api: "/api/quiz/english" },
  { title: "Animal Quiz", route: "/quiz/animals", color: "bg-teal-500", api: "/api/quiz/animals" },
  { title: "Food Quiz", route: "/quiz/food", color: "bg-orange-500", api: "/api/quiz/food" },
  { title: "Travel Quiz", route: "/quiz/travel", color: "bg-cyan-500", api: "/api/quiz/travel" },
  { title: "Current Affairs", route: "/quiz/current", color: "bg-emerald-500", api: "/api/quiz/current" },
  { title: "Personality Quiz", route: "/quiz/personality", color: "bg-violet-500", api: "/api/quiz/personality" },
];

const QuizSelection = () => {
  const navigate = useNavigate();

  const handleQuizClick = async (quiz) => {
    try {
      const token = localStorage.getItem("token"); // Get token
      const fullName = localStorage.getItem("fullName") || "Player"; // Or ask user

      const response = await axios.post(
        "http://localhost:5000" + quiz.api,
        { fullName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Success:", response.data);
      navigate(quiz.route);
    } catch (error) {
      console.error(`API error for ${quiz.title}:`, error.response?.data || error.message);
      alert(`Failed to join ${quiz.title} quiz`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">🎯 Choose Your Quiz Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
        {quizCategories.map((quiz, index) => (
          <div
            key={index}
            className={`cursor-pointer rounded-xl p-6 shadow-xl hover:scale-105 transform transition duration-300 ${quiz.color}`}
            onClick={() => handleQuizClick(quiz)}
          >
            <div className="h-24 w-full bg-white bg-opacity-20 rounded mb-4 flex items-center justify-center">
              <span className="text-sm text-white opacity-80">📘 Image</span>
            </div>
            <h2 className="text-lg font-semibold text-center text-white">{quiz.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizSelection;
