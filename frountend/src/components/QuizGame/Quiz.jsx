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
  const [timer, setTimer] = useState(5);
  const [skippedCount, setSkippedCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/quiz/random", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

  useEffect(() => {
    if (showAnswer || leaderboard) return;
    if (timer === 0) {
      handleNext(true); // auto-submit
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showAnswer]);

  const handleNext = async (auto = false) => {
    if (transitioning) return;

    const answer = auto ? null : selected;

    setShowAnswer(true);
    setTransitioning(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/quiz/submit-answer",
        {
          quizId,
          questionText: questions[current].question,
          selectedOption: answer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLastCorrectAnswer(res.data.correctAnswer);

      if (res.data.correct) {
        setScore((prev) => prev + 10);
        setSkippedCount(0);
      } else if (!answer) {
        setSkippedCount((prev) => prev + 1);
      } else {
        setSkippedCount(0);
      }

      setTimeout(() => {
        if (skippedCount >= 2 && !answer) {
          alert("❌ लगातार 3 सवाल छोड़े गए। आप गेम से बाहर हो गए हैं।");
          navigate("/");
          return;
        }

        if (current < questions.length - 1) {
          setCurrent((prev) => prev + 1);
          setSelected(null);
          setShowAnswer(false);
          setLastCorrectAnswer(null);
          setTransitioning(false);
          setTimer(5);
        } else {
          fetchLeaderboard();
        }
      }, 1500);
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
      <h1 className="text-xl font-bold mb-4 text-blue-700 flex justify-between">
        <span>Question {current + 1} of {questions.length}</span> <span>&nbsp; ⏱ {timer}s </span>
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
          onClick={() => handleNext(false)}
          disabled={showAnswer}
        >
          {current < questions.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
