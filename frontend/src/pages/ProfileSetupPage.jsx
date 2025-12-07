import { useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileSetupPage() {
  const { fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // 1) Save basic user info
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

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("Error /user/me:", data || res.statusText);
        throw new Error("Failed to save basic info");
      }

      // 2) Create / update profile with ALL required fields
      res = await fetchWithAuth("/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drug_use: false,
          weed_use: false,
          show_precise_location: false,
          gender,
          orientation,
          bio: "",
          location: "",
          location_label: "",
          school: "",
          occupation: "",
          pronouns: "any",    
          relationship_goal: "casual dating",
          personality_type: "ambivert",  
          love_language: "quality time",
          attachment_style: "secure",
          political_view: "moderate",
          zodiac_sign: "aries",
          religion: "other",   
          diet: "omnivore",           
          exercise_frequency: "sometimes",
          sleep_schedule: "flexible", 

          interests: [],
          languages_spoken: [],
          pets: [],

          smoke_frequency: null,
          drink_frequency: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("Error /profile/me:", data || res.statusText);
        throw new Error("Failed to initialize profile");
      }

      // 3) On success, go into the app
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to complete onboarding");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="p-6 text-white max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Welcome to Spark ✨</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 rounded bg-neutral-800"
            placeholder="First name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />

          <input
            className="w-full p-3 rounded bg-neutral-800"
            placeholder="Last name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            required
          />

          <input
            type="date"
            className="w-full p-3 rounded bg-neutral-800"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />

          <select
            className="w-full p-3 rounded bg-neutral-800"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">Select gender</option>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="non-binary">non-binary</option>
            <option value="genderqueer">genderqueer</option>
            <option value="genderfluid">genderfluid</option>
          </select>

          <select
            className="w-full p-3 rounded bg-neutral-800"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            required
          >
            <option value="">Select orientation</option>
            <option value="straight">straight</option>
            <option value="gay">gay</option>
            <option value="lesbian">lesbian</option>
            <option value="bisexual">bisexual</option>
            <option value="pansexual">pansexual</option>
            <option value="asexual">asexual</option>
          </select>

          {error && <p className="text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full p-3 rounded bg-white text-black font-bold"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
