// frontend/src/pages/SettingsPage.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

const DEFAULT_PREFS = {
  target_gender: "any",
  age_min: 18,
  age_max: 70,
  max_distance: 50,
  extra_options: {},
};

const FALLBACK_GENDER_OPTIONS = [
  { id: "male", name: "male" },
  { id: "female", name: "female" },
  { id: "non-binary", name: "non-binary" },
  { id: "genderqueer", name: "genderqueer" },
  { id: "genderfluid", name: "genderfluid" },
  { id: "transgender (male to female)", name: "transgender (male to female)" },
  { id: "transgender (female to male)", name: "transgender (female to male)" },
  { id: "any", name: "any" },
];

const NOTIFICATION_STORAGE_KEY = "sparkNotificationPrefs";
const DEFAULT_NOTIFICATIONS = {
  matches: true,
  messages: true,
  marketing: false,
  productUpdates: true,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut, fetchWithAuth, isAuthenticated } = useAuth();

  const [genderOptions, setGenderOptions] = useState(FALLBACK_GENDER_OPTIONS);
  const [prefForm, setPrefForm] = useState(DEFAULT_PREFS);
  const [hasPrefs, setHasPrefs] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsError, setPrefsError] = useState("");
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIFICATIONS);
  const [notifSaved, setNotifSaved] = useState(false);

  const handleEditPreferences = () => {
    navigate("/settings/preferences");
  };

  const parseExtraOptions = (value) => {
    if (!value) return {};
    if (typeof value === "object") return value;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (_) {
        return {};
      }
    }
    return {};
  };

  const mapTargetGender = useCallback((data, options) => {
    const opts = options || FALLBACK_GENDER_OPTIONS;
    if (!data) return "any";
    if (data.target_gender) return data.target_gender;
    if (data.target_gender_id) {
      const matched = opts.find((g) => String(g.id) === String(data.target_gender_id));
      if (matched?.name) return matched.name;
    }
    return "any";
  }, []);

  const loadPrefs = useCallback(async () => {
    if (!isAuthenticated) return;

    setPrefsLoading(true);
    setPrefsError("");

    try {
      const [genderRes, prefsRes] = await Promise.all([
        fetchWithAuth("/profile/genders"),
        fetchWithAuth("/user/me/preferences"),
      ]);

      let optionsToUse = genderOptions;
      if (genderRes.ok) {
        const genders = await genderRes.json();
        optionsToUse = [...genders, { id: "any", name: "any" }];
        setGenderOptions(optionsToUse);
      }

      if (prefsRes.ok) {
        const data = await prefsRes.json();
        setHasPrefs(true);
        setPrefForm({
          target_gender: mapTargetGender(data, optionsToUse),
          age_min: data.age_min ?? DEFAULT_PREFS.age_min,
          age_max: data.age_max ?? DEFAULT_PREFS.age_max,
          max_distance: data.max_distance ?? DEFAULT_PREFS.max_distance,
          extra_options: parseExtraOptions(data.extra_options),
        });
      } else if (prefsRes.status === 404) {
        setHasPrefs(false);
        setPrefForm({ ...DEFAULT_PREFS });
      } else {
        const errBody = await prefsRes.json().catch(() => ({}));
        throw new Error(
          errBody?.detail || errBody?.message || "Unable to load preferences"
        );
      }
    } catch (err) {
      console.error(err);
      setPrefsError(err?.message || "Unable to load preferences.");
    } finally {
      setPrefsLoading(false);
    }
  }, [DEFAULT_PREFS, fetchWithAuth, isAuthenticated, mapTargetGender]);

  useEffect(() => {
    loadPrefs();
    try {
      const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch (_) {}
    // loadPrefs is stable because its deps are stable; lint disable avoids false positive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPrefs]);

  const updatePrefField = (field, value) => {
    setPrefForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDistance = async () => {
    setPrefsError("");
    setPrefsSaved(false);

    const ageMin = Number(prefForm.age_min) || DEFAULT_PREFS.age_min;
    const ageMax = Number(prefForm.age_max) || DEFAULT_PREFS.age_max;
    const maxDistance = Number(prefForm.max_distance) || DEFAULT_PREFS.max_distance;
    const targetGender = prefForm.target_gender || "any";

    if (ageMin > ageMax) {
      setPrefsError("Min age cannot be greater than max age.");
      return;
    }

    try {
      const res = await fetchWithAuth("/user/me/preferences", {
        method: hasPrefs ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_gender: targetGender,
          age_min: ageMin,
          age_max: ageMax,
          max_distance: maxDistance,
          extra_options: prefForm.extra_options || {},
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          errBody?.detail || errBody?.message || "Unable to save distance settings."
        );
      }

      setHasPrefs(true);
      setPrefForm((prev) => ({
        ...prev,
        target_gender: targetGender,
        age_min: ageMin,
        age_max: ageMax,
        max_distance: maxDistance,
      }));
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setPrefsError(err?.message || "Failed to save distance settings.");
    }
  };

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
      </section>

      {/* Distance & matchmaking prefs */}
      <section className="mb-6 rounded-2xl bg-[#171717] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400">
              Match preferences
            </h2>
            <p className="text-xs text-neutral-500">
              Control who you see and how far you are willing to match.
            </p>
          </div>
          {prefsLoading && <span className="text-xs text-neutral-500">Loading…</span>}
          {prefsSaved && !prefsLoading && (
            <span className="text-xs text-green-400">Saved</span>
          )}
        </div>

        {prefsError && (
          <div className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
            {prefsError}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Looking for
            </label>
            <select
              disabled={prefsLoading}
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={prefForm.target_gender}
              onChange={(e) => updatePrefField("target_gender", e.target.value)}
            >
              {genderOptions.map((g) => (
                <option key={g.id || g.name} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Age min
              </label>
              <input
                type="number"
                min={18}
                max={99}
                disabled={prefsLoading}
                className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
                value={prefForm.age_min}
                onChange={(e) => updatePrefField("age_min", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Age max
              </label>
              <input
                type="number"
                min={18}
                max={99}
                disabled={prefsLoading}
                className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
                value={prefForm.age_max}
                onChange={(e) => updatePrefField("age_max", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Max distance (miles)
              </label>
              <span className="text-sm text-neutral-200 font-semibold">
                {prefForm.max_distance} mi
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={200}
              step={1}
              disabled={prefsLoading}
              className="w-full"
              value={prefForm.max_distance}
              onChange={(e) => updatePrefField("max_distance", Number(e.target.value))}
            />
            <input
              type="number"
              min={1}
              max={200}
              disabled={prefsLoading}
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={prefForm.max_distance}
              onChange={(e) => updatePrefField("max_distance", Number(e.target.value))}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={loadPrefs}
              className="flex-1 rounded-xl border border-neutral-600 px-4 py-3 text-sm text-neutral-200 disabled:opacity-50"
              disabled={prefsLoading}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSaveDistance}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
              disabled={prefsLoading}
            >
              Save match prefs
            </button>
          </div>
        </div>
      </section>

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
