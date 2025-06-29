import React, { useEffect, useState } from "react";

const ReusableQuiz = ({
  totalQuestions = 10,
  fetchQuestionFn,        // 👈 Question laane ke liye function
  submitAnswerFn,         // 👈 Answer submit karne ke liye function
  onComplete              // 👈 Quiz khatam hone ke baad kya karna hai
}) => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [timer, setTimer] = useState(5);
  const [loading, setLoading] = useState(false);

  // 🔄 Question fetch karna
  const getQuestion = async () => {
    setLoading(true);
    const newQ = await fetchQuestionFn();
    if (newQ) setQuestions((prev) => [...prev, newQ]);
    setLoading(false);
  };

  // 🧠 Answer submit karna
  const handleSubmit = async (questionId, selectedAnswer) => {
    return await submitAnswerFn(questionId, selectedAnswer);
  };

  useEffect(() => {
    getQuestion();
  }, []);

  useEffect(() => {
    if (showAnswer || loading) return;
    if (timer === 0) handleNext(true);

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

    const correct = await handleSubmit(question._id, answer);
    if (correct) setScore((prev) => prev + 10);
    setLastCorrectAnswer(question.correctAnswer);

    setTimeout(async () => {
      if (current + 1 < totalQuestions) {
        setCurrent((prev) => prev + 1);
        setSelected(null);
        setShowAnswer(false);
        setLastCorrectAnswer(null);
        setTransitioning(false);
        setTimer(5);
        await getQuestion();
      } else {
        // 🎯 Jab sab question ho jaaye
        onComplete({ score, questions });
      }
    }, 1500);
  };

  const currentQuestion = questions[current];

  if (loading || questions.length === 0) {
    return (
      <div className="text-center mt-20 text-blue-500 font-semibold">
        🔄 Question laa rahe hain...
      </div>
    );
  }

  return (
    <>
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <h1 className="text-xl font-bold mb-4 text-blue-700 flex justify-between">
        <span>प्रश्न {current + 1} / {totalQuestions}</span>
        <span>⏱ {timer}s</span>
      </h1>

      <h2 className="text-lg font-semibold mb-4">{currentQuestion?.question}</h2>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {currentQuestion?.options.map((opt, i) => {
          const isCorrect = showAnswer && opt === lastCorrectAnswer;
          const isWrong = showAnswer && opt === selected && opt !== lastCorrectAnswer;
          return (
            <div
              key={i}
              onClick={() => !showAnswer && setSelected(opt)}
              role="button"
              aria-pressed={selected === opt}
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
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          onClick={() => handleNext(false)}
          disabled={showAnswer}
        >
          {current + 1 === totalQuestions ? "Finish" : "Next"}
        </button>
      </div>
    </div>
    </>
  );
};

export default ReusableQuiz;
