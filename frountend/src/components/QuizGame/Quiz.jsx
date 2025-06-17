import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const navigate = useNavigate();

  const [questions] = useState([
    {
      question: "भारत की राजधानी क्या है?",
      options: ["मुंबई", "दिल्ली", "कोलकाता", "चेन्नई"],
      correctAnswer: "दिल्ली",
    },
    {
      question: "भारत का राष्ट्रीय पशु कौन सा है?",
      options: ["शेर", "चीता", "हाथी", "बाघ"],
      correctAnswer: "बाघ",
    },
    {
      question: "सौरमंडल का सबसे बड़ा ग्रह कौन सा है?",
      options: ["पृथ्वी", "बृहस्पति", "मंगल", "शनि"],
      correctAnswer: "बृहस्पति",
    },
  ]);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [timer, setTimer] = useState(5);
  const [skippedCount, setSkippedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    if (showAnswer || leaderboard) return;
    if (timer === 0) {
      handleNext(true);
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showAnswer]);

  const handleNext = (auto = false) => {
    if (transitioning) return;

    const answer = auto ? null : selected;
    const correct = questions[current].correctAnswer;

    setShowAnswer(true);
    setTransitioning(true);

    if (answer === correct) {
      setScore((prev) => prev + 10);
      setSkippedCount(0);
    } else if (!answer) {
      setSkippedCount((prev) => prev + 1);
    } else {
      setSkippedCount(0);
    }

    setLastCorrectAnswer(correct);

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
        setLeaderboard([
          { name: "You", score, status: "Completed" }
        ]);
      }
    }, 1500);
  };

  if (leaderboard) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-green-600 text-center">🏆 Final Result</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">Player</th>
              <th className="p-2">Score</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{player.name}</td>
                <td className="p-2">{player.score}</td>
                <td className="p-2 font-semibold text-blue-700">
                  {player.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <span>Question {current + 1} of {questions.length}</span> <span>⏱ {timer}s</span>
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
