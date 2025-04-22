import React, { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const Services = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDiagnose = async () => {
    if (!name || !age || !gender || !image) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("image", image);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5001/predict", formData, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ECG_Report_${name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Diagnosis failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-gray-800 text-white p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-blue-500/50">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-8 tracking-wide">
          ECG Diagnosis Service
        </h2>
  
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
  
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
  
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
  
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-white file:bg-blue-600 file:text-white file:rounded file:px-4 file:py-2 file:mr-4 file:border-none file:hover:bg-blue-700 transition"
          />
  
          <button
            onClick={handleDiagnose}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition transform hover:scale-105 duration-200"
          >
            {loading ? "Diagnosing..." : "Diagnose"}
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default Services;
