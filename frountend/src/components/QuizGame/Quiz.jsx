import { useState, useEffect } from 'react';
import axios from 'axios';

function Quiz() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);

  const fetchQuestions = async () => {
    const res = await axios.get("http://localhost:5000/api/quiz/questions");
    setQuestions(res.data);
    setAnswers(Array(res.data.length).fill(""));
  };

  const handleSubmit = async () => {
    const res = await axios.post("http://localhost:5000/api/quiz/submit", {
      userId: user._id,
      answers,
    });
    setScore(res.data.score);
    setUser({ ...user, walletBalance: res.data.walletBalance });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎮 Quiz Game</h1>

      {!user && (
        <button
          className="bg-green-500 text-white px-4 py-2 mb-4"
          onClick={async () => {
            const res = await axios.post("http://localhost:5000/api/users/signup", {
              fullname: "User", email: "user@example.com", password: "123456"
            });
            setUser(res.data.user);
          }}
        >
          Create Account
        </button>
      )}

      {user && (
        <>
          <p className="mb-2">💰 Wallet: ₹{user.walletBalance}</p>

          {!questions.length && (
            <button onClick={fetchQuestions} className="bg-blue-500 text-white px-4 py-2">
              Start Quiz (₹5)
            </button>
          )}

          {questions.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold">{q.question}</p>
              {q.options.map((opt, j) => (
                <label key={j} className="block">
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={opt}
                    onChange={() => {
                      const newAns = [...answers];
                      newAns[i] = opt;
                      setAnswers(newAns);
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          {questions.length > 0 && (
            <button onClick={handleSubmit} className="bg-purple-500 text-white px-4 py-2">
              Submit Quiz
            </button>
          )}

          {score !== null && <p className="mt-4">You scored: {score}/5</p>}
        </>
      )}
    </div>
  );
}

export default Quiz;
