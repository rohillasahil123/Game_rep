import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket, joinQuizRoom, onPlayerJoined } from "../../../socket";

const JoinBanner = ({ contestId, fullName, userId, redirectTo }) => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!contestId || !fullName || !userId) return;

    joinQuizRoom(contestId, fullName, userId);

    onPlayerJoined(({ players }) => {
      setPlayers(players);
    });

    return () => {
      const socket = getSocket();
      if (socket) socket.off("playerJoined");
    };
  }, [contestId, fullName, userId]);

  useEffect(() => {
    if (players.length === 2) {
      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);
    }
  }, [players, navigate, redirectTo]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-[90%]">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Waiting for Players</h2>
        <div className="flex justify-around">
          <div>
            <p>{players[0]?.fullname || "You"}</p>
            <p className="text-green-500">✅ Joined</p>
          </div>
          <div className="text-2xl font-bold">VS</div>
          <div>
            {players[1] ? (
              <>
                <p>{players[1].fullname}</p>
                <p className="text-green-500">✅ Joined</p>
              </>
            ) : (
              <>
                <p className="animate-pulse text-gray-400">Waiting...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinBanner;
