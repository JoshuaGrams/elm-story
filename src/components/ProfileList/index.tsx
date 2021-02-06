import React, { useState } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

import Button from '../Button'
import ProfileModal from '../../components/ProfileModal'

import styles from './styles.module.scss'
import type { Profile } from '../../db'

type ModalType = 'create' | 'edit' | 'remove'

type ProfileListProps = {
  className?: string
}

export default ({ className = undefined }: ProfileListProps) => {
  const [modalType, setModalType] = useState<ModalType>('create')
  const [modalProfile, setModalProfile] = useState<Profile>()
  const [modalShow, setModalShow] = useState(false)

  const [selected, setSelected] = useSelectedProfile()
  const { profiles } = useProfiles()

  function showModal(modalType: ModalType, profile?: Profile) {
    if (profile) setModalProfile(profile)
    setModalType(modalType)
    setModalShow(true)
  }

  return (
    <div className={`${styles.profileList} ${className}`}>
      <ProfileModal
        profile={modalProfile}
        show={modalShow}
        create={modalType === 'create'}
        edit={modalType === 'edit'}
        remove={modalType === 'remove'}
        onHide={() => setModalShow(false)}
      />

      <Button onClick={() => showModal('create')} primary>
        Create Profile
      </Button>

      {profiles.length > 0 ? <hr /> : null}

      {/* Profile List */}
      <ul>
        {profiles?.map((profile) => (
          <div key={profile.id} className={styles.profileRow}>
            <Button onClick={() => setSelected(profile.id)}>
              {(selected?.id === profile.id ? 'Selected: ' : '') + profile.name}
            </Button>
            <Button onClick={() => showModal('edit', profile)}>Edit</Button>
            <Button onClick={() => showModal('remove', profile)} destroy>
              Remove
            </Button>
          </div>
        ))}
      </ul>
    </div>
  )
}
