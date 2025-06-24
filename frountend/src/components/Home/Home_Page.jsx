// src/pages/Homepage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
const Home_page = () => {
  const navigate = useNavigate()



 const GameData = [
  { name: 'Quiz Game', desc: 'Answer questions & earn rewards', route: '/quiz' },
  { name: 'Color Trading', desc: 'Buy low, sell high & profit', route: '/color-trading' },
  { name: 'Spin the Wheel', desc: 'Spin daily & win up to ₹100', route: '/spin-wheel' },
  { name: 'Scratch Card', desc: 'Scratch & get instant cash', route: '/scratch-card' },
  { name: 'Number Guess', desc: 'Guess right, win double', route: '/number-guess' },
  { name: 'Coin Flip', desc: 'Pick heads/tails & double your bet', route: '/coin-flip' },
  { name: 'Puzzle Game', desc: 'Solve puzzles & win prizes', route: '/puzzle' },
  { name: 'Tap-to-Win', desc: 'Tap fast, score high, earn', route: '/tap-to-win' },
  { name: 'Memory Match', desc: 'Match cards & get rewards', route: '/memory-match' },
  { name: 'Flappy Jump', desc: 'Score high & top leaderboard', route: '/bird' },
];



  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold">Welcome to QuizMaster</h1>
        <p className="mt-4 text-lg md:text-xl">Test your knowledge. Climb the leaderboard. Win rewards!</p>
        <button className="mt-6 px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-200 transition">
          Start Quiz
        </button>
      </section>



<section className="py-12 px-4 md:px-12">
  <h2 className="text-2xl font-bold mb-6 text-center">Play & Earn – Choose Your Game</h2>
<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
  {GameData .map((game, idx) => (
      <div key={idx} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center">
        <div className="w-full h-24 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Game Image</span>
        </div>
        <h3 className="text-base font-bold">{game.name}</h3>
        <p className="text-sm text-gray-600">{game.desc}</p>
        <button className="mt-3 px-3 py-1 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm"   onClick={() => navigate(game.route)}>
          Play Now
        
        </button>
      </div>
    ))}
  </div>
</section>


      {/* How to Play */}
      <section className="py-12 bg-white text-center px-4 md:px-20">
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div>
            <h3 className="font-bold text-lg mb-2">1. Sign Up</h3>
            <p>Create your free account to get started.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">2. Select Quiz</h3>
            <p>Pick a quiz from your favorite category.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">3. Compete</h3>
            <p>Answer questions and aim for the leaderboard.</p>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-12 bg-gray-100 text-center px-4 md:px-12">
        <h2 className="text-2xl font-bold mb-6">Top Performers</h2>
        <div className="max-w-md mx-auto">
          <table className="w-full text-left bg-white rounded-xl shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Sahil', score: 98 },
                { name: 'Riya', score: 92 },
                { name: 'Arjun', score: 88 },
              ].map((player, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{player.name}</td>
                  <td className="px-4 py-2">{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p>© 2025 QuizMaster. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default Home_page;
