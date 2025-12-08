import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

export default function EditPreferencesPage() {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const toArray = (val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  // Enum options loaded from API
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
  
  // Core preference state
  const [preferences, setPreferences] = useState({
    target_gender: "any",
    age_min: 18,
    age_max: 70,
    max_distance: 50,
  });

  // Extra options state
  // IMPORTANT: ALL fields are arrays (to widen search criteria) EXCEPT school which is text
  const [extraOptions, setExtraOptions] = useState({
    // PREFERENCE FILTERS - All are arrays to allow multiple acceptable values
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
    
    // MULTI-SELECT fields (stored in junction tables)
    interests: [],
    languages_spoken: [],
    pets: [],
    
    // SPECIAL FIELDS
    school: "",  // Text field
    drug_use: [],  // List of acceptable frequencies
    weed_use: [],  // List of acceptable frequencies
  });

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

      setEnumOptions({
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
      });

      const res = await fetchWithAuth("/user/me/preferences");
      
      if (res.ok) {
        const data = await res.json();
        
        setPreferences({
          target_gender: data.target_gender || "any",
          age_min: data.age_min || 18,
          age_max: data.age_max || 70,
          max_distance: data.max_distance || 50,
        });

        if (data.extra_options) {
          const eo = data.extra_options;
          setExtraOptions({
            // ALL PREFERENCE FILTERS: Keep as arrays (already come as arrays from backend)
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
            
            // MULTI-SELECT: Keep as arrays
            interests: toArray(eo.interests),
            languages_spoken: toArray(eo.languages_spoken),
            pets: toArray(eo.pets),
            
            // SPECIAL FIELDS
            school: eo.school || "",
            // Filter out booleans, keep only string enum values
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const cleanedExtraOptions = Object.entries(extraOptions).reduce(
        (acc, [key, value]) => {
          if (key === "school") {
            // School is a text field
            if (value && value.trim() !== "") acc[key] = value.trim();
          } else if (Array.isArray(value)) {
            // All other fields are arrays - filter out any non-string values and only include if not empty
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

      console.log("Sending payload:", payload);

      const res = await fetchWithAuth("/user/me/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error response:", errorData);
        const detail = errorData.detail;

        let msg = "Failed to save preferences";
        if (typeof detail === "string") msg = detail;
        else if (Array.isArray(detail))
          msg = detail.map(d => d.msg || JSON.stringify(d)).join(" | ");
        else if (detail) msg = JSON.stringify(detail);

        throw new Error(msg);
      }

      navigate("/settings");
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError(err.message || "Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayValue = (array, value) => {
    return array.includes(value)
      ? array.filter(v => v !== value)
      : [...array, value];
  };

  const formatLabel = (str) => {
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading preferences...</p>
        </div>
      </div>
    );
  }

  // MULTI SELECT component (used for ALL preference filters to widen the net)
  const MultiSelectSection = ({ keyName, label, options }) => {
    if (options.length === 0) return null;

    return (
      <section key={keyName} className="mb-6 rounded-2xl bg-[#171717] p-4">
        <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 mb-3">
          {label} (Select Multiple)
        </h2>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setExtraOptions({
                ...extraOptions,
                [keyName]: toggleArrayValue(extraOptions[keyName], option)
              })}
              className={`rounded-xl px-3 py-2 text-xs transition ${
                extraOptions[keyName].includes(option)
                  ? "bg-purple-600 text-white"
                  : "bg-[#262626] text-neutral-300 hover:bg-[#303030]"
              }`}
            >
              {formatLabel(option)}
            </button>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="h-full w-full px-4 py-3 text-white overflow-y-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/settings")}
          className="text-neutral-400 hover:text-white transition"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold">Edit Preferences</h1>
        <div className="w-12"></div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-900/20 border border-red-500/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Target Gender - Single Select */}
      <section className="mb-6 rounded-2xl bg-[#171717] p-4">
        <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 mb-3">
          Show Me
        </h2>
        <div className="space-y-2">
          {enumOptions.genders.map((gender) => (
            <button
              key={gender}
              onClick={() => setPreferences({ ...preferences, target_gender: gender })}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                preferences.target_gender === gender
                  ? "bg-purple-600"
                  : "bg-[#262626] text-neutral-300 hover:bg-[#303030]"
              }`}
            >
              <span className="text-neutral-200">{formatLabel(gender)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Age Range */}
      <section className="mb-6 rounded-2xl bg-[#171717] p-4">
        <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 mb-3">
          Age Range
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-2">
              Minimum Age: {preferences.age_min}
            </label>
            <input
              type="range"
              min="18"
              max="99"
              value={preferences.age_min}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setPreferences({
                  ...preferences,
                  age_min: val,
                  age_max: Math.max(val, preferences.age_max),
                });
              }}
              className="w-full h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-2">
              Maximum Age: {preferences.age_max}
            </label>
            <input
              type="range"
              min="18"
              max="99"
              value={preferences.age_max}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setPreferences({
                  ...preferences,
                  age_max: val,
                  age_min: Math.min(val, preferences.age_min),
                });
              }}
              className="w-full h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
        </div>
      </section>

      {/* Distance */}
      <section className="mb-6 rounded-2xl bg-[#171717] p-4">
        <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 mb-3">
          Maximum Distance
        </h2>
        <div>
          <label className="block text-sm text-neutral-300 mb-2">
            {preferences.max_distance} miles
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={preferences.max_distance}
            onChange={(e) =>
              setPreferences({ ...preferences, max_distance: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      </section>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full mb-6 rounded-xl bg-[#171717] px-4 py-3 text-left text-sm text-neutral-300 hover:bg-[#262626] transition flex items-center justify-between"
      >
        <span className="uppercase tracking-[0.25em] text-neutral-400">
          Advanced Filters
        </span>
        <span className="text-xl">{showAdvanced ? "−" : "+"}</span>
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <>
          {/* ALL PREFERENCE FIELDS ARE MULTI-SELECT to widen the search net */}
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
          <MultiSelectSection
            keyName="political_view"
            label="Political View"
            options={enumOptions.political_views}
          />
          <MultiSelectSection
            keyName="zodiac_sign"
            label="Zodiac Sign"
            options={enumOptions.zodiac_signs}
          />
          <MultiSelectSection
            keyName="religion"
            label="Religion"
            options={enumOptions.religions}
          />
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
            keyName="sleep_schedule"
            label="Sleep Schedule"
            options={enumOptions.sleep_schedules}
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

          {/* MULTI-SELECT JUNCTION TABLE FIELDS */}
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

          {/* School - Text Input (ONLY text field) */}
          <section className="mb-6 rounded-2xl bg-[#171717] p-4">
            <h2 className="text-sm uppercase tracking-[0.25em] text-neutral-400 mb-3">
              School
            </h2>
            <input
              type="text"
              placeholder="e.g., Harvard University"
              value={extraOptions.school}
              onChange={(e) => setExtraOptions({ ...extraOptions, school: e.target.value })}
              className="w-full rounded-xl bg-[#262626] px-4 py-3 text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </section>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 px-4 py-4 text-white font-semibold transition mb-8"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}