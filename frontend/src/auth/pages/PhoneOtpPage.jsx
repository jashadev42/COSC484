// src/auth/pages/PhoneOtpPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext.jsx";
import TitleBarComponent from "../../components/TitleBarComponent.jsx";
import PhoneAuthFormComponent from "../../components/PhoneAuthFormComponent.jsx";

export default function PhoneOtpPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/onboarding");
  }, [isAuthenticated, navigate]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-neutral-900 text-white rounded-4xl w-full max-w-md p-8 shadow-xl relative animate-fadeUp">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:text-neutral-300"
        >← Back </button>
        <div className="mb-6"> <TitleBarComponent /> </div>
        <PhoneAuthFormComponent />
      </div>
    </div>
  );
}
