import { useAuth } from '@contexts/AuthContext'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LoadingWheel } from '@components/LoadingWheel'

const DEFAULT_PHOTO =
`data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="600" height="800" fill="url(#grad)" />
    <g fill="#555" font-family="Arial, Helvetica, sans-serif" font-size="46" text-anchor="middle">
      <text x="300" y="360">upload</text>
      <text x="300" y="420">a photo</text>
    </g>
  </svg>
`)}`

function formatValue(value) {
  if (!value) return 'add info'
  if (Array.isArray(value)) {
    return value.length ? value.map(v => formatValue(v)).join(', ') : 'add info'
  }
  const cleaned = String(value)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned
    ? cleaned[0].toUpperCase() + cleaned.slice(1).toLowerCase()
    : 'add info'
}

function calculateAge(dateString) {
  if (!dateString) return null
  const birthDate = new Date(dateString)
  if (Number.isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age -= 1
  return age
}

const StatBadge = ({ label }) => (
  <div className="flex items-center gap-1 text-xs uppercase tracking-[0.35em] text-[#C7C4A7]">
    <span className="tracking-[0.25em]">{label}</span>
  </div>
)

const SectionCard = ({ title, children }) => (
  <div className="space-y-2 rounded-3xl bg-[#272323] p-4">
    <p className="text-xs uppercase tracking-[0.4em] text-[#C7C4A7]">{title}</p>
    <div className="text-lg leading-relaxed text-white">{children}</div>
  </div>
)

const FloatingButton = ({ icon, onClick, label }) => (
  <button
    aria-label={label}
    onClick={onClick}
    className="absolute -right-3 -bottom-3 grid h-12 w-12 place-content-center rounded-full bg-primary text-2xl text-darkest hover:opacity-80"
  >
    {icon}
  </button>
)

function ProfileView({
  userInfo,
  profile,
  preferences,
  photoUrl,
  onEdit,
}) {
  const age = calculateAge(userInfo?.birthdate)
  const languages = Array.isArray(profile?.languages_spoken) ? profile.languages_spoken : []
  const interests = Array.isArray(profile?.interests) ? profile.interests : []
  const pets = Array.isArray(profile?.pets) ? profile.pets : []

  return (
    <div className="w-full h-full space-y-6 text-white overflow-y-auto p-4 pb-24">
      <header className="flex items-center justify-between text-lg uppercase tracking-[0.2em] text-primary">
        <span className="text-white">your profile</span>
      </header>

      <div className="flex justify-center">
        <div className="overflow-hidden rounded-[24px] w-fit h-fit bg-cover">
          <img
            src={photoUrl || DEFAULT_PHOTO}
            alt="primary profile"
            className="w-full h-full object-cover max-w-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <StatBadge label={formatValue(profile?.gender)} />
        {age !== null && <StatBadge label={`${age}`} />}
        {/* <StatBadge label={formatValue(profile?.location_label || profile?.location)} /> */}
      </div>

      <SectionCard title="about me">
        {profile?.bio || 'Share something memorable about yourself.'}
      </SectionCard>

      <div className="relative">
        <SectionCard title="basics">
          <dl className="space-y-2 text-base">
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Relationship Goal</dt>
              <dd>{formatValue(profile?.relationship_goal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Orientation</dt>
              <dd>{formatValue(profile?.orientation)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Pronouns</dt>
              <dd>{formatValue(profile?.pronouns)}</dd>
            </div>
            {languages.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-[#C7C4A7]">Languages</dt>
                <dd className="text-right">{languages.map(l => formatValue(l)).join(', ')}</dd>
              </div>
            )}
          </dl>
        </SectionCard>
        <FloatingButton icon="✎" label="Edit profile" onClick={onEdit} />
      </div>

      <SectionCard title="lifestyle">
        <dl className="space-y-2 text-base">
          {profile?.smoke_frequency && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Smoking</dt>
              <dd>{formatValue(profile.smoke_frequency)}</dd>
            </div>
          )}
          {profile?.drink_frequency && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Drinking</dt>
              <dd>{formatValue(profile.drink_frequency)}</dd>
            </div>
          )}
          {profile?.weed_use && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Weed</dt>
              <dd>{formatValue(profile.weed_use)}</dd>
            </div>
          )}
          {profile?.drug_use && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Drugs</dt>
              <dd>{formatValue(profile.drug_use)}</dd>
            </div>
          )}
          {profile?.exercise_frequency && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Exercise</dt>
              <dd>{formatValue(profile.exercise_frequency)}</dd>
            </div>
          )}
          {profile?.diet && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Diet</dt>
              <dd>{formatValue(profile.diet)}</dd>
            </div>
          )}
          {profile?.sleep_schedule && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Sleep Schedule</dt>
              <dd>{formatValue(profile.sleep_schedule)}</dd>
            </div>
          )}
        </dl>
      </SectionCard>

      <SectionCard title="personality & beliefs">
        <dl className="space-y-2 text-base">
          {profile?.personality_type && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Personality</dt>
              <dd>{formatValue(profile.personality_type)}</dd>
            </div>
          )}
          {profile?.love_language && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Love Language</dt>
              <dd>{formatValue(profile.love_language)}</dd>
            </div>
          )}
          {profile?.attachment_style && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Attachment Style</dt>
              <dd>{formatValue(profile.attachment_style)}</dd>
            </div>
          )}
          {profile?.political_view && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Political View</dt>
              <dd>{formatValue(profile.political_view)}</dd>
            </div>
          )}
          {profile?.religion && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Religion</dt>
              <dd>{formatValue(profile.religion)}</dd>
            </div>
          )}
          {profile?.zodiac_sign && (
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Zodiac Sign</dt>
              <dd>{formatValue(profile.zodiac_sign)}</dd>
            </div>
          )}
        </dl>
      </SectionCard>

      {(profile?.school || profile?.occupation) && (
        <SectionCard title="education & work">
          <dl className="space-y-2 text-base">
            {profile.school && (
              <div className="flex justify-between">
                <dt className="text-[#C7C4A7]">School</dt>
                <dd>{profile.school}</dd>
              </div>
            )}
            {profile.occupation && (
              <div className="flex justify-between">
                <dt className="text-[#C7C4A7]">Occupation</dt>
                <dd>{profile.occupation}</dd>
              </div>
            )}
          </dl>
        </SectionCard>
      )}

      {pets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-[#C7C4A7]">pets</p>
          <div className="flex flex-wrap gap-2">
            {pets.map((pet) => (
              <span
                key={pet}
                className="rounded-full bg-[#2f2b2b] px-3 py-1 text-sm text-primary"
              >
                {formatValue(pet)}
              </span>
            ))}
          </div>
        </div>
      )}

      {interests.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-[#C7C4A7]">interests</p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-[#2f2b2b] px-3 py-1 text-sm text-primary"
              >
                {formatValue(interest)}
              </span>
            ))}
          </div>
        </div>
      )}

      {preferences && (
        <SectionCard title="match preferences">
          <dl className="space-y-2 text-base">
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Looking for</dt>
              <dd>{formatValue(preferences.target_gender)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Age range</dt>
              <dd>
                {preferences.age_min}–{preferences.age_max}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Max distance</dt>
              <dd>{preferences.max_distance} miles</dd>
            </div>
          </dl>
        </SectionCard>
      )}
    </div>
  )
}

function ProfileEdit({
  profile,
  photoUrl,
  saving,
  enumOptions,
  onCancel,
  onSubmit,
  onUploadPhoto,
}) {
  const [formState, setFormState] = useState({
    bio: profile?.bio || '',
    location_label: profile?.location_label || '',
    location: profile?.location || '',
    show_precise_location: Boolean(profile?.show_precise_location),
    
    // Single-select enums
    gender: profile?.gender || '',
    orientation: profile?.orientation || '',
    pronouns: profile?.pronouns || '',
    relationship_goal: profile?.relationship_goal || '',
    personality_type: profile?.personality_type || '',
    love_language: profile?.love_language || '',
    attachment_style: profile?.attachment_style || '',
    political_view: profile?.political_view || '',
    zodiac_sign: profile?.zodiac_sign || '',
    religion: profile?.religion || '',
    diet: profile?.diet || '',
    exercise_frequency: profile?.exercise_frequency || '',
    smoke_frequency: profile?.smoke_frequency || '',
    drink_frequency: profile?.drink_frequency || '',
    sleep_schedule: profile?.sleep_schedule || '',
    weed_use: profile?.weed_use || '',
    drug_use: profile?.drug_use || '',
    
    // Multi-select arrays
    languages_spoken: Array.isArray(profile?.languages_spoken) ? profile.languages_spoken : [],
    interests: Array.isArray(profile?.interests) ? profile.interests : [],
    pets: Array.isArray(profile?.pets) ? profile.pets : [],
    
    // Text fields
    school: profile?.school || '',
    occupation: profile?.occupation || '',
  })

  useEffect(() => {
    setFormState({
      bio: profile?.bio || '',
      location_label: profile?.location_label || '',
      location: profile?.location || '',
      show_precise_location: Boolean(profile?.show_precise_location),
      gender: profile?.gender || '',
      orientation: profile?.orientation || '',
      pronouns: profile?.pronouns || '',
      relationship_goal: profile?.relationship_goal || '',
      personality_type: profile?.personality_type || '',
      love_language: profile?.love_language || '',
      attachment_style: profile?.attachment_style || '',
      political_view: profile?.political_view || '',
      zodiac_sign: profile?.zodiac_sign || '',
      religion: profile?.religion || '',
      diet: profile?.diet || '',
      exercise_frequency: profile?.exercise_frequency || '',
      smoke_frequency: profile?.smoke_frequency || '',
      drink_frequency: profile?.drink_frequency || '',
      sleep_schedule: profile?.sleep_schedule || '',
      weed_use: profile?.weed_use || '',
      drug_use: profile?.drug_use || '',
      languages_spoken: Array.isArray(profile?.languages_spoken) ? profile.languages_spoken : [],
      interests: Array.isArray(profile?.interests) ? profile.interests : [],
      pets: Array.isArray(profile?.pets) ? profile.pets : [],
      school: profile?.school || '',
      occupation: profile?.occupation || '',
    })
  }, [profile])

  const updateField = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayValue = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }))
  }

  const fileInputRef = useRef(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUploadMessage, setPhotoUploadMessage] = useState('')
  const [photoUploadError, setPhotoUploadError] = useState('')

  const handlePhotoButtonClick = () => {
    if (uploadingPhoto) return
    fileInputRef.current?.click()
  }

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !onUploadPhoto) return

    setPhotoUploadError('')
    setPhotoUploadMessage('')
    setUploadingPhoto(true)

    try {
      await onUploadPhoto(file)
      setPhotoUploadMessage('Photo uploaded successfully.')
    } catch (err) {
      setPhotoUploadError(err?.message || 'Failed to upload photo.')
    } finally {
      setUploadingPhoto(false)
      event.target.value = ''
    }
  }

  const submit = (e) => {
    e.preventDefault()
    onSubmit(formState)
  }

  // Single-select dropdown component
  const SingleSelect = ({ label, value, options, fieldKey }) => (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-[0.2em] text-[#C7C4A7]">
        {label}
      </label>
      <select
        className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
        value={value}
        onChange={(e) => updateField(fieldKey, e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {formatValue(opt)}
          </option>
        ))}
      </select>
    </div>
  )

  // Multi-select button grid component
  const MultiSelect = ({ label, values, options, fieldKey }) => {
    if (!options || options.length === 0) return null
    
    const selectedCount = values?.length || 0

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-[0.2em] text-[#C7C4A7]">
            {label}
          </label>
          {selectedCount > 0 && (
            <span className="text-xs text-primary">{selectedCount} selected</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-[#262626]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleArrayValue(fieldKey, opt)}
              className={`rounded-lg px-3 py-2 text-xs transition ${
                values.includes(opt)
                  ? 'bg-primary text-black font-medium'
                  : 'bg-[#1a1a1a] text-neutral-300 hover:bg-[#252525]'
              }`}
            >
              <span className={` ${
                values.includes(opt)
                  ? 'text-black'
                  : 'text-neutral-300'
              }`}>{formatValue(opt)}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full h-full overflow-y-auto max-w-md space-y-6 text-white p-4 pb-24"
    >
      <header className="flex items-center justify-between text-lg uppercase tracking-[0.2em] text-primary">
        <span className="text-white">edit profile</span>
      </header>

      {/* Photo Upload */}
      <div className="space-y-4">
        <div className="rounded-[36px] overflow-hidden">
          <img
            src={photoUrl || DEFAULT_PHOTO}
            alt="primary profile"
            className="aspect-[10/12] w-full object-cover"
          />
        </div>

        <button
          type="button"
          onClick={handlePhotoButtonClick}
          className="w-full rounded-xl border border-primary px-4 py-2 text-sm uppercase tracking-[0.3em] hover:bg-primary/10 disabled:opacity-50"
          disabled={uploadingPhoto}
        >
          <span className="text-neutral-200">
            {uploadingPhoto ? 'Uploading…' : 'Upload new photo'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelected}
        />
        {photoUploadMessage && (
          <p className="text-xs text-emerald-300">{photoUploadMessage}</p>
        )}
        {photoUploadError && (
          <p className="text-xs text-red-400">{photoUploadError}</p>
        )}
      </div>

      {/* About Me */}
      <div className="space-y-1">
        <label className="text-xs uppercase tracking-[0.2em] text-[#C7C4A7]">
          about me
        </label>
        <textarea
          className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
          rows={4}
          value={formState.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          placeholder="Share a quick story or fun fact"
        />
      </div>

      {/* BASICS SECTION */}
      <div className="space-y-4 rounded-2xl bg-[#171717] p-4">
        <h3 className="text-xs uppercase tracking-[0.4em] text-neutral-400">Basics</h3>
        
        <SingleSelect
          label="Gender"
          value={formState.gender}
          options={enumOptions.genders || []}
          fieldKey="gender"
        />

        <SingleSelect
          label="Orientation"
          value={formState.orientation}
          options={enumOptions.orientations || []}
          fieldKey="orientation"
        />

        <SingleSelect
          label="Pronouns"
          value={formState.pronouns}
          options={enumOptions.pronouns || []}
          fieldKey="pronouns"
        />

        <SingleSelect
          label="Relationship Goal"
          value={formState.relationship_goal}
          options={enumOptions.relationship_goals || []}
          fieldKey="relationship_goal"
        />

        <MultiSelect
          label="Languages Spoken"
          values={formState.languages_spoken}
          options={enumOptions.languages || []}
          fieldKey="languages_spoken"
        />
      </div>

      {/* LOCATION SECTION */}
      <div className="space-y-4 rounded-2xl bg-[#171717] p-4">
        <h3 className="text-xs uppercase tracking-[0.4em] text-neutral-400">Location</h3>
        
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.2em] text-[#C7C4A7]">
            location label
          </label>
          <input
            type="text"
            className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
            value={formState.location_label}
            onChange={(e) => updateField('location_label', e.target.value)}
            placeholder="Towson, MD"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.2em] text-[#C7C4A7]">
            actual location
          </label>
          <input
            type="text"
            className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
            value={formState.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="123 Main St, Towson, MD 21252"
          />
        </div>

        <label className="flex items-center justify-between rounded-xl bg-[#262626] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#C7C4A7]">
          show precise location
          <input
            type="checkbox"
            className="h-5 w-5 accent-primary"
            checked={formState.show_precise_location}
            onChange={(e) => updateField('show_precise_location', e.target.checked)}
          />
        </label>
      </div>

      {/* LIFESTYLE SECTION */}
      <div className="space-y-4 rounded-2xl bg-[#171717] p-4">
        <h3 className="text-xs uppercase tracking-[0.4em] text-neutral-400">Lifestyle</h3>
        
        <SingleSelect label="Smoking" value={formState.smoke_frequency} options={enumOptions.smoke_frequencies || []} fieldKey="smoke_frequency" />
        <SingleSelect label="Drinking" value={formState.drink_frequency} options={enumOptions.drink_frequencies || []} fieldKey="drink_frequency" />
        <SingleSelect label="Weed Use" value={formState.weed_use} options={enumOptions.smoke_frequencies || []} fieldKey="weed_use" />
        <SingleSelect label="Drug Use" value={formState.drug_use} options={enumOptions.smoke_frequencies || []} fieldKey="drug_use" />
        <SingleSelect label="Exercise" value={formState.exercise_frequency} options={enumOptions.exercise_frequencies || []} fieldKey="exercise_frequency" />
        <SingleSelect label="Diet" value={formState.diet} options={enumOptions.diets || []} fieldKey="diet" />
        <SingleSelect label="Sleep Schedule" value={formState.sleep_schedule} options={enumOptions.sleep_schedules || []} fieldKey="sleep_schedule" />
      </div>

      {/* PERSONALITY SECTION */}
      <div className="space-y-4 rounded-2xl bg-[#171717] p-4">
        <h3 className="text-xs uppercase tracking-[0.4em] text-neutral-400">Personality & Beliefs</h3>
        
        <SingleSelect label="Personality Type" value={formState.personality_type} options={enumOptions.personality_types || []} fieldKey="personality_type" />
        <SingleSelect label="Love Language" value={formState.love_language} options={enumOptions.love_languages || []} fieldKey="love_language" />
        <SingleSelect label="Attachment Style" value={formState.attachment_style} options={enumOptions.attachment_styles || []} fieldKey="attachment_style" />
        <SingleSelect label="Political View" value={formState.political_view} options={enumOptions.political_views || []} fieldKey="political_view" />
        <SingleSelect label="Religion" value={formState.religion} options={enumOptions.religions || []} fieldKey="religion" />
        <SingleSelect label="Zodiac Sign" value={formState.zodiac_sign} options={enumOptions.zodiac_signs || []} fieldKey="zodiac_sign" />
      </div>

      {/* INTERESTS & PETS */}
      <div className="space-y-4 rounded-2xl bg-[#171717] p-4">
        <h3 className="text-xs uppercase tracking-[0.4em] text-neutral-400">Interests & Pets</h3>
        
        <MultiSelect
          label="Interests"
          values={formState.interests}
          options={enumOptions.interests || []}
          fieldKey="interests"
        />

        <MultiSelect
          label="Pets"
          values={formState.pets}
          options={enumOptions.pets || []}
          fieldKey="pets"
        />
      </div>

      {/* EDUCATION & WORK */}
      <div className="space-y-4 rounded-2xl bg-[#171717] p-4">
        <h3 className="text-xs uppercase tracking-[0.4em] text-neutral-400">Education & Work</h3>
        
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.2em] text-[#C7C4A7]">
            school
          </label>
          <input
            type="text"
            className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
            value={formState.school}
            onChange={(e) => updateField('school', e.target.value)}
            placeholder="e.g., Harvard University"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.2em] text-[#C7C4A7]">
            occupation
          </label>
          <input
            type="text"
            className="w-full rounded-xl bg-[#262626] px-3 py-2 text-sm text-white"
            value={formState.occupation}
            onChange={(e) => updateField('occupation', e.target.value)}
            placeholder="e.g., Software Engineer"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          className="rounded-full bg-red-400 px-6 py-3 uppercase tracking-[0.3em] text-white hover:opacity-80"
          onClick={onCancel}
          disabled={saving}
        >
          cancel
        </button>
        <button
          type="submit"
          className="grid h-12 w-12 place-content-center rounded-full bg-primary text-2xl text-darkest hover:opacity-80 disabled:opacity-50"
          disabled={saving}
          aria-label="Save profile"
        >
          ✓
        </button>
      </div>
    </form>
  )
}

export default function ProfileScreen() {
  const { fetchWithAuth, isAuthenticated } = useAuth()
  const [userInfo, setUserInfo] = useState(null)
  const [profile, setProfile] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [photos, setPhotos] = useState([])
  const [enumOptions, setEnumOptions] = useState({})
  const [mode, setMode] = useState('view')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Load enum options
  const loadEnumOptions = useCallback(async () => {
    try {
      const [
        genders,
        orientations,
        pronouns,
        relationship_goals,
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
        interests,
      ] = await Promise.all([
        fetchWithAuth('/profile/genders').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/orientations').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/pronouns').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/relationship-goals').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/personality-types').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/love-languages').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/languages').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/attachment-styles').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/political-views').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/zodiac-signs').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/religions').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/diets').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/exercise-frequencies').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/pets').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/smoke-frequencies').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/drink-frequencies').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/sleep-schedules').then(r => r.json()).catch(() => []),
        fetchWithAuth('/profile/interests').then(r => r.json()).catch(() => []),
      ])

      const extractNames = (arr) => Array.isArray(arr) ? arr.map(item => item.name || item) : []

      setEnumOptions({
        genders: extractNames(genders),
        orientations: extractNames(orientations),
        pronouns: extractNames(pronouns),
        relationship_goals: extractNames(relationship_goals),
        personality_types: extractNames(personality_types),
        love_languages: extractNames(love_languages),
        languages: extractNames(languages),
        attachment_styles: extractNames(attachment_styles),
        political_views: extractNames(political_views),
        zodiac_signs: extractNames(zodiac_signs),
        religions: extractNames(religions),
        diets: extractNames(diets),
        exercise_frequencies: extractNames(exercise_frequencies),
        pets: extractNames(pets),
        smoke_frequencies: extractNames(smoke_frequencies),
        drink_frequencies: extractNames(drink_frequencies),
        sleep_schedules: extractNames(sleep_schedules),
        interests: extractNames(interests),
      })
    } catch (err) {
      console.error('Failed to load enum options:', err)
    }
  }, [fetchWithAuth])

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError('')
    try {
      const [userRes, profileRes, prefsRes, photosRes] = await Promise.all([
        fetchWithAuth('/user/me'),
        fetchWithAuth('/profile/me'),
        fetchWithAuth('/user/me/preferences'),
        fetchWithAuth('/profile/me/photos'),
      ])

      if (profileRes.ok) {
        setProfile(await profileRes.json())
      } else if (profileRes.status === 404) {
        setProfile(null)
      } else {
        throw new Error('Failed to load profile')
      }

      if (userRes.ok) setUserInfo(await userRes.json())
      if (prefsRes.ok) setPreferences(await prefsRes.json())
      if (photosRes.ok) setPhotos(await photosRes.json())
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Something went wrong while loading your profile.')
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth, isAuthenticated])

  useEffect(() => {
    loadEnumOptions()
    loadData()
  }, [loadEnumOptions, loadData])

  const primaryPhoto = useMemo(() => {
    if (!photos?.length) return null
    const preferred = photos.find((photo) => photo?.metadata?.is_primary)
    return (preferred || photos[0])?.url || null
  }, [photos])

  const handleSave = useCallback(
    async (formData) => {
      if (!profile && (!formData.gender || !formData.orientation)) {
        setError('Gender and orientation are required.')
        return
      }
      
      setSaving(true)
      setError('')
      try {
        const payload = {
          bio: formData.bio || null,
          drug_use: formData.drug_use || null,
          weed_use: formData.weed_use || null,
          gender: formData.gender || profile?.gender || null,
          orientation: formData.orientation || profile?.orientation || null,
          interests: formData.interests || [],
          location: formData.location || null,
          location_label: formData.location_label || null,
          show_precise_location: formData.show_precise_location,
          pronouns: formData.pronouns || null,
          languages_spoken: formData.languages_spoken || [],
          school: formData.school || null,
          occupation: formData.occupation || null,
          relationship_goal: formData.relationship_goal || null,
          personality_type: formData.personality_type || null,
          love_language: formData.love_language || null,
          attachment_style: formData.attachment_style || null,
          political_view: formData.political_view || null,
          zodiac_sign: formData.zodiac_sign || null,
          religion: formData.religion || null,
          diet: formData.diet || null,
          exercise_frequency: formData.exercise_frequency || null,
          pets: formData.pets || [],
          smoke_frequency: formData.smoke_frequency || null,
          drink_frequency: formData.drink_frequency || null,
          sleep_schedule: formData.sleep_schedule || null,
        }

        const res = await fetchWithAuth('/profile/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody?.detail || errBody?.message || 'Unable to save profile')
        }
        
        await loadData()
        setMode('view')
      } catch (err) {
        console.error(err)
        setError(err?.message || 'Failed to save profile changes.')
      } finally {
        setSaving(false)
      }
    },
    [fetchWithAuth, loadData, profile]
  )

  const handleUploadPhoto = useCallback(
    async (file) => {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetchWithAuth('/profile/me/photos', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.detail || errBody?.message || 'Unable to upload photo')
      }
      await loadData()
    },
    [fetchWithAuth, loadData]
  )

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <LoadingWheel/>
    )
  }

  if (!profile) {
    return (
      <div className="w-full max-w-md rounded-3xl text-center text-white p-8">
        <p className="text-2xl font-title uppercase tracking-[0.35em]">no profile yet</p>
        <p className="mt-4 text-lg">
          Tell people about yourself to unlock the live chat experience.
        </p>
        <button
          onClick={() => setMode('edit')}
          className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-black"
        >
          Create Profile
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-hidden">
      {error && (
        <div className="m-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {mode === 'view' ? (
        <ProfileView
          userInfo={userInfo}
          profile={profile}
          preferences={preferences}
          photoUrl={primaryPhoto}
          onEdit={() => setMode('edit')}
        />
      ) : (
        <ProfileEdit
          profile={profile}
          photoUrl={primaryPhoto}
          saving={saving}
          enumOptions={enumOptions}
          onCancel={() => setMode('view')}
          onSubmit={handleSave}
          onUploadPhoto={handleUploadPhoto}
        />
      )}
    </div>
  )
}