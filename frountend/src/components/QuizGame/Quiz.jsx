import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/quiz/random");
        setQuestions(res.data.questions);
        setQuizId(res.data.quizId);
      } catch (err) {
        console.error("Error loading quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleNext = async () => {
    if (transitioning) return;
    if (!selected) {
      setError("Please select an option!");
      return;
    }

    setError("");
    setShowAnswer(true);
    setTransitioning(true);

    try {
      const token = localStorage.getItem("token"); // ✅ get token from localStorage

      const res = await axios.post(
        "http://localhost:5000/quiz/submit-answer",
        {
          quizId,
          questionText: questions[current].question,
          selectedOption: selected,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Send token in Authorization header
          },
        }
      );

      setLastCorrectAnswer(res.data.correctAnswer);
      if (res.data.correct) setScore((prev) => prev + 10);

      setTimeout(() => {
        if (current < questions.length - 1) {
          setCurrent((prev) => prev + 1);
          setSelected(null);
          setShowAnswer(false);
          setLastCorrectAnswer(null);
          setTransitioning(false);
        } else {
          fetchLeaderboard();
        }
      }, 2000);
    } catch (err) {
      console.error("Submit answer error:", err);
      setTransitioning(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/quiz/leaderboard/${quizId}`);
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading Quiz...</div>;

  if (leaderboard) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-green-600 text-center">🏆 Final Leaderboard</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">Rank</th>
              <th className="p-2">Player</th>
              <th className="p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{player.name || "Player"}</td>
                <td className="p-2">{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-center text-blue-600 font-semibold">🎉 Your Score: {score}</p>
        <div className="text-center mt-4">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4 text-blue-700">
        Question {current + 1} of {questions.length}
      </h1>
      <h2 className="text-lg font-semibold mb-4">{questions[current]?.question}</h2>

      <div className="space-y-3 mb-4">
        {questions[current]?.options.map((opt, i) => {
          const isCorrect = showAnswer && opt === lastCorrectAnswer;
          const isWrong = showAnswer && opt === selected && opt !== lastCorrectAnswer;
          return (
            <div
              key={i}
              onClick={() => !showAnswer && setSelected(opt)}
              className={`border px-4 py-2 rounded-xl cursor-pointer transition duration-200
                ${selected === opt ? "font-semibold" : ""}
                ${isCorrect ? "bg-green-100 border-green-500 text-green-800" : ""}
                ${isWrong ? "bg-red-100 border-red-500 text-red-800" : ""}
                ${!isCorrect && !isWrong && selected === opt ? "bg-blue-100 border-blue-500 text-blue-800" : ""}
                ${!selected ? "bg-gray-50 border-gray-300 hover:bg-blue-50" : ""}
              `}
            >
              {opt}
            </div>
          );
        })}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex justify-end">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
          onClick={handleNext}
        >
          {current < questions.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
