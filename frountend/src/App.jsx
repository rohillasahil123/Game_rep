// App.jsx
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom"; 
import { Toaster } from "react-hot-toast";

// Auth
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";

// Pages
import Home_page from "./components/Home/Home_Page";
import Header_Page from "./components/Pages/Header_page";

// Games - Quiz
import QuizRoutes from "./games/quiz/QuizRoutes";
import QuizLeaderboard from "./components/QuizGame/QuizLeaderboard";
import GameResultBanner from "./games/quiz/Components/ResultBanner";

// Games - Flappy
import FlappyPlay from "./components/Flip_Birds/FlappyPlay";
import BirdContestList from "./components/Flip_Birds/BirdContestList";

import CricketDashboard from "./components/Sports/CricketDashboard";

// Private Route
import PrivateRoute from "./components/Private/PrivateRoute";

// Socket
import { initializeSocket } from "./socket";

// Demo
import Demo from "./components/QuizGame/Demo";

const App = () => {
  useEffect(() => {
    const socket = initializeSocket();
    console.log("Socket initialized");
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header_Page />
      <Toaster />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home_page />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<Demo />} />

          {/* ✅ Protected Routes */}
          <Route path="/cricket" element={<PrivateRoute><CricketDashboard /></PrivateRoute>} />
          <Route path="/quiz/*" element={<PrivateRoute><QuizRoutes /></PrivateRoute>} />
          <Route path="/quiz/leaderboard" element={<PrivateRoute><QuizLeaderboard /></PrivateRoute>} />
          <Route path="/quiz/join/win" element={<PrivateRoute><GameResultBanner /></PrivateRoute>} />
          <Route path="/bird" element={<PrivateRoute><FlappyPlay /></PrivateRoute>} />
          <Route path="/bird/list" element={<PrivateRoute><BirdContestList /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
