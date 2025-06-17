import React from "react";
import { useNavigate } from "react-router-dom";

const quizCategories = [
  { title: "General Knowledge", route: "/quiz/gk", color: "bg-blue-500" },
  { title: "Sports Quiz", route: "/quiz/sports", color: "bg-green-500" },
  { title: "Filmy Quiz", route: "/quiz/filmy", color: "bg-yellow-500" },
  { title: "Science Quiz", route: "/quiz/science", color: "bg-purple-500" },
  { title: "History Quiz", route: "/quiz/history", color: "bg-red-500" },
  { title: "Maths Quiz", route: "/quiz/maths", color: "bg-pink-500" },
  { title: "Computer Quiz", route: "/quiz/computer", color: "bg-indigo-500" },
  { title: "Coding Quiz", route: "/quiz/coding", color: "bg-rose-500" },
  { title: "English Quiz", route: "/quiz/english", color: "bg-lime-500" },
  { title: "Animal Quiz", route: "/quiz/animals", color: "bg-teal-500" },
  { title: "Food Quiz", route: "/quiz/food", color: "bg-orange-500" },
  { title: "Travel Quiz", route: "/quiz/travel", color: "bg-cyan-500" },
  { title: "Current Affairs", route: "/quiz/current", color: "bg-emerald-500" },
  { title: "Personality Quiz", route: "/quiz/personality", color: "bg-violet-500" },
];

const QuizSelection = () => {
  const navigate = useNavigate();

  const handleQuizClick = (quiz) => {
    navigate(quiz.route);
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
