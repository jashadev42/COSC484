import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import PreferencesSection from "@components/settings/PreferencesSection";

const NOTIFICATION_STORAGE_KEY = "sparkNotificationPrefs";
const DEFAULT_NOTIFICATIONS = {
  matches: true,
  messages: true,
  marketing: false,
  productUpdates: true,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_NOTIFICATIONS, ...parsed };
      }
    } catch (_) {}
    return DEFAULT_NOTIFICATIONS;
  });
  
  const [notifSaved, setNotifSaved] = useState(false);

  const handleSaveNotifications = () => {
    try {
      localStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(notifPrefs)
      );
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to save notification preferences.");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your Spark account and data. This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    try {
      const { fetchWithAuth } = useAuth();
      const res = await fetchWithAuth("/user/me", {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || body?.message || "Failed to delete account.");
      }

      await signOut();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Something went wrong deleting your account.");
    }
  };

  return (
    <div className="h-full w-full px-4 py-3 text-white overflow-y-auto pb-24">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* Preferences Section - All match preferences in one component */}
      <PreferencesSection />

      {/* Notification Preferences */}
      <section className="mb-6 rounded-2xl bg-[#171717] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400">
              Notifications
            </h2>
            <p className="text-xs text-neutral-500">
              Choose which alerts you want from Spark.
            </p>
          </div>
          {notifSaved && <span className="text-xs text-green-400">Saved</span>}
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-xl bg-[#262626] px-4 py-3 text-sm">
            <span>New matches</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-primary"
              checked={notifPrefs.matches}
              onChange={() =>
                setNotifPrefs((prev) => ({ ...prev, matches: !prev.matches }))
              }
            />
          </label>

          <label className="flex items-center justify-between rounded-xl bg-[#262626] px-4 py-3 text-sm">
            <span>Messages</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-primary"
              checked={notifPrefs.messages}
              onChange={() =>
                setNotifPrefs((prev) => ({ ...prev, messages: !prev.messages }))
              }
            />
          </label>

          <label className="flex items-center justify-between rounded-xl bg-[#262626] px-4 py-3 text-sm">
            <span>Product updates</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-primary"
              checked={notifPrefs.productUpdates}
              onChange={() =>
                setNotifPrefs((prev) => ({
                  ...prev,
                  productUpdates: !prev.productUpdates,
                }))
              }
            />
          </label>

          <label className="flex items-center justify-between rounded-xl bg-[#262626] px-4 py-3 text-sm">
            <span>Promotions</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-primary"
              checked={notifPrefs.marketing}
              onChange={() =>
                setNotifPrefs((prev) => ({ ...prev, marketing: !prev.marketing }))
              }
            />
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setNotifPrefs({ ...DEFAULT_NOTIFICATIONS })}
              className="flex-1 rounded-xl border border-neutral-600 px-4 py-3 text-sm text-neutral-200"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSaveNotifications}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black"
            >
              Save notifications
            </button>
          </div>
        </div>
      </section>

      {/* Account Section */}
      <section className="mb-6 rounded-2xl bg-[#171717] p-4 space-y-3">
        <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400">
          Account
        </h2>

        <button
          onClick={handleSignOut}
          className="w-full rounded-xl bg-[#262626] px-4 py-3 text-left text-sm hover:bg-[#3a1f1f] transition"
        >
          <span className="text-white">Sign out</span>
        </button>

        <button
          onClick={handleDeleteAccount}
          className="w-full rounded-xl bg-[#262626] px-4 py-3 text-left text-sm hover:bg-[#4a1f1f] transition"
        >
          <span className="text-red-400">Delete account</span>
        </button>
      </section>
    </div>
  );
}