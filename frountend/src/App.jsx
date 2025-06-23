import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './components/Auth/Signup'
import Login from './components/Auth/Login'
import Home_page from './components/Home/Home_Page'
import Header_Page from './components/Pages/Header_page'
import CricketDashboard from './components/Sports/CricketDashboard'
import Quiz from './components/QuizGame/Quiz'
import QuizSelection from './components/QuizGame/QuizCategories'
import QuizContestJoinBanner from './components/QuizGame/QuizContestJoinBanner'
import QuizContestList from './components/QuizGame/QuizContestList'
import GameResultBanner from './components/QuizGame/GameResultBanner'
import QuizLeaderboard from './components/QuizGame/QuizLeaderboard'
import { initializeSocket } from "./socket"
import FlappyPlay from './components/Flip_Birds/FlappyPlay'
import BirdContestList from './components/Flip_Birds/BirdContestList'
import PrivateRoute from './components/PrivateRoute'  // ✅ import
import { Toaster } from 'react-hot-toast'

const App = () => {
  useEffect(() => {
    const socket = initializeSocket();
    console.log("Socket initialized")
  }, []);

  return (
    <>
      <Header_Page />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home_page />} />

        {/* ✅ Protected Routes */}
        <Route path="/cricket" element={<PrivateRoute><CricketDashboard /></PrivateRoute>} />
        
        <Route path="/quiz" element={<PrivateRoute><QuizSelection /></PrivateRoute>} />
        <Route path="/quiz/question" element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/quiz/banner" element={<PrivateRoute><QuizContestJoinBanner /></PrivateRoute>} />
        <Route path="/quiz/list" element={<PrivateRoute><QuizContestList /></PrivateRoute>} />
        <Route path="/quiz/join/win" element={<PrivateRoute><GameResultBanner /></PrivateRoute>} />
        <Route path="/quiz/leaderboard" element={<PrivateRoute><QuizLeaderboard /></PrivateRoute>} />
        
        <Route path="/bird" element={<PrivateRoute><FlappyPlay /></PrivateRoute>} />
        <Route path="/bird/list" element={<PrivateRoute><BirdContestList /></PrivateRoute>} />
        <Toaster/>
      </Routes>
    </>
  )
}

export default App
