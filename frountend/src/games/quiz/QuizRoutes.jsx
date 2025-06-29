import React from "react";
import { Routes, Route } from "react-router-dom";
import QuizSelection from "./pages/QuizSelection";
import QuizPage from "./pages/QuizPage";

const QuizRoutes = () => {
  return (
    <Routes>
      <Route path="/quiz" element={<QuizSelection />} />
      <Route path="/quiz/play" element={<QuizPage />} />
    </Routes>
  );
};

export default QuizRoutes;
