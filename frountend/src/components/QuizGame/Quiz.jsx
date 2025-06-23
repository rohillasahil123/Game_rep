import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useContestStore from "../../Store/useContestStore";



const TOTAL_QUESTIONS = 10;

const Quiz = () => {
  const navigate = useNavigate();
  const { joinResult, completeContest, completeResult } = useContestStore();
  const contestId = joinResult?.contest?._id;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [timer, setTimer] = useState(5);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${Api_URL}/v1/question`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.question) {
        setQuestions((prev) => [...prev, res.data.question]);
      }
    } catch (err) {
      console.error("❌ Error fetching question:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId, selectedAnswer) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${Api_URL}/v1/submit-answer`, {
        questionId,
        contestId,
        selectedAnswer
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.correct;
    } catch (err) {
      console.error("❌ Error submitting answer:", err);
      return false;
    }
  };

  useEffect(() => {
    if (contestId) {
      fetchQuestion();
    }
  }, [contestId]);

  useEffect(() => {
    if (showAnswer || leaderboard || loading) return;
    if (timer === 0) {
      handleNext(true);
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showAnswer, loading]);

  const handleNext = async (auto = false) => {
    if (transitioning || !questions[current]) return;

    const question = questions[current];
    const answer = auto ? null : selected;

    setShowAnswer(true);
    setTransitioning(true);

    const correct = await submitAnswer(question._id, answer);
    if (correct) setScore((prev) => prev + 10);
    setLastCorrectAnswer(question.correctAnswer);

    setTimeout(async () => {
      if (current + 1 < TOTAL_QUESTIONS) {
        setCurrent((prev) => prev + 1);
        setSelected(null);
        setShowAnswer(false);
        setLastCorrectAnswer(null);
        setTransitioning(false);
        setTimer(5);
        await fetchQuestion();
      } else {
        setLeaderboard("show");
      }
    }, 1500);
  };

  // ✅ Call completeContest API when quiz ends
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (leaderboard === "show" && contestId) {
      completeContest(contestId, token);
    }
  }, [leaderboard]);

  if (!contestId) {
    return (
      <div className="text-center mt-20 text-red-600 font-semibold">
        ⚠️ No contest joined. Please join a contest first.
      </div>
    );
  }

  if (loading || questions.length === 0) {
    return (
      <div className="text-center mt-20 text-blue-500 font-semibold">
        🔄 Loading Question...
      </div>
    );
  }

  // ✅ Show final result if completeResult is available
  if (leaderboard === "show" && completeResult) {
    const winner = completeResult.winner;
    const loser = completeResult.loser;

    return (
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-green-600 text-center">🏆 Final Leaderboard</h2>

        <table className="w-full text-left border mb-6">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">Player</th>
              <th className="p-2">Score</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t bg-green-50 font-semibold text-green-700">
              <td className="p-2">{winner.fullName}</td>
              <td className="p-2">{winner.score}</td>
              <td className="p-2">Winner 🥇</td>
            </tr>
            {loser && (
              <tr className="border-t bg-red-50 font-semibold text-red-700">
                <td className="p-2">{loser.fullName}</td>
                <td className="p-2">{loser.score}</td>
                <td className="p-2">Loser</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="text-center">
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

  const currentQuestion = questions[current];

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / TOTAL_QUESTIONS) * 100}%` }}
        ></div>
      </div>

      <h1 className="text-xl font-bold mb-4 text-blue-700 flex justify-between">
        <span>Question {current + 1} / {TOTAL_QUESTIONS}</span>
        <span>⏱ {timer}s</span>
      </h1>

      <h2 className="text-lg font-semibold mb-4">{currentQuestion?.question}</h2>

      <div className="space-y-3 mb-4">
        {currentQuestion?.options.map((opt, i) => {
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
      </div>

      <div className="flex justify-end">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
          onClick={() => handleNext(false)}
          disabled={showAnswer}
        >
          {current + 1 === TOTAL_QUESTIONS ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
