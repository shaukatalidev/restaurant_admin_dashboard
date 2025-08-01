import { useState } from "react";
import { Wheel } from "react-custom-roulette";
import Confetti from "react-confetti";
import useSound from "use-sound";

import spinSound from "../assets/spin.mp3";
import winSound from "../assets/win.mp3";
import { useTheme } from "../contexts/ThemeContext";

const data = [
  { option: "🎟️ ₹50 OFF Coupon", style: { backgroundColor: "#FF6F91" } },
  { option: "🎟️ ₹100 OFF Coupon", style: { backgroundColor: "#FF9671" } },
  { option: "🍽️ Buy 1 Get 1 Free", style: { backgroundColor: "#FFC75F" } },
  { option: "🎟️ Free Dessert Coupon", style: { backgroundColor: "#F9F871" } },
  { option: "🎟️ ₹200 OFF on ₹999", style: { backgroundColor: "#A0E7E5" } },
  { option: "🎟️ 20% OFF Coupon", style: { backgroundColor: "#B4F8C8" } },
];

export default function SpinWheel() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const { currentTheme } = useTheme();
  const [playSpin, { stop: stopSpin }] = useSound(spinSound, {
    volume: 0.5,
    loop: true,
  });
  const [playWin] = useSound(winSound, { volume: 0.7 });

  const handleSpinClick = () => {
    const random = Math.floor(Math.random() * data.length);
    setPrizeNumber(random);
    setMustSpin(true);
    setResult(null);
    playSpin();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`w-full max-w-md p-4  rounded-2xl shadow-lg text-center bg-gradient-to-br ${currentTheme.gradients.header}`}
      >
        <h2
          style={{
            color: currentTheme.colors.text,
            fontFamily: currentTheme.fonts.heading,
          }}
          className="text-3xl  mb-6 font-bold"
        >
          🎡 Lucky Spin
        </h2>

        <div className="flex justify-center">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            backgroundColors={["#3e3e3e", "#df3428"]}
            textColors={[currentTheme.colors.text]}
            outerBorderColor={currentTheme.colors.primary}
            outerBorderWidth={4}
            radiusLineColor={currentTheme.colors.secondary}
            radiusLineWidth={4}
            fontSize={16}
            fontFamily="'Arial', sans-serif"
            spinDuration={0.5}
            onStopSpinning={() => {
              setMustSpin(false);
              setResult(data[prizeNumber].option);
              stopSpin();
              playWin();
            }}
          />
        </div>

        <button
          onClick={handleSpinClick}
          disabled={mustSpin}
          className="mt-8 px-6 py-3 bg-white text-black rounded-full shadow-md hover:scale-105 transition-transform disabled:opacity-50"
        >
          {mustSpin ? "Spinning..." : "🚀 Spin Now"}
        </button>

        {result && (
          <>
            <div className="mt-6 text-lg bg-white text-purple-800 px-6 py-3 rounded-xl shadow-lg animate-bounce">
              🎉 You won <span className="text-black">{result}</span>!
            </div>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={200}
            />
          </>
        )}
      </div>
    </div>
  );
}
