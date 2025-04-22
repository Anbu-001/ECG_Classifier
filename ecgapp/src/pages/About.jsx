import React from "react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate("/contact");
  };

  return (
    <div className="flex flex-col items-center text-center px-4 py-16 bg-white text-gray-800">
      <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
        Transforming heart health
      </h2>
      <h3 className="text-2xl font-semibold mb-4">
        AI-powered ECG diagnosis
      </h3>
      <p className="max-w-3xl text-gray-600 text-lg mb-8">
        Our mission is to revolutionize cardiovascular disease diagnosis using cutting-edge AI technology. 
        By analyzing ECG images, we provide accurate predictions of potential heart conditions, empowering 
        individuals to take proactive steps towards their health. Located in Chennai, we strive to deliver 
        precise, timely, and reliable insights into cardiovascular health, making heart care accessible to everyone.
      </p>
      <button
        onClick={handleContactClick}
        className="border-2 border-black px-6 py-2 text-lg font-semibold hover:bg-black hover:text-white transition duration-300"
      >
        Get in touch
      </button>
    </div>
  );
};

export default About;
