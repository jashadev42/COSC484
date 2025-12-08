// frontend/src/pages/SettingsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut, fetchWithAuth } = useAuth();

  const handleEditPreferences = () => {
    navigate("/settings/preferences");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/"); // back to landing
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your Spark account and data. This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    try {
      // If your backend uses a different route, change "/user/me" accordingly.
      const res = await fetchWithAuth("/user/me", {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || body?.message || "Failed to delete account.");
      }

      // After deletion, sign the user out and go back to landing
      await signOut();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Something went wrong deleting your account.");
    }
  };

  return (
    <div className="h-full w-full px-4 py-3 text-white">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      {/* Match / Profile Preferences */}
      <section className="mb-6 rounded-2xl bg-[#171717] p-4 space-y-3">
        <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400">
          Preferences
        </h2>

        <button
          onClick={handleEditPreferences}
          className="w-full rounded-xl bg-[#262626] px-4 py-3 text-left text-sm text-neutral-100"
          style={{ color: "white" }}
        >
          Edit preferences
        </button>

        {/* You can wire these later if you want separate screens */}
        <button
          className="w-full rounded-xl bg-[#262626] px-4 py-3 text-left text-sm opacity-50 cursor-default"
          style={{ color: "white" }}
        >
          Edit distance range (coming soon)
        </button>
        <button
          className="w-full rounded-xl bg-[#262626] px-4 py-3 text-left text-sm opacity-50 cursor-default"
          style={{ color: "white" }}
        >
          Edit notification preferences (coming soon)
        </button>
      </section>

      {/* Account Section */}
      <section className="mb-6 rounded-2xl bg-[#171717] p-4 space-y-3">
        <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400">
          Account
        </h2>

        <button
          onClick={handleSignOut}
          className="w-full rounded-xl bg-[#262626] px-4 py-3 text-left text-sm text-red-300 hover:bg-[#3a1f1f] transition"
          style={{ color: "white" }}
        >
          Sign out
        </button>

        <button
          onClick={handleDeleteAccount}
          className="w-full rounded-xl bg-[#262626] px-4 py-3 text-left text-sm text-red-400 hover:bg-[#4a1f1f] transition"
          style={{ color: "white" }}
        >
          Delete account
        </button>
      </section>
    </div>
  );
}
