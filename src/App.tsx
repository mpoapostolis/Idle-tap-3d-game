import React, { useEffect, useState } from "react";
import Game3D from "./components/Game3D";
import UI from "./components/UI";
import { useGameStore } from "./store/gameStore";
import { useSound } from "./hooks/use-sounds";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { helpers, damageMonster, tickTimer } = useGameStore();
  const { playSound } = useSound();

  const handleStart = () => {
    setIsStarting(true);
    playSound("background");
    setTimeout(() => {
      setIsPlaying(true);
    }, 1000);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const totalHelperDamage = helpers.reduce(
        (total, helper) => total + helper.damage * helper.count,
        0
      );
      if (totalHelperDamage > 0) {
        damageMonster(totalHelperDamage);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [helpers, damageMonster, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickTimer, isPlaying]);

  if (!isPlaying) {
    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 transition-opacity duration-1000 ${
          isStarting ? "opacity-0" : "opacity-100"
        }`}
        style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      >
        <style>
          {`
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
          `}
        </style>
        <div className="animate-float">
          <h1 className="text-6xl font-bold text-white mb-2 text-center animate-glow">
            Tap Titans
          </h1>
          <p className="text-blue-300 text-xl mb-12 text-center animate-pulse">
            Your epic journey awaits
          </p>
        </div>
        <button
          onClick={handleStart}
          disabled={isStarting}
          className={`
            px-12 py-6 text-2xl font-bold text-white
            bg-gradient-to-r from-blue-600 to-blue-400
            hover:from-blue-500 hover:to-blue-300
            rounded-xl shadow-lg
            transform hover:scale-105 active:scale-95
            transition-all duration-200
            pointer-events-auto
            animate-bounce-slow
            disabled:opacity-50
            border-2 border-blue-300/30
            hover:border-blue-300/50
            backdrop-blur-sm
            ${isStarting ? "scale-150 opacity-0" : ""}
          `}
        >
          Play Now
        </button>
        <style jsx global>{`
          @keyframes glow {
            0%,
            100% {
              text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            }
            50% {
              text-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
            }
          }
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          .animate-glow {
            animation: glow 3s ease-in-out infinite;
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-bounce-slow {
            animation: bounce 3s infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 grid md:grid-cols-[1fr_24rem] pointer-events-none">
      <div className="relative w-full h-full">
        <Game3D />
      </div>
      <UI />
    </div>
  );
}

export default App;
