import { useState, useEffect } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileSetupPage() {
  const { fetchWithAuth, user, refreshUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");

  const [genderOptions, setGenderOptions] = useState([]);
  const [orientationOptions, setOrientationOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form if user data exists
  useEffect(() => {
    if (user) {
      setFname(user.first_name || "");
      setLname(user.last_name || "");
      if (user.birthdate) {
        const date = new Date(user.birthdate);
        const formatted = date.toISOString().split('T')[0];
        setBirthdate(formatted);
      }
    }
  }, [user]);

  // Load options
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        
        const [gendersRes, orientationsRes] = await Promise.all([
          fetchWithAuth("/profile/genders"),
          fetchWithAuth("/profile/orientations"),
        ]);

        if (gendersRes.ok) {
          const genders = await gendersRes.json();
          setGenderOptions(genders.map(g => g.name || g));
        }

        if (orientationsRes.ok) {
          const orientations = await orientationsRes.json();
          setOrientationOptions(orientations.map(o => o.name || o));
        }
      } catch (err) {
        console.error("Failed to load options:", err);
        setGenderOptions(["male", "female", "non-binary"]);
        setOrientationOptions(["straight", "gay", "lesbian", "bisexual"]);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, [fetchWithAuth]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const birthISO = new Date(birthdate).toISOString();

      let res = await fetchWithAuth("/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: fname,
          last_name: lname,
          birthdate: birthISO,
        }),
      });

      if (!res.ok) throw new Error("Failed to save basic info");

      res = await fetchWithAuth("/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          orientation,
          bio: null,
          drug_use: null,
          weed_use: null,
          location: null,
          location_label: null,
          show_precise_location: false,
          pronouns: null,
          languages_spoken: [],
          school: null,
          occupation: null,
          relationship_goal: null,
          personality_type: null,
          love_language: null,
          attachment_style: null,
          political_view: null,
          zodiac_sign: null,
          religion: null,
          diet: null,
          exercise_frequency: null,
          pets: [],
          smoke_frequency: null,
          drink_frequency: null,
          sleep_schedule: null,
          interests: [],
        }),
      });

      if (!res.ok) throw new Error("Failed to initialize profile");

      // Refresh auth context
      // await refreshUser();
      // await refreshProfile();

      navigate("/spark");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to complete onboarding");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      <div className="p-6 text-white max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Welcome to Spark ✨</h1>
        <p className="text-neutral-400 mb-6 text-sm">
          Just a few quick details to get started!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 rounded bg-neutral-800 text-white"
            placeholder="First name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />

          <input
            className="w-full p-3 rounded bg-neutral-800 text-white"
            placeholder="Last name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Date of Birth</label>
            <input
              type="date"
              className="w-full p-3 rounded bg-neutral-800 text-white"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
            />
          </div>

          <select
            className="w-full p-3 rounded bg-neutral-800 text-white"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            disabled={loadingOptions}
          >
            <option value="">
              {loadingOptions ? "Loading..." : "Select gender"}
            </option>
            {genderOptions.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1).replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            className="w-full p-3 rounded bg-neutral-800 text-white"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            required
            disabled={loadingOptions}
          >
            <option value="">
              {loadingOptions ? "Loading..." : "Select orientation"}
            </option>
            {orientationOptions.map((o) => (
              <option key={o} value={o}>
                {o.charAt(0).toUpperCase() + o.slice(1).replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {error && (
            <div className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || loadingOptions}
            className="w-full p-3 rounded bg-primary text-black font-bold hover:opacity-90 disabled:opacity-50 transition"
          >
            {saving ? "Setting up..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}