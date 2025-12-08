// frontend/src/auth/pages/PhoneOtpPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitleBarComponent from "../../components/TitleBarComponent.jsx";
import PhoneAuthFormComponent from "../../components/PhoneAuthFormComponent.jsx";
import { useAuth } from "@contexts/AuthContext.jsx";

export default function PhoneOtpPage() {
  const navigate = useNavigate();
  const { isAuthenticated, fetchWithAuth } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function decideWhereToGo() {
      try {
        // Check if profile exists
        const res = await fetchWithAuth("/profile/me");

        if (cancelled) return;

        if (res.ok) {
          // Profile exists → send to main app (pick one)
          navigate("/spark");    // or "/profile" if you prefer
        } else if (res.status === 404) {
          // No profile yet → go to onboarding
          navigate("/onboarding");
        } else {
          // Some other error – safest is to send to onboarding
          navigate("/onboarding");
        }
      } catch (err) {
        console.error("Error checking profile after login", err);
        if (!cancelled) {
          // If check fails, still let them try onboarding instead of being stuck
          navigate("/onboarding");
        }
      }
    }

    decideWhereToGo();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, fetchWithAuth, navigate]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-neutral-900 text-white rounded-2xl w-full max-w-md p-8 shadow-xl relative animate-fadeUp">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:text-neutral-300 transition">← Back </button>
        <div className="mb-6">
          <TitleBarComponent hideLogo />
        </div>
        <PhoneAuthFormComponent />
      </div>
    </div>
  );
}