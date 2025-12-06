// src/pages/settings/SettingsPage.jsx
import React from "react";

export default function SettingsPage() {
  return (
    <div className="h-full w-full px-4 py-3 space-y-6">
      <h1 className="text-2xl font-semibold mb-2 text-white">Settings</h1>

      {/* Preferences */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-white">
          Match preferences
        </h2>
        <div className="rounded-2xl bg-neutral-900 px-3 py-3 text-sm space-y-2 text-white">
          <button style={{ color: "white" }} className="w-full text-left hover:text-amber-400">
            Edit age range
          </button>
          <button style={{ color: "white" }} className="w-full text-left hover:text-amber-400">
            Edit distance
          </button>
          <button style={{ color: "white" }} className="w-full text-left hover:text-amber-400">
            Edit gender/orientation preferences
          </button>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-neutral-800 my-4" />

      {/* Account controls */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">
          Account
        </h2>
        <div className="rounded-2xl bg-neutral-900 px-3 py-3 text-sm space-y-2">
          <button style={{ color: "white" }} className="w-full text-left hover:text-amber-400">
            Pause account
          </button>
          <button style={{ color: "white" }} className="w-full text-left hover:text-amber-400">
            Notification settings
          </button>
          <button style={{ color: "white" }} className="w-full text-left text-red-400 hover:text-red-300">
            Delete account
          </button>
        </div>
      </section>
    </div>
  );
}
