import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './components/Auth/Signup'
import Login from './components/Auth/Login'


const App = () => {
  return (
  <>
  <BrowserRouter>
    <Routes>
    <Route path='/signup'  element={<Signup/>}  /> 
       <Route path='/login'  element={<Login/>}  /> 
    </Routes>
    </BrowserRouter>
  </>    
  )
}


export default App