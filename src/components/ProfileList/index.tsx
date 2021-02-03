import React, { useState } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

export default ({ className = undefined }: { className: string | undefined }) => {
  const [name, setName] = useState('')
  const [selected, setSelected] = useSelectedProfile()
  const { profiles, add, remove } = useProfiles()

  async function create(event: React.MouseEvent) {
    event.preventDefault()
    if (name) {
      await setSelected(await add({ name }))
      setName('')
    } else {
      throw new Error('Profile name required.')
    }
  }

  return (
    <div className={className}>
      <h2>Profiles</h2>
      <div>
        {selected
          ? `Active profile: ${selected.name}`
          : 'Select a profile or create a new profile to start.'}
      </div>
      <form>
        <input
          type="value"
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
        <button
          type="submit"
          onClick={(event) => create(event)}
          disabled={!name}
        >
          Create Profile
        </button>
      </form>
      <ul>
        {profiles?.map((profile) => (
          <li key={profile.id}>
            {profile.name}{' '}
            <button onClick={() => setSelected(profile.id)}>Set Active</button>
            <button onClick={() => remove(profile.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
