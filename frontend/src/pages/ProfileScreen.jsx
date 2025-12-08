import { useAuth } from '@contexts/AuthContext'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
    return value.length ? value.join(', ') : 'add info'
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

const StatBadge = ({ icon, label }) => (
  <div className="flex items-center gap-1 text-xs uppercase tracking-[0.35em] text-[#C7C4A7]">
    {/* <span className="text-primary text-xl">{icon}</span> */}
    <span className="tracking-[0.25em]">{label}</span>
  </div>
)

const SectionCard = ({ title, children }) => (
  <div className="space-y-2 rounded-3xl bg-[#272323] p-4 ">
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
  interests,
  photoUrl,
  onEdit,
}) {
  const languages = Array.isArray(profile?.languages_spoken)
    ? profile.languages_spoken
    : []
  const age = calculateAge(userInfo?.birthdate)

  const matchPrefs = preferences || {}
  const extra = matchPrefs.extra_options || {}
  console.log(preferences)

  return (
    <div className="w-full h-full space-y-6 text-white overflow-y-auto p-4">
      <header className="flex items-center justify-between text-lg uppercase tracking-[0.2em] text-primary">
        <span className="text-white">your profile</span>
      </header>

      <div className="flex justify-center">
        <div className="overflow-hidden rounded-[24px] w-fit h-fit bg-cover">
          <img
            src={photoUrl || DEFAULT_PHOTO}
            alt="primary profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <StatBadge icon="♀" label={formatValue(profile?.gender)} />
        {age !== null && <StatBadge icon="🎂" label={`${age}`} />}
        {/* <StatBadge
          icon="📍"
          label={formatValue(profile?.location_label || profile?.location)}
        />
        <StatBadge
          icon="👁"
          label={profile?.show_precise_location ? 'Yes' : 'No'}
        /> */}
      </div>

      <SectionCard title="about me">
        {profile?.bio
          ? profile.bio
          : 'Share something memorable about yourself.'}
      </SectionCard>

      <div className="relative">
        <SectionCard title="relationship goal">
          {profile?.relationship_goal
            ? formatValue(profile.relationship_goal)
            : 'Let people know what you are looking for.'}
        </SectionCard>
        <FloatingButton icon="✎" label="Edit profile" onClick={onEdit} />
      </div>

      <SectionCard title="details">
        <dl className="space-y-2 text-base">
          <div className="flex justify-between">
            <dt className="text-[#C7C4A7]">Orientation</dt>
            <dd>{formatValue(profile?.orientation)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#C7C4A7]">Pronouns</dt>
            <dd>{formatValue(profile?.pronouns)}</dd>
          </div>
          {languages?.length > 0 && (
            <div className="flex justify-between">
            <dt className="text-[#C7C4A7]">Languages</dt>
            <dd className="text-right">
              {languages.join(', ')}
            </dd>
          </div>
          )}
        </dl>
      </SectionCard>

      {preferences && (
        <SectionCard title="match preferences">
          <dl className="space-y-2 text-base">
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Looking for</dt>
              <dd>{formatValue(matchPrefs.target_gender)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Age range</dt>
              <dd>
                {matchPrefs.age_min}–{matchPrefs.age_max}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#C7C4A7]">Max distance</dt>
              <dd>{matchPrefs.max_distance} miles</dd>
            </div>
          </dl>
        </SectionCard>
      )}

      {interests.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-[#C7C4A7]">
            interests
          </p>
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
    </div>
  )
}


function ProfileEdit({
  profile,
  photoUrl,
  saving,
  onCancel,
  onSubmit,
  onUploadPhoto,
}) {
  const [formState, setFormState] = useState({
    bio: profile?.bio || '',
    location_label: profile?.location_label || '',
    location: profile?.location || '',
    pronouns: profile?.pronouns || '',
    relationship_goal: profile?.relationship_goal || '',
    languages_spoken: Array.isArray(profile?.languages_spoken)
      ? profile.languages_spoken.join(', ')
      : '',
    show_precise_location: Boolean(profile?.show_precise_location),
  })

  useEffect(() => {
    setFormState({
      bio: profile?.bio || '',
      location_label: profile?.location_label || '',
      location: profile?.location || '',
      pronouns: profile?.pronouns || '',
      relationship_goal: profile?.relationship_goal || '',
      languages_spoken: Array.isArray(profile?.languages_spoken)
        ? profile.languages_spoken.join(', ')
        : '',
      show_precise_location: Boolean(profile?.show_precise_location),
    })
  }, [profile])

  const updateField = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
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
    const languages = formState.languages_spoken
      ? formState.languages_spoken.split(',').map((lang) => lang.trim()).filter(Boolean)
      : []
    onSubmit({
      bio: formState.bio,
      location_label: formState.location_label,
      location: formState.location,
      pronouns: formState.pronouns,
      relationship_goal: formState.relationship_goal,
      languages_spoken: languages,
      show_precise_location: formState.show_precise_location,
    })
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full h-full overflow-y-auto max-w-md space-y-6 text-white "
    >
      <header className="flex items-center justify-between text-lg uppercase tracking-[0.2em] text-primary">
        <span className="text-white">edit profile</span>
      </header>

      <div className="rounded-[36px]">
        <img
          src={photoUrl || DEFAULT_PHOTO}
          alt="primary profile"
          className="aspect-[10/12] w-full bg-cover"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <button
          type="button"
          onClick={handlePhotoButtonClick}
          className="rounded-2xl border border-primary px-4 py-2 text-sm uppercase tracking-[0.3em] text-primary hover:bg-primary/10 disabled:opacity-50"
          disabled={uploadingPhoto}
        >
          <span className='text-neutral-200'>{uploadingPhoto ? 'Uploading…' : 'Upload new photo'}</span>
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

      <div className="flex flex-col space-y-4">
        <label className="space-y-2 text-sm uppercase tracking-[0.3em] text-[#C7C4A7]">
          location label
          <input
            type="text"
            className="w-full rounded-2xl bg-[#272323] px-4 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-primary"
            value={formState.location_label}
            onChange={(e) => updateField('location_label', e.target.value)}
          />
        </label>

        <label className="space-y-2 text-sm uppercase tracking-[0.3em] text-[#C7C4A7]">
          actual location
          <input
            type="text"
            className="w-full rounded-2xl bg-[#272323] px-4 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-primary"
            value={formState.location}
            onChange={(e) => updateField('location', e.target.value)}
          />
        </label>

        <label className="space-y-2 text-sm uppercase tracking-[0.3em] text-[#C7C4A7]">
          pronouns
          <input
            type="text"
            className="w-full rounded-2xl bg-[#272323] px-4 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-primary"
            value={formState.pronouns}
            onChange={(e) => updateField('pronouns', e.target.value)}
          />
        </label>

        <label className="space-y-2 text-sm uppercase tracking-[0.3em] text-[#C7C4A7]">
          languages spoken
          <input
            type="text"
            className="w-full rounded-2xl bg-[#272323] px-4 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-primary"
            value={formState.languages_spoken}
            onChange={(e) => updateField('languages_spoken', e.target.value)}
            placeholder="english, spanish"
          />
        </label>

        <label className="space-y-2 text-sm uppercase tracking-[0.3em] text-[#C7C4A7]">
          relationship goal
          <input
            type="text"
            className="w-full rounded-2xl bg-[#272323] px-4 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-primary"
            value={formState.relationship_goal}
            onChange={(e) => updateField('relationship_goal', e.target.value)}
          />
        </label>

        <label className="space-y-2 text-sm uppercase tracking-[0.3em] text-[#C7C4A7]">
          about me
          <textarea
            className="w-full rounded-2xl bg-[#272323] px-4 py-3 text-lg text-white outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            value={formState.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Share a quick story or fun fact"
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl bg-[#272323] px-4 py-3 text-sm uppercase tracking-[0.3em] text-[#C7C4A7]">
          show precise location
          <input
            type="checkbox"
            className="h-5 w-5 accent-primary"
            checked={formState.show_precise_location}
            onChange={(e) => updateField('show_precise_location', e.target.checked)}
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-full bg-[#2f2b2b] px-6 py-3 uppercase tracking-[0.3em] text-white hover:opacity-80"
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
  const [mode, setMode] = useState('view')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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
      setError(
        err?.message || 'Something went wrong while loading your profile.'
      )
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth, isAuthenticated])

  useEffect(() => {
    loadData()
  }, [loadData])

  const primaryPhoto = useMemo(() => {
    if (!photos?.length) return null
    const preferred = photos.find((photo) => photo?.metadata?.is_primary)
    return (preferred || photos[0])?.url || null
  }, [photos])

  const interestNames = useMemo(
    () =>
      preferences?.extra_options?.interests &&
      Array.isArray(preferences.extra_options.interests)
        ? preferences.extra_options.interests
        : [],
    [preferences]
  )

  const handleSave = useCallback(
    async (partialData) => {
      if (!profile) return
      setSaving(true)
      setError('')
      try {
        const payload = {
          bio: partialData.bio ?? profile.bio ?? '',
          drug_use: profile.drug_use ?? false,
          weed_use: profile.weed_use ?? false,
          gender: profile.gender,
          orientation: profile.orientation,
          interests: interestNames,
          location: partialData.location ?? profile.location ?? '',
          location_label:
            partialData.location_label ?? profile.location_label ?? '',
          show_precise_location:
            typeof partialData.show_precise_location === 'boolean'
              ? partialData.show_precise_location
              : Boolean(profile.show_precise_location),
          pronouns: partialData.pronouns ?? profile.pronouns,
          languages_spoken:
            partialData.languages_spoken ?? profile.languages_spoken ?? [],
          school: profile.school,
          occupation: profile.occupation,
          relationship_goal:
            partialData.relationship_goal ?? profile.relationship_goal,
          personality_type: profile.personality_type,
          love_language: profile.love_language,
          attachment_style: profile.attachment_style,
          political_view: profile.political_view,
          zodiac_sign: profile.zodiac_sign,
          religion: profile.religion,
          diet: profile.diet,
          exercise_frequency: profile.exercise_frequency,
          pets: profile.pets,
          smoke_frequency: profile.smoke_frequency,
          drink_frequency: profile.drink_frequency,
          sleep_schedule: profile.sleep_schedule,
        }

        if (!payload.gender || !payload.orientation) {
          throw new Error(
            'Gender and orientation must be set before updating your profile.'
          )
        }

        const res = await fetchWithAuth('/profile/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(
            errBody?.detail || errBody?.message || 'Unable to save profile'
          )
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
    [fetchWithAuth, interestNames, loadData, profile]
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
        throw new Error(
          errBody?.detail || errBody?.message || 'Unable to upload photo'
        )
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
      <div className="text-center text-white py-10">
        <p>Loading your profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="w-full max-w-md rounded-3xl text-center text-white">
        <p className="text-2xl font-title uppercase tracking-[0.35em]">
          no profile yet
        </p>
        <p className="mt-4 text-lg">
          Tell people about yourself to unlock the live chat experience.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-hidden">
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {mode === 'view' ? (
        <ProfileView
          userInfo={userInfo}
          profile={profile}
          preferences={preferences}
          interests={interestNames}
          photoUrl={primaryPhoto}
          onEdit={() => setMode('edit')}
        />
      ) : (
        <ProfileEdit
          profile={profile}
          photoUrl={primaryPhoto}
          saving={saving}
          onCancel={() => setMode('view')}
          onSubmit={handleSave}
          onUploadPhoto={handleUploadPhoto}
        />
      )}
    </div>
  )
}
