// frontend/src/pages/PreferencesPage.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const RELIGIONS = [
  "christianity",
  "islam",
  "judaism",
  "buddhism",
  "hinduism",
  "sikhism",
  "taoism",
  "shinto",
  "atheism",
  "agnostic",
  "spiritual",
  "other",
];

const DIETS = ["omnivore", "pescetarian", "vegetarian", "vegan", "flexitarian"];
const EXERCISE_FREQ = ["everyday", "often", "sometimes", "never"];
const SLEEP_SCHEDULES = ["early_bird", "night_owl", "flexible", "irregular"];

// Allowed pronoun values from backend
const PRONOUNS = ["any", "she/her", "he/him", "they/them", "she/they", "he/they"];

function parseList(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normaliseArrayish(value) {
  // DB might send array, string, {}, null, etc.
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return parseList(value);
  if (value && typeof value === "object") return []; // ignore weird legacy shapes
  return [];
}

export default function PreferencesPage() {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [gender, setGender] = useState(null);
  const [orientation, setOrientation] = useState(null);
  const [genderOptions, setGenderOptions] = useState([]);
  const [orientationOptions, setOrientationOptions] = useState([]);

  const [form, setForm] = useState({
    gender: "",
    orientation: "",
    pronouns: "any",
    relationship_goal: "casual dating",
    religion: "other",
    diet: "omnivore",
    exercise_frequency: "sometimes",
    sleep_schedule: "flexible",
    location_label: "",
    location: "",
    school: "",
    occupation: "",
    languages_spoken: "",
    pets: "",
    interests: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      const [
        profileRes,
        genderRes,
        orientationRes,
        interestsRes,
        gendersListRes,
        orientationsListRes,
      ] = await Promise.all([
        fetchWithAuth("/profile/me"),
        fetchWithAuth("/profile/me/gender"),
        fetchWithAuth("/profile/me/orientation"),
        fetchWithAuth("/profile/me/interests"),
        fetchWithAuth("/profile/genders"),
        fetchWithAuth("/profile/orientations"),
      ]);

      if (!profileRes.ok) throw new Error("Failed to load profile");
      const profileData = await profileRes.json();
      setProfile(profileData);

      let genderData = null;
      if (genderRes.ok) {
        genderData = await genderRes.json();
        setGender(genderData);
      }

      let orientationData = null;
      if (orientationRes.ok) {
        orientationData = await orientationRes.json();
        setOrientation(orientationData);
      }

      let interestsNames = [];
      if (interestsRes.ok) {
        const interests = await interestsRes.json();
        interestsNames = interests.map((i) => i.name);
      }

      if (gendersListRes.ok) {
        setGenderOptions(await gendersListRes.json());
      }
      if (orientationsListRes.ok) {
        setOrientationOptions(await orientationsListRes.json());
      }

      // 💡 Normalise weird DB shapes
      const languagesArray = normaliseArrayish(profileData.languages_spoken);
      const petsArray = normaliseArrayish(profileData.pets);

      // 💡 Ensure pronouns is a valid enum, or fall back to "any"
      const rawPronouns = profileData.pronouns;
      const safePronouns = PRONOUNS.includes(rawPronouns) ? rawPronouns : "any";

      setForm({
        gender: genderData?.name || "",
        orientation: orientationData?.name || "",
        pronouns: safePronouns,
        relationship_goal: profileData.relationship_goal || "casual dating",
        religion: profileData.religion || "other",
        diet: profileData.diet || "omnivore",
        exercise_frequency: profileData.exercise_frequency || "sometimes",
        sleep_schedule: profileData.sleep_schedule || "flexible",
        location_label: profileData.location_label || "",
        location: profileData.location || "",
        school: profileData.school || "",
        occupation: profileData.occupation || "",
        languages_spoken: languagesArray.join(", "),
        pets: petsArray.join(", "),
        interests: interestsNames.join(", "),
        bio: profileData.bio || "",
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load preferences.");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        bio: form.bio ?? profile.bio ?? "",
        gender: form.gender || (gender?.name ?? ""),
        orientation: form.orientation || (orientation?.name ?? ""),
        pronouns: form.pronouns || "any",
        relationship_goal: form.relationship_goal || "casual dating",
        religion: form.religion || "other",
        diet: form.diet || "omnivore",
        exercise_frequency: form.exercise_frequency || "sometimes",
        sleep_schedule: form.sleep_schedule || "flexible",
        location_label: form.location_label || "",
        location: form.location || "",
        school: form.school || "",
        occupation: form.occupation || "",
        languages_spoken: parseList(form.languages_spoken),
        pets: parseList(form.pets),
        interests: parseList(form.interests),

        // keep existing / hidden fields
        drug_use: profile.drug_use ?? false,
        weed_use: profile.weed_use ?? false,
        show_precise_location: profile.show_precise_location ?? false,
        personality_type: profile.personality_type,
        love_language: profile.love_language,
        attachment_style: profile.attachment_style,
        political_view: profile.political_view,
        zodiac_sign: profile.zodiac_sign,
        smoke_frequency: profile.smoke_frequency,
        drink_frequency: profile.drink_frequency,
      };

      if (!payload.gender || !payload.orientation) {
        throw new Error("Gender and orientation must be set.");
      }

      const res = await fetchWithAuth("/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Profile update error:", errBody);
        throw new Error(
          errBody?.detail || errBody?.message || "Unable to save preferences"
        );
      }

      await loadData();
      navigate("/settings");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white">
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full px-4 py-3 text-white overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-3">Edit preferences</h1>
      <p className="text-sm text-neutral-400 mb-4">
        Update how you show up in Spark.
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-10">
        {/* Basics */}
        <section className="rounded-2xl bg-[#171717] p-4 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Basics
          </h2>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Gender
            </label>
            <select
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">Select gender</option>
              {genderOptions.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Orientation
            </label>
            <select
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.orientation}
              onChange={(e) => updateField("orientation", e.target.value)}
            >
              <option value="">Select orientation</option>
              {orientationOptions.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Pronouns
            </label>
            <select
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.pronouns}
              onChange={(e) => updateField("pronouns", e.target.value)}
            >
              {PRONOUNS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* About & location */}
        <section className="rounded-2xl bg-[#171717] p-4 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            About & location
          </h2>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Bio
            </label>
            <textarea
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm min-h-[80px]"
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Share something memorable about yourself."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Relationship goal
            </label>
            <input
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.relationship_goal}
              onChange={(e) =>
                updateField("relationship_goal", e.target.value)
              }
              placeholder="casual dating, long-term, friends..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Location label
            </label>
            <input
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.location_label}
              onChange={(e) =>
                updateField("location_label", e.target.value)
              }
              placeholder="Baltimore, MD"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Actual location
            </label>
            <input
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Neighborhood / city"
            />
          </div>
        </section>

        {/* Lifestyle */}
        <section className="rounded-2xl bg-[#171717] p-4 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Lifestyle
          </h2>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Religion
            </label>
            <select
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.religion}
              onChange={(e) => updateField("religion", e.target.value)}
            >
              {RELIGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Diet
            </label>
            <select
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.diet}
              onChange={(e) => updateField("diet", e.target.value)}
            >
              {DIETS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Exercise frequency
            </label>
            <select
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.exercise_frequency}
              onChange={(e) =>
                updateField("exercise_frequency", e.target.value)
              }
            >
              {EXERCISE_FREQ.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Sleep schedule
            </label>
            <select
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.sleep_schedule}
              onChange={(e) =>
                updateField("sleep_schedule", e.target.value)
              }
            >
              {SLEEP_SCHEDULES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Arrays */}
        <section className="rounded-2xl bg-[#171717] p-4 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Languages, pets, interests
          </h2>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Languages spoken
            </label>
            <input
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.languages_spoken}
              onChange={(e) =>
                updateField("languages_spoken", e.target.value)
              }
              placeholder="english, spanish"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Pets
            </label>
            <input
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.pets}
              onChange={(e) => updateField("pets", e.target.value)}
              placeholder="dogs, cats"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Interests
            </label>
            <input
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm"
              value={form.interests}
              onChange={(e) => updateField("interests", e.target.value)}
              placeholder="music, gym, coffee..."
            />
          </div>
        </section>

        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex-1 rounded-xl border border-neutral-600 px-4 py-3 text-sm text-neutral-200"
            disabled={saving}
          >
            <span className="text-neutral-200">Cancel</span>
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
