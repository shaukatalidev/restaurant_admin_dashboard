import { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Confetti from "react-confetti";
import useSound from "use-sound";
import { Gift, Sparkles, Trophy, Star } from "lucide-react";

import spinSound from "../assets/spin.mp3";
import winSound from "../assets/win.mp3";
import { useTheme } from "../contexts/ThemeContext";

const data = [
  { option: "🎟️ ₹50 OFF Coupon", style: { backgroundColor: "#FF6B6B", textColor: "#FFFFFF" } },
  { option: "🎟️ ₹100 OFF Coupon", style: { backgroundColor: "#4ECDC4", textColor: "#FFFFFF" } },
  { option: "🍽️ Buy 1 Get 1 Free", style: { backgroundColor: "#45B7D1", textColor: "#FFFFFF" } },
  { option: "🎟️ Free Dessert", style: { backgroundColor: "#F7DC6F", textColor: "#2C3E50" } },
  { option: "🎟️ ₹200 OFF on ₹999", style: { backgroundColor: "#BB8FCE", textColor: "#FFFFFF" } },
  { option: "🎟️ 20% OFF Coupon", style: { backgroundColor: "#85E085", textColor: "#2C3E50" } },
];

export default function SpinWheel() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const { currentTheme } = useTheme();
  
  const [playSpin, { stop: stopSpin }] = useSound(spinSound, {
    volume: 0.5,
    loop: true,
  });
  const [playWin] = useSound(winSound, { volume: 0.7 });

  // Auto-hide result after 5 seconds
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setShowResult(false);
        setResult(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleSpinClick = () => {
    const random = Math.floor(Math.random() * data.length);
    setPrizeNumber(random);
    setMustSpin(true);
    setResult(null);
    setShowResult(false);
    setSpinCount(prev => prev + 1);
    playSpin();
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setResult(data[prizeNumber].option);
    setShowResult(true);
    stopSpin();
    playWin();
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 relative">
      {/* IMPROVED - Much more subtle backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Minimal floating elements - reduced and more subtle */}
        <div className="absolute top-10 right-10 animate-pulse opacity-20" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
        </div>
        <div className="absolute bottom-16 left-8 animate-pulse opacity-15" style={{ animationDelay: '1.5s', animationDuration: '4s' }}>
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>
        
        {/* Very subtle gradient orbs - much less prominent */}
        <div className="absolute -top-32 -right-32 w-48 h-48 bg-gradient-to-br from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-40 h-40 bg-gradient-to-tr from-blue-200/8 to-cyan-200/8 rounded-full blur-2xl"></div>
      </div>

      {/* Main Container - cleaner design */}
      <div
        className="relative w-full max-w-lg mx-4 p-6 rounded-2xl shadow-xl text-center border border-white/10"
        style={{
          background: `linear-gradient(145deg, ${currentTheme.colors.surface}F5, ${currentTheme.colors.surface}E8)`,
          boxShadow: `0 20px 40px -15px ${currentTheme.colors.primary}25`,
        }}
      >
        {/* Removed the spinning border animation - cleaner look */}
        
        {/* Inner Content */}
        <div className="relative z-10">
          {/* Header Section - simplified */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400/80 to-orange-400/80">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h2
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.fonts.heading,
                }}
                className="text-3xl font-black"
              >
                Lucky Spin
              </h2>
              <div className="p-2 rounded-full bg-gradient-to-r from-pink-400/80 to-purple-400/80">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {/* Subtitle */}
            <p 
              className="text-base font-medium opacity-75"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Spin to win amazing rewards! 🎯
            </p>
            
            {/* Spin Counter - more subtle */}
            {spinCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                  Spins: {spinCount}
                </span>
              </div>
            )}
          </div>

          {/* Wheel Container - simplified glow effect */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 via-pink-400/15 to-blue-400/20 blur-lg opacity-50"></div>
            <div className="relative bg-white/5 p-4 rounded-full backdrop-blur-sm border border-white/10">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={data.map(item => ({ ...item, style: { ...item.style, fontSize: 14, fontWeight: 'bold' } }))}
                backgroundColors={data.map(item => item.style.backgroundColor)}
                textColors={data.map(item => item.style.textColor)}
                outerBorderColor={currentTheme.colors.primary}
                outerBorderWidth={5}
                radiusLineColor={currentTheme.colors.surface}
                radiusLineWidth={2}
                fontSize={12}
                textDistance={55}
                spinDuration={0.8}
                onStopSpinning={handleStopSpinning}
              />
            </div>
          </div>

          {/* Simplified Spin Button */}
          <div className="relative mb-6">
            <button
              onClick={handleSpinClick}
              disabled={mustSpin}
              className="relative group px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)',
              }}
            >
              {/* Button Content */}
              <div className="relative flex items-center justify-center gap-2">
                {mustSpin ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Spinning...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Spin Now</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Result Display - cleaner design */}
          {showResult && result && (
            <div className="relative animate-bounce-in">
              <div 
                className="mx-auto max-w-sm p-5 rounded-xl shadow-lg border border-yellow-400/30 relative"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.surface}F0, ${currentTheme.colors.success}15)`,
                }}
              >
                {/* Celebration Icons - simplified */}
                <div className="absolute top-2 right-2 animate-bounce">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                
                {/* Main Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <span className="text-lg font-bold text-yellow-500">WINNER!</span>
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                  
                  <div 
                    className="text-lg font-bold px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm"
                    style={{ color: currentTheme.colors.text }}
                  >
                    🎉 {result} 🎉
                  </div>
                  
                  <p className="text-sm mt-2 opacity-70" style={{ color: currentTheme.colors.textSecondary }}>
                    Show this to redeem your prize!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confetti - same as before */}
      {result && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={250}
          recycle={false}
          gravity={0.3}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE', '#85E085']}
        />
      )}
    </div>
  );
}
