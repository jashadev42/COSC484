// src/pages/spark/SparkViewPage.jsx
import React from "react";

export default function SparkViewPage() {
  return (
    <div className="h-full w-full px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-2">Choose your Spark</h1>
      <p className="text-sm text-neutral-400">
        Choose how you want to meet people today.
      </p>

      <div className="space-y-4 mt-4">
        <button className="w-full rounded-2xl bg-neutral-900 px-4 py-4 text-left hover:bg-neutral-800 transition">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-white">Normal mode</h2>
              <p className="text-sm text-neutral-400">
                Join a room, get matched, and chat without the rush.
              </p>
            </div>
          </div>
        </button>

        <button className="w-full rounded-2xl bg-neutral-900 px-4 py-4 text-left hover:bg-neutral-800 transition">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-white">Speed dating</h2>
              <p className="text-sm text-neutral-400">
                Short times sessions to see where the sparks fly.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
