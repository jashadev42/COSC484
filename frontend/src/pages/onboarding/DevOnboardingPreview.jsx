// src/pages/onboarding/DevOnboardingPreview.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function DevOnboardingPreview() {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();

  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [birthdate, setBirthdate]       = useState("");
  const [genderId, setGenderId]         = useState("");
  const [orientationId, setOrientationId] = useState("");
  const [error, setError]               = useState("");

  const [genderOptions, setGenderOptions]           = useState([]);
  const [orientationOptions, setOrientationOptions] = useState([]);
  const [loadingOptions, setLoadingOptions]         = useState(true);

  // Load genders + orientations from the backend
  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      try {
        const [gendersRes, orientationsRes] = await Promise.all([
          fetchWithAuth("/profile/genders"),
          fetchWithAuth("/profile/orientations"),
        ]);

        if (gendersRes.ok) {
          const genders = await gendersRes.json();
          setGenderOptions(Array.isArray(genders) ? genders : []);
        } else {
          console.error("Failed to load /profile/genders", gendersRes.status);
        }

        if (orientationsRes.ok) {
          const orientations = await orientationsRes.json();
          setOrientationOptions(
            Array.isArray(orientations) ? orientations : []
          );
        } else {
          console.error(
            "Failed to load /profile/orientations",
            orientationsRes.status
          );
        }
      } catch (err) {
        console.error("Error loading gender/orientation options", err);
        setError("Failed to load options from the server (dev).");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, [fetchWithAuth]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !birthdate || !genderId || !orientationId) {
      setError("Please fill out all fields.");
      return;
    }

    console.log("DEV SUBMIT:", {
      firstName,
      lastName,
      birthdate,
      genderId,
      orientationId,
    });

    alert("Dev submit OK! Check console for values.");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Back to landing just for preview */}
        <button
          type="button"
          className="text-sm text-neutral-400 hover:text-neutral-200"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <h1 className="text-3xl font-semibold mb-2">Welcome to Spark</h1>
        <p className="text-neutral-300">
          DEV PREVIEW
        </p>

        <form
          onSubmit={handleSubmit}
          onChange={() => setError("")}
          className="space-y-4"
        >
          {/* First name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              First name
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-neutral-700 bg-black px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="e.g. John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Last name
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-neutral-700 bg-black px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="e.g. Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Birthday */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Birthday
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-neutral-700 bg-black px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Gender
            </label>
            <select
              className="w-full rounded-xl border border-neutral-700 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={genderId}
              onChange={(e) => setGenderId(e.target.value)}
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? "Loading genders..." : "Select your gender"}
              </option>
              {genderOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Orientation
            </label>
            <select
              className="w-full rounded-xl border border-neutral-700 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={orientationId}
              onChange={(e) => setOrientationId(e.target.value)}
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions
                  ? "Loading orientations..."
                  : "Select your orientation"}
              </option>
              {orientationOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-4 rounded-2xl px-6 py-3 bg-white text-black font-semibold disabled:opacity-60"
            disabled={loadingOptions}
          >
            Continue (dev)
          </button>
        </form>
      </div>
    </div>
  );
}
