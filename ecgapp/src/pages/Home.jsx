import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/services");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 flex flex-col items-center text-center">
      <p className="text-sm text-gray-300 mb-4">
        Detection of cardiovascular disease using ECG Image
      </p>

      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
        Cardiovascular <br className="hidden md:block" /> disease
      </h1>

      <p className="text-lg md:text-xl text-gray-300 mb-6">
        AI to detect disease from ECG
      </p>

      <button
        onClick={handleGetStarted}
        className="bg-blue-600 hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transform hover:scale-105 transition duration-300 ease-in-out text-white font-semibold px-6 py-2 rounded mb-8"
      >
      Get Started
    </button>


      <div className="w-full max-w-3xl">
      <img
        src="/sample1.webp"
        alt="ECG Visualization"
       className="rounded-xl shadow-[0_10px_30px_rgba(138,43,226,0.5)] transition-transform duration-300 hover:scale-105 w-full max-w-md mx-auto"
      />


      </div>
    </div>
  );
};

export default Home;
