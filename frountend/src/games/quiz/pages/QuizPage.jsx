import React from "react";
import JoinBanner from "../Components/JoinBanner";
import ResultBanner from "../Components/ResultBanner";
import ReusableQuiz from "../Components/ReusableQuiz";
import useContestStore from "../../../Store/useContestStore";

const QuizPage = () => {
  const { joinResult, completeResult } = useContestStore();

  const contestId = joinResult?.contest?._id;
  const fullName = joinResult?.user?.fullname;
  const userId = joinResult?.user?._id;

  return (
    <>
      {/* Show Join Banner while waiting for other player */}
      {joinResult && !completeResult && (
        <JoinBanner
          contestId={contestId}
          fullName={fullName}
          userId={userId}
          redirectTo={`/quiz/${contestId}`}
        />
      )}

      {/* Show Quiz when ready */}
      <div className="min-h-screen bg-gray-50 py-10">
        <ReusableQuiz />
      </div>

      {/* Optional: Show Result Banner as popup */}
      {completeResult && (
        <ResultBanner
          winnerName={completeResult?.winner?.fullName}
          loserName={completeResult?.loser?.fullName}
        />
      )}
    </>
  );
};

export default QuizPage;
