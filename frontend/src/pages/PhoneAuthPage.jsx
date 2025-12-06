import React from "react";
import { useNavigate } from "react-router-dom";

import TitleBarComponent from "../TitleBarComponent";
import PhoneAuthFormComponent from "../PhoneAuthFormComponent";

export default function PhoneAuthPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full text-white flex flex-col">
      <header className="w-full p-4">
        <div className="mx-auto w-full max-w-5xl flex justify-end">
          <TitleBarComponent />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-10">
        <div className="w-full max-w-md">
          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 rounded-xl px-3 py-2 text-sm font-medium bg-transparent text-neutral-300 hover:opacity-80"
            aria-label="Go back"
          >
            ← Back
          </button>

          {/* Headline */}
          <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-title)" }}>
            Verify your phone
          </h1>
          <p className="text-sm text-neutral-400 mb-6" style={{ fontFamily: "var(--font-normal)" }}>
            Enter your phone number and we’ll text you a one‑time code. This lets you sign in or create an account.
          </p>

          {/* Phone Auth */}
          <div className="rounded-2xl p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] shadow-sm">
            <PhoneAuthFormComponent />
          </div>

        </div>
      </main>

      <div className="h-6" />
    </div>
  );
}
