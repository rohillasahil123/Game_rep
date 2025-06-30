import React from "react";
import { Routes, Route } from "react-router-dom";
import QuizSelection from "./pages/QuizSelection";
import QuizPage from "./pages/QuizPage";

const QuizRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<QuizSelection />} />  {/* means /quiz */}
      <Route path="play" element={<QuizPage />} />     {/* means /quiz/play */}
    </Routes>
  );
};

export default QuizRoutes;
