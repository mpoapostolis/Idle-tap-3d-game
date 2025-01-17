import { useGameStore } from "../store/gameStore";
import {
  Sword,
  Shield,
  Coins,
  Crown,
  Heart,
  Zap,
  Users,
  Menu,
  X,
  Timer,
  ChevronRight,
  Sparkles,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSound } from "../hooks/use-sounds";

export default function UI() {
  const {
    level,
    gold,
    clickDamage,
    currentMonsterHp,
    maxMonsterHp,
    monstersDefeated,
    helpers,
    isBoss,
    monsterTimer,
    maxMonsterTimer,
    upgradeClickDamage,
    buyHelper,
  } = useGameStore();
  const { playSound } = useSound();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const upgradeCost = Math.floor(clickDamage * 0.5);
  const totalDps = helpers.reduce(
    (total, helper) => total + helper.damage * helper.count,
    0
  );
  const timerPercentage = (monsterTimer / maxMonsterTimer) * 100;
  const hpPercentage = (currentMonsterHp / maxMonsterHp) * 100;

  return (
    <div className="absolute inset-0 grid md:grid-cols-[1fr_24rem] pointer-events-none">
      {/* Game Area */}
      <div className="relative">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => {
            playSound("select");
            setShowMobileMenu(!showMobileMenu);
          }}
          className="md:hidden fixed top-4 right-4 z-[60] pointer-events-auto bg-gray-900/90 p-3 rounded-xl
                   backdrop-blur-sm border border-gray-700/50 text-white hover:bg-gray-800/90
                   transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-gray-900/20"
        >
          {showMobileMenu ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Boss Level Banner */}
        {isBoss && (
          <div
            className="fixed top-0 left-0 right-0 md:right-96 bg-gradient-to-r from-red-600/90 via-purple-600/90 to-red-600/90 
                        text-white text-center py-3 z-[51] backdrop-blur-md shadow-lg animate-pulse"
          >
            <div className="flex items-center justify-center gap-3 text-2xl font-bold">
              <Star className="w-7 h-7 text-yellow-300" />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 text-transparent bg-clip-text">
                BOSS LEVEL {level}
              </span>
              <Star className="w-7 h-7 text-yellow-300" />
            </div>
          </div>
        )}

        {/* HP Bar */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-4 md:right-[25rem] 
                      w-[95%] md:w-auto max-w-xl md:max-w-none my-4 z-[52] transition-all duration-300 ease-out"
        >
          <div
            className={`bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl
                        shadow-xl border border-gray-700/50 ${
                          isBoss ? "shadow-red-500/20" : ""
                        }`}
          >
            <div className="relative h-10 bg-gray-800/80 rounded-xl overflow-hidden border border-gray-700/50">
              <div
                className={`absolute inset-0 ${
                  isBoss
                    ? "bg-gradient-to-r from-red-600 via-purple-500 to-red-600 animate-pulse shadow-inner"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                } transition-all duration-300 ease-out`}
                style={{ width: `${hpPercentage}%` }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white
                           drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
              >
                {currentMonsterHp.toLocaleString()} /{" "}
                {maxMonsterHp.toLocaleString()} HP
              </div>
            </div>

            {/* Timer Bar */}
            <div className="mt-2 relative h-2 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50">
              <div
                className={`absolute inset-0 ${
                  timerPercentage <= 20
                    ? "bg-red-500 animate-pulse"
                    : "bg-gradient-to-r from-orange-400 to-orange-500"
                } transition-all duration-1000 ease-linear`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={`fixed ${
            isSmallScreen ? "bottom-0" : "top-32"
          } left-0 right-0 md:right-96 p-3 z-[50]
                      transition-all duration-300 ease-out`}
        >
          <div className="max-w-fit mx-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Gold */}
            <div
              className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md px-4 py-3 rounded-xl
                         shadow-lg border border-yellow-500/30 flex items-center gap-3 pointer-events-auto
                         hover:from-yellow-500/30 hover:to-yellow-600/30 transition-all duration-200 group
                         hover:shadow-yellow-500/20"
            >
              <div className="p-2.5 bg-yellow-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="font-bold text-yellow-400 text-lg">
                {gold.toLocaleString()}
              </span>
            </div>

            {/* Level with Boss Indicator */}
            <div
              className={`bg-gradient-to-br ${
                isBoss
                  ? "from-red-500/20 to-red-600/20 border-red-500/30 hover:shadow-red-500/20"
                  : "from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:shadow-blue-500/20"
              }
              backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 pointer-events-auto
              hover:from-opacity-30 hover:to-opacity-30 transition-all duration-200 group`}
            >
              <div
                className={`p-2.5 ${
                  isBoss ? "bg-red-500/20" : "bg-blue-500/20"
                } rounded-lg group-hover:scale-110 transition-transform`}
              >
                {isBoss ? (
                  <Crown className="w-5 h-5 text-red-400 animate-pulse" />
                ) : (
                  <Shield className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-bold text-lg ${
                    isBoss ? "text-red-400" : "text-blue-400"
                  }`}
                >
                  Level {level}
                </span>
                {isBoss && (
                  <span className="text-xs text-red-300 animate-pulse">
                    BOSS!
                  </span>
                )}
              </div>
            </div>

            {/* DPS */}
            <div
              className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md px-4 py-3 rounded-xl
                         shadow-lg border border-green-500/30 flex items-center gap-3 pointer-events-auto
                         hover:from-green-500/30 hover:to-green-600/30 transition-all duration-200 group
                         hover:shadow-green-500/20"
            >
              <div className="p-2.5 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-green-400 text-lg">
                  {totalDps.toLocaleString()}
                </span>
                <span className="text-xs text-green-300">DPS</span>
              </div>
            </div>

            {/* Timer */}
            <div
              className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md px-4 py-3 rounded-xl
                         shadow-lg border border-orange-500/30 flex items-center gap-3 pointer-events-auto
                         hover:from-orange-500/30 hover:to-orange-600/30 transition-all duration-200 group
                         hover:shadow-orange-500/20"
            >
              <div className="p-2.5 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <Timer className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-orange-400 text-lg">
                  {monsterTimer}s
                </span>
                <span className="text-xs text-orange-300">Remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Panel - Upgrades and Helpers */}
      <div
        className={`fixed md:static inset-y-0 right-0 w-full sm:w-80 md:w-auto flex flex-col gap-4 
                    transition-transform duration-500 ease-in-out transform
                    ${
                      showMobileMenu
                        ? "translate-x-0"
                        : "translate-x-full md:translate-x-0"
                    }
                    bg-gray-900/95 backdrop-blur-md p-4 overflow-y-auto z-[55] pointer-events-auto
                    border-l border-gray-700/50`}
      >
        {/* Upgrade Section */}
        <div
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-2xl
                     shadow-lg border border-blue-500/20 hover:shadow-blue-500/10 transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg
                         group-hover:shadow-blue-500/50 transition-shadow"
            >
              <Sword className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Upgrades</h2>
          </div>

          <button
            onClick={() => {
              playSound("cash");

              upgradeClickDamage();
            }}
            disabled={gold < upgradeCost}
            className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                     disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                     p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                     shadow-lg hover:shadow-blue-500/20 group relative overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                         translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
            />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">
                Upgrade Click Damage
              </span>
              <span className="flex items-center gap-2 bg-blue-600/50 py-1 px-3 rounded-lg">
                <Coins className="w-4 h-4 text-yellow-400" />
                {upgradeCost.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-blue-200 mt-1">
              Current: {clickDamage.toLocaleString()} → Next:{" "}
              {Math.floor(clickDamage * 1.2).toLocaleString()}
            </div>
          </button>
        </div>

        {/* Helpers Section */}
        <div
          className="flex-1 bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-2xl
                     shadow-lg border border-purple-500/20 hover:shadow-purple-500/10 transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg
                         group-hover:shadow-purple-500/50 transition-shadow"
            >
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Helpers</h2>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
            {helpers.map((helper) => (
              <button
                key={helper.id}
                onClick={() => {
                  playSound("cash");

                  buyHelper(helper.id);
                }}
                disabled={gold < helper.cost}
                className="w-full bg-gradient-to-br from-purple-500/30 to-purple-600/30 hover:from-purple-500/40 hover:to-purple-600/40
                         disabled:from-gray-600/30 disabled:to-gray-700/30 disabled:cursor-not-allowed
                         p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                         shadow-lg hover:shadow-purple-500/20 group relative overflow-hidden"
                style={{
                  "--helper-color": helper.color,
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                             translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                />
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg text-white">
                    {helper.name}
                  </span>
                  <span className="flex items-center gap-2 bg-purple-600/50 py-1 px-3 rounded-lg">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    {helper.cost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-purple-200">
                  <span>DPS: {helper.damage.toLocaleString()}/s</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {helper.count.toLocaleString()}
                  </span>
                </div>
                {helper.count > 0 && (
                  <div className="mt-2 text-xs text-purple-300">
                    Total DPS: {(helper.damage * helper.count).toLocaleString()}
                    /s
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
