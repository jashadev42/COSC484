import React, { useState, useEffect } from "react";
import { useAuth } from "@contexts/AuthContext";

const DEFAULT_PREFERENCES = {
  target_gender: "any",
  age_min: 18,
  age_max: 70,
  max_distance: 50,
};

const DEFAULT_EXTRA_OPTIONS = {
  relationship_goal: [],
  personality_type: [],
  love_language: [],
  attachment_style: [],
  political_view: [],
  zodiac_sign: [],
  religion: [],
  diet: [],
  exercise_frequency: [],
  smoke_frequency: [],
  drink_frequency: [],
  sleep_schedule: [],
  interests: [],
  languages_spoken: [],
  pets: [],
  school: "",
  drug_use: [],
  weed_use: [],
};

export default function PreferencesSection({ onPreferencesSaved }) {
  const { fetchWithAuth } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const toArray = (val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const [enumOptions, setEnumOptions] = useState({
    genders: [],
    relationship_goals: [],
    interests: [],
    personality_types: [],
    love_languages: [],
    languages: [],
    attachment_styles: [],
    political_views: [],
    zodiac_signs: [],
    religions: [],
    diets: [],
    exercise_frequencies: [],
    pets: [],
    smoke_frequencies: [],
    drink_frequencies: [],
    sleep_schedules: [],
  });
  
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const [extraOptions, setExtraOptions] = useState(DEFAULT_EXTRA_OPTIONS);

  useEffect(() => {
    loadEnumsAndPreferences();
  }, []);

  const loadAllEnumOptions = async (endpoint) => {
    try {
      const res = await fetchWithAuth(endpoint);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data.map(item => item.name || item) : [];
      }
    } catch (err) {
      console.warn(`Failed to load ${endpoint}:`, err);
    }
    return [];
  };

  const loadEnumsAndPreferences = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [
        genders,
        relationship_goals,
        interests,
        personality_types,
        love_languages,
        languages,
        attachment_styles,
        political_views,
        zodiac_signs,
        religions,
        diets,
        exercise_frequencies,
        pets,
        smoke_frequencies,
        drink_frequencies,
        sleep_schedules,
      ] = await Promise.all([
        loadAllEnumOptions('/profile/genders'),
        loadAllEnumOptions('/profile/relationship-goals'),
        loadAllEnumOptions('/profile/interests'),
        loadAllEnumOptions('/profile/personality-types'),
        loadAllEnumOptions('/profile/love-languages'),
        loadAllEnumOptions('/profile/languages'),
        loadAllEnumOptions('/profile/attachment-styles'),
        loadAllEnumOptions('/profile/political-views'),
        loadAllEnumOptions('/profile/zodiac-signs'),
        loadAllEnumOptions('/profile/religions'),
        loadAllEnumOptions('/profile/diets'),
        loadAllEnumOptions('/profile/exercise-frequencies'),
        loadAllEnumOptions('/profile/pets'),
        loadAllEnumOptions('/profile/smoke-frequencies'),
        loadAllEnumOptions('/profile/drink-frequencies'),
        loadAllEnumOptions('/profile/sleep-schedules'),
      ]);

      const gendersWithAny = [...genders, "any"];

      setEnumOptions({
        genders: gendersWithAny,
        relationship_goals,
        interests,
        personality_types,
        love_languages,
        languages,
        attachment_styles,
        political_views,
        zodiac_signs,
        religions,
        diets,
        exercise_frequencies,
        pets,
        smoke_frequencies,
        drink_frequencies,
        sleep_schedules,
      });

      const res = await fetchWithAuth("/user/me/preferences");
      
      if (res.ok) {
        const data = await res.json();
        
        setPreferences({
          target_gender: data.target_gender || DEFAULT_PREFERENCES.target_gender,
          age_min: data.age_min || DEFAULT_PREFERENCES.age_min,
          age_max: data.age_max || DEFAULT_PREFERENCES.age_max,
          max_distance: data.max_distance || DEFAULT_PREFERENCES.max_distance,
        });

        if (data.extra_options) {
          const eo = data.extra_options;
          setExtraOptions({
            relationship_goal: toArray(eo.relationship_goal),
            personality_type: toArray(eo.personality_type),
            love_language: toArray(eo.love_language),
            attachment_style: toArray(eo.attachment_style),
            political_view: toArray(eo.political_view),
            zodiac_sign: toArray(eo.zodiac_sign),
            religion: toArray(eo.religion),
            diet: toArray(eo.diet),
            exercise_frequency: toArray(eo.exercise_frequency),
            smoke_frequency: toArray(eo.smoke_frequency),
            drink_frequency: toArray(eo.drink_frequency),
            sleep_schedule: toArray(eo.sleep_schedule),
            interests: toArray(eo.interests),
            languages_spoken: toArray(eo.languages_spoken),
            pets: toArray(eo.pets),
            school: eo.school || "",
            drug_use: toArray(eo.drug_use).filter(val => typeof val === 'string'),
            weed_use: toArray(eo.weed_use).filter(val => typeof val === 'string'),
          });

          const hasExtraOptions = Object.entries(data.extra_options).some(
            ([key, val]) => {
              if (key === 'school') return val && val.trim() !== '';
              if (val === null || val === undefined) return false;
              if (Array.isArray(val)) return val.length > 0;
              return true;
            }
          );
          setShowAdvanced(hasExtraOptions);
        }
      } else if (res.status !== 404) {
        throw new Error("Could not load preferences");
      }
    } catch (err) {
      console.error("Error loading:", err);
      setError("Could not load preferences. Using defaults.");
      setPreferences(DEFAULT_PREFERENCES);
      setExtraOptions(DEFAULT_EXTRA_OPTIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const cleanedExtraOptions = Object.entries(extraOptions).reduce(
        (acc, [key, value]) => {
          if (key === "school") {
            if (value && value.trim() !== "") acc[key] = value.trim();
          } else if (Array.isArray(value)) {
            const filteredValue = value.filter(v => typeof v === 'string' && v !== '');
            if (filteredValue.length > 0) acc[key] = filteredValue;
          }
          return acc;
        },
        {}
      );

      const payload = {
        target_gender: preferences.target_gender,
        age_min: Number(preferences.age_min),
        age_max: Number(preferences.age_max),
        max_distance: Number(preferences.max_distance),
        extra_options:
          Object.keys(cleanedExtraOptions).length > 0 ? cleanedExtraOptions : null,
      };

      const res = await fetchWithAuth("/user/me/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const detail = errorData.detail;

        let msg = "Failed to save preferences";
        if (typeof detail === "string") msg = detail;
        else if (Array.isArray(detail))
          msg = detail.map(d => d.msg || JSON.stringify(d)).join(" | ");
        else if (detail) msg = JSON.stringify(detail);

        throw new Error(msg);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      if (onPreferencesSaved) {
        onPreferencesSaved();
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError(err.message || "Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault()
    setPreferences({ ...DEFAULT_PREFERENCES });
    setExtraOptions({ ...DEFAULT_EXTRA_OPTIONS });
    setShowAdvanced(false);
    setSaved(false);
    setError("");
  };

  const toggleArrayValue = (array, value) => {
    return array.includes(value)
      ? array.filter(v => v !== value)
      : [...array, value];
  };

  const formatLabel = (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const MultiSelectSection = ({ keyName, label, options }) => {
    if (options.length === 0) return null;

    const selectedCount = extraOptions[keyName]?.length || 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            {label}
          </label>
          {selectedCount > 0 && (
            <span className="text-xs text-primary">{selectedCount} selected</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-[#262626]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setExtraOptions({
                ...extraOptions,
                [keyName]: toggleArrayValue(extraOptions[keyName], option)
              })}
              className={`rounded-lg px-3 py-2 text-xs transition ${
                extraOptions[keyName].includes(option)
                  ? "bg-primary text-black font-medium"
                  : "bg-[#1a1a1a] text-neutral-300 hover:bg-[#252525]"
              }`}
            >
              <span className={`${
                extraOptions[keyName].includes(option)
                  ? "text-darkest "
                  : " text-neutral-200"
              }`}>{formatLabel(option)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="mb-6 rounded-2xl bg-[#171717] p-4">
        <div className="flex items-center justify-center py-8">
          <span className="text-xs text-neutral-500">Loading preferences...</span>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Match Preferences */}
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
          {saved && (
            <span className="text-xs text-green-400">Saved</span>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Target Gender */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Looking for
            </label>
            <select
              disabled={saving}
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
              value={preferences.target_gender}
              onChange={(e) => setPreferences({ ...preferences, target_gender: e.target.value })}
            >
              {enumOptions.genders.map((g) => (
                <option key={g} value={g}>
                  {formatLabel(g)}
                </option>
              ))}
            </select>
          </div>

          {/* Age Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Age min
              </label>
              <input
                type="number"
                min={18}
                max={99}
                disabled={saving}
                className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
                value={preferences.age_min}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPreferences({
                    ...preferences,
                    age_min: val,
                    age_max: Math.max(val, preferences.age_max),
                  });
                }}
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
                disabled={saving}
                className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
                value={preferences.age_max}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPreferences({
                    ...preferences,
                    age_max: val,
                    age_min: Math.min(val, preferences.age_min),
                  });
                }}
              />
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Max distance (miles)
              </label>
              <span className="text-sm text-neutral-200 font-semibold">
                {preferences.max_distance} mi
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={200}
              step={1}
              disabled={saving}
              className="w-full"
              value={preferences.max_distance}
              onChange={(e) => setPreferences({ ...preferences, max_distance: Number(e.target.value) })}
            />
            <input
              type="number"
              min={1}
              max={200}
              disabled={saving}
              className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
              value={preferences.max_distance}
              onChange={(e) => setPreferences({ ...preferences, max_distance: Number(e.target.value) })}
            />
          </div>

          {/* Save/Reset Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={(e) => handleReset(e)}
              className="flex-1 rounded-xl border border-neutral-600 px-4 py-3 text-sm text-neutral-200 disabled:opacity-50"
              disabled={saving}
            >
              <span className="text-neutral-200">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </section>

      {/* Advanced Filters Toggle */}
      <section className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full rounded-2xl bg-[#171717] px-4 py-3 text-left text-sm hover:bg-[#1f1f1f] transition flex items-center justify-between"
        >
          <div>
            <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400">
              Additional Filters
            </h2>
            <p className="text-xs text-neutral-500">
              Narrow your matches by preferences
            </p>
          </div>
          <span className="text-xl text-neutral-400">{showAdvanced ? "−" : "+"}</span>
        </button>
      </section>

      {/* Advanced Filters */}
      {showAdvanced && (
        <section className="mb-6 rounded-2xl bg-[#171717] p-4 space-y-6">
          <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Filter by attributes (select multiple to widen your search)
          </h2>

          {/* Relationship & Personality */}
          <div className="space-y-6">
            <MultiSelectSection
              keyName="relationship_goal"
              label="Relationship Goal"
              options={enumOptions.relationship_goals}
            />
            <MultiSelectSection
              keyName="personality_type"
              label="Personality Type"
              options={enumOptions.personality_types}
            />
            <MultiSelectSection
              keyName="love_language"
              label="Love Language"
              options={enumOptions.love_languages}
            />
            <MultiSelectSection
              keyName="attachment_style"
              label="Attachment Style"
              options={enumOptions.attachment_styles}
            />
          </div>

          {/* Beliefs & Values */}
          <div className="pt-4 border-t border-neutral-700 space-y-6">
            <h3 className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Beliefs & Values
            </h3>
            <MultiSelectSection
              keyName="political_view"
              label="Political View"
              options={enumOptions.political_views}
            />
            <MultiSelectSection
              keyName="religion"
              label="Religion"
              options={enumOptions.religions}
            />
            <MultiSelectSection
              keyName="zodiac_sign"
              label="Zodiac Sign"
              options={enumOptions.zodiac_signs}
            />
          </div>

          {/* Lifestyle */}
          <div className="pt-4 border-t border-neutral-700 space-y-6">
            <h3 className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Lifestyle
            </h3>
            <MultiSelectSection
              keyName="diet"
              label="Diet"
              options={enumOptions.diets}
            />
            <MultiSelectSection
              keyName="exercise_frequency"
              label="Exercise Frequency"
              options={enumOptions.exercise_frequencies}
            />
            <MultiSelectSection
              keyName="smoke_frequency"
              label="Smoking"
              options={enumOptions.smoke_frequencies}
            />
            <MultiSelectSection
              keyName="drink_frequency"
              label="Drinking"
              options={enumOptions.drink_frequencies}
            />
            <MultiSelectSection
              keyName="weed_use"
              label="Weed Use"
              options={enumOptions.smoke_frequencies}
            />
            <MultiSelectSection
              keyName="drug_use"
              label="Drug Use"
              options={enumOptions.smoke_frequencies}
            />
            <MultiSelectSection
              keyName="sleep_schedule"
              label="Sleep Schedule"
              options={enumOptions.sleep_schedules}
            />
          </div>

          {/* Interests & Connections */}
          <div className="pt-4 border-t border-neutral-700 space-y-6">
            <h3 className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Interests & Connections
            </h3>
            <MultiSelectSection
              keyName="interests"
              label="Interests"
              options={enumOptions.interests}
            />
            <MultiSelectSection
              keyName="languages_spoken"
              label="Languages Spoken"
              options={enumOptions.languages}
            />
            <MultiSelectSection
              keyName="pets"
              label="Pets"
              options={enumOptions.pets}
            />

            {/* School - Text Input */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                School
              </label>
              <input
                type="text"
                placeholder="e.g., Harvard University"
                value={extraOptions.school}
                onChange={(e) => setExtraOptions({ ...extraOptions, school: e.target.value })}
                className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Save Button for Advanced Filters */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save All Preferences"}
            </button>
          </div>
        </section>
      )}
    </>
  );
}