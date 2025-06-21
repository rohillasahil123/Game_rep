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
import { initializeSocket } from "./socket";
import FlappyPlay from './components/Flip_Birds/FlappyPlay'


const App = () => {


   useEffect(() => {
  const socket = initializeSocket(); // call once
  console.log("56") 
}, []);
  return (
  <>


 
  <Header_Page/>
    <Routes>
    <Route path='/signup'  element={<Signup/>}  /> 
       <Route path='/login'  element={<Login/>}  /> 
       <Route  path='/' element={<Home_page/>} />
       <Route path='/cricket' element={<CricketDashboard/>} />
       <Route path='/quiz' element={ <QuizSelection/> } ></Route>
       <Route path='/quiz/question' element={<Quiz/>} />
       <Route   path='/quiz/banner' element={<QuizContestJoinBanner/>} ></Route>
       <Route   path='/quiz/list' element={ <QuizContestList/>} ></Route>
           <Route   path='/quiz/join/win' element={ <GameResultBanner/>} ></Route>
            <Route   path='/quiz/leaderboard' element={ <QuizLeaderboard/>} ></Route>
            <Route path='/bird' element={<FlappyPlay/>} ></Route>
    </Routes>
    
  </>    
  )
}


export default App