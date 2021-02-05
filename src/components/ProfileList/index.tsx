import React, { useState } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

import Button from '../Button'
import styles from './styles.module.scss'

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
        <Button
          type="submit"
          onClick={(event) => addProfile(event)}
          disabled={!name}
          primary
        >
          Create Profile
        </Button>
      </form>
      {profiles.length > 0 ? <hr /> : null}
      <ul>
        {profiles?.map((profile) => (
          <div key={profile.id} className={styles.profileRow}>
            <Button onClick={() => setSelected(profile.id)}>
              {(selected?.id === profile.id ? 'Selected: ' : '') + profile.name}
            </Button>
            <Button onClick={() => remove(profile.id)} destroy>
              Remove Profile
            </Button>
          </div>
        ))}
      </ul>
    </div>
  )
}
