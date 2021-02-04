import React, { useState } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

import styles from './styles.scss'

type ProfileListProps = {
  className?: string
}

export default ({ className = undefined }: ProfileListProps) => {
  const [name, setName] = useState('')
  const [selected, setSelected] = useSelectedProfile()
  const { profiles, add, remove } = useProfiles()

  async function addProfile(event: React.MouseEvent) {
    event.preventDefault()
    if (name) {
      await setSelected(await add({ name }))
      setName('')
    } else {
      throw new Error('Profile name required.')
    }
  }

  return (
    <div className={`${styles.profileList} ${className}`}>
      <form>
        <input
          type="value"
          placeholder="Profile Name"
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
        <button
          type="submit"
          onClick={(event) => addProfile(event)}
          disabled={!name}
          className="primary"
        >
          Create Profile
        </button>
      </form>
      {profiles.length > 0 ? <hr /> : null}
      <ul>
        {profiles?.map((profile) => (
          <div key={profile.id} className={styles.profileRow}>
            <button
              onClick={() => setSelected(profile.id)}
              className={
                selected && selected.id === profile.id ? 'primary' : ''
              }
            >
              {profile.name}
            </button>
            <button onClick={() => remove(profile.id)} className="remove">
              Remove Profile
            </button>
          </div>
        ))}
      </ul>
    </div>
  )
}
