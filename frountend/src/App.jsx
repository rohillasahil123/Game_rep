import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './components/Auth/Signup'
import Login from './components/Auth/Login'
import Home_page from './components/Home/Home_Page'
import Header_Page from './components/Pages/Header_page'
import CricketDashboard from './components/Sports/CricketDashboard'
import Quiz from './components/QuizGame/Quiz'
import QuizSelection from './components/QuizGame/QuizCategories'


const App = () => {
  return (
  <>
  <Header_Page/>
    <Routes>
    <Route path='/signup'  element={<Signup/>}  /> 
       <Route path='/login'  element={<Login/>}  /> 
       <Route  path='/' element={<Home_page/>} />
       <Route path='/cricket' element={<CricketDashboard/>} />
       <Route path='/quiz' element={ <QuizSelection/> } ></Route>

    </Routes>
    
  </>    
  )
}


export default App