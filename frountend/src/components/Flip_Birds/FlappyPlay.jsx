import React, { useState, useEffect, useRef } from "react";

const FlappyPlay = () => {
  const [birdPosition, setBirdPosition] = useState(300);
  const [gravity, setGravity] = useState(6);
  const [obstacleLeft, setObstacleLeft] = useState(500);
  const [obstacleHeight, setObstacleHeight] = useState(200);
  const [score, setScore] = useState(0);
  const gameContainerRef = useRef(null);
  const gameInterval = useRef(null);

  const gameHeight = 600;
  const gameWidth = 400;
  const birdSize = 30;
  const obstacleWidth = 40;
  const gap = 150;

  // Gravity effect
  useEffect(() => {
    gameInterval.current = setInterval(() => {
      setBirdPosition((prev) => prev + gravity);
    }, 24);
    return () => clearInterval(gameInterval.current);
  }, []);

  // Jump on key press
  const jump = () => {
    setBirdPosition((prev) => (prev - 60 < 0 ? 0 : prev - 60));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Obstacle movement
  useEffect(() => {
    let obstacleInterval = setInterval(() => {
      setObstacleLeft((prev) => {
        if (prev < -obstacleWidth) {
          setScore((s) => s + 1);
          setObstacleHeight(Math.floor(Math.random() * 300));
          return gameWidth;
        } else {
          return prev - 5;
        }
      });
    }, 24);
    return () => clearInterval(obstacleInterval);
  }, []);

  // Collision Detection
  useEffect(() => {
    const hasCollided =
      birdPosition > gameHeight ||
      (obstacleLeft < birdSize + 20 &&
        (birdPosition < obstacleHeight ||
          birdPosition > obstacleHeight + gap));

    if (hasCollided) {
      alert(`Game Over! Score: ${score}`);
      window.location.reload();
    }
  }, [birdPosition, obstacleLeft]);

  return (
    <div
      ref={gameContainerRef}
      style={{
        width: gameWidth,
        height: gameHeight,
        backgroundColor: "#70c5ce",
        overflow: "hidden",
        position: "relative",
        margin: "auto",
        marginTop: 30,
        border: "3px solid black",
        borderRadius: "10px",
      }}
    >
      {/* Bird */}
      <div
        style={{
          position: "absolute",
          width: birdSize,
          height: birdSize,
          backgroundColor: "yellow",
          borderRadius: "50%",
          top: birdPosition,
          left: 50,
        }}
      ></div>

      {/* Top Pipe */}
      <div
        style={{
          position: "absolute",
          height: obstacleHeight,
          width: obstacleWidth,
          backgroundColor: "green",
          left: obstacleLeft,
          top: 0,
        }}
      ></div>

      {/* Bottom Pipe */}
      <div
        style={{
          position: "absolute",
          height: gameHeight - obstacleHeight - gap,
          width: obstacleWidth,
          backgroundColor: "green",
          left: obstacleLeft,
          top: obstacleHeight + gap,
        }}
      ></div>

      {/* Score */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 20,
          fontSize: 24,
          fontWeight: "bold",
          color: "white",
        }}
      >
        {score}
      </div>
    </div>
  );
};

export default FlappyPlay;
