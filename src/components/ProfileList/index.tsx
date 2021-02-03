import React, { useState } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

export default () => {
  const [profileName, setProfileName] = useState('')
  const { selectedProfile, setSelectedProfile } = useSelectedProfile()
  const { profiles, createProfile, deleteProfile } = useProfiles()

  async function create(event: React.MouseEvent) {
    event.preventDefault()
    if (profileName) {
      await setSelectedProfile(await createProfile(profileName))
      setProfileName('')
    } else {
      throw new Error('Profile name required.')
    }
  }

  return (
    <div>
      <h2>Profiles</h2>
      <div>
        {selectedProfile
          ? `Active profile: ${selectedProfile.name}`
          : 'Select a profile or create a new profile to start.'}
      </div>
      <form>
        <input
          type="value"
          onChange={(event) => setProfileName(event.target.value)}
          value={profileName}
        />
        <button
          type="submit"
          onClick={(event) => create(event)}
          disabled={!profileName}
        >
          Create Profile
        </button>
      </form>
      <ul>
        {profiles?.map((profile) => (
          <li key={profile.id}>
            {profile.name}{' '}
            <button onClick={() => setSelectedProfile(profile.id)}>
              Set Active
            </button>
            <button onClick={() => deleteProfile(profile.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
