// src/pages/profile/ProfilePage.jsx
import React from "react";

export default function ProfilePage() {
  return (
    <div className="h-full w-full px-4 py-3 space-y-4">
      <h1 className="text-2xl font-semibold mb-2">My profile</h1>

      <div className="rounded-2xl bg-neutral-900 px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-neutral-700" />
          <div>
            <p className="font-semibold">Your Name, 21</p>
            <p className="text-sm text-neutral-400">Short tagline / prompt</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-500">
        Later we’ll use this page to edit photos, prompts, interests, and more.
      </p>
    </div>
  );
}
