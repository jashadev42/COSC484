// frontend/src/auth/pages/PhoneOtpPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitleBarComponent from "../../components/TitleBarComponent";
import PhoneAuthFormComponent from "../../components/PhoneAuthFormComponent";
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
    <section className="flex flex-col w-full min-h-screen text-white">
      <TitleBarComponent />
      <main className="flex w-full justify-center p-4">
        <PhoneAuthFormComponent />
      </main>
      <footer className="h-8" />
    </section>
  );
}
