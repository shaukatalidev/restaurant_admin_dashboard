// SpinWheel.tsx
import React, { useState } from "react";
import { Wheel } from "react-custom-roulette";

const data = [
  {
    option: "Prize 1",
    style: { backgroundColor: "#ff4d4d", textColor: "white" },
  },
  {
    option: "Prize 2",
    style: { backgroundColor: "#4da6ff", textColor: "white" },
  },
  {
    option: "Prize 3",
    style: { backgroundColor: "#4dff88", textColor: "black" },
  },
  {
    option: "Prize 4",
    style: { backgroundColor: "#ffd24d", textColor: "black" },
  },
  {
    option: "Prize 5",
    style: { backgroundColor: "#b84dff", textColor: "white" },
  },
  {
    option: "Prize 6",
    style: { backgroundColor: "#00e6e6", textColor: "black" },
  },
];

export default function SpinWheel() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const handleSpinClick = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setPrizeNumber(randomIndex);
    setMustSpin(true);
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-sans">
      <h1 className="text-4xl mb-6 font-bold drop-shadow-lg">
        🎡 Spin the Wheel
      </h1>
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={data}
        backgroundColors={["#3e3e3e", "#df3428"]}
        textColors={["#ffffff"]}
        onStopSpinning={() => {
          setMustSpin(false);
          setResult(data[prizeNumber].option);
        }}
        outerBorderColor={"#eeeeee"}
        outerBorderWidth={10}
        radiusLineColor={"#ffffff"}
        radiusLineWidth={2}
        fontSize={16}
        spinDuration={0.7}
      />
      <button
        onClick={handleSpinClick}
        className="mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg shadow-md transition-all duration-300"
      >
        Spin Now
      </button>

      {result && (
        <div className="mt-8 text-2xl bg-white text-black px-6 py-3 rounded shadow-lg animate-bounce">
          🎉 You won <strong>{result}</strong>!
        </div>
      )}
    </div>
  );
}
