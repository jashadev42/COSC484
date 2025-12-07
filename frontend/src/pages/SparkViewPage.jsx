// frontend/src/profile/pages/SparkViewPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function SparkViewPage() {
  const navigate = useNavigate();

  // Normal mode → go to matchmaking screen
  function handleNormalMode() {
    navigate("/matchmaking");
  }

  // Speed dating still TODO
  function handleSpeedDatingMode() {
    console.log("TODO: start speed-dating session");
    alert("Speed dating mode coming soon ⚡");
  }

  return (
    <div className="h-full w-full flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            How do you want to spark?
          </h1>
          <p className="text-sm text-neutral-400">
            Choose a mode to start chatting with someone new.
          </p>
        </header>

        <div className="space-y-4">
          {/* Normal mode → matchmaking */}
          <button
            type="button"
            onClick={handleNormalMode}
            className="w-full text-left rounded-2xl border border-neutral-700 px-4 py-4 hover:border-amber-400 transition"
          >
            <h2 className="text-lg font-semibold text-white">Normal mode</h2>
            <p className="text-sm text-neutral-400">
              Standard one-on-one conversations with flexible timing.
            </p>
          </button>

          {/* Speed dating (stub for now) */}
          <button
            type="button"
            onClick={handleSpeedDatingMode}
            className="w-full text-left rounded-2xl border border-neutral-700 px-4 py-4 hover:border-amber-400 transition"
          >
            <h2 className="text-lg font-semibold text-white">
              Speed dating mode
            </h2>
            <p className="text-sm text-neutral-400">
              Short timed sessions to see where the sparks fly.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
