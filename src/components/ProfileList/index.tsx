import React, { useState } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

import type { Profile } from '../../db'

import Button from '../Button'
import ProfileModal, { MODAL_TYPE } from '../../components/ProfileModal'

import styles from './styles.module.scss'

type ProfileListProps = {
  className?: string
}

const ProfileList: React.FC<ProfileListProps> = ({
  className = ''
}: ProfileListProps) => {
  const [modalType, setModalType] = useState(MODAL_TYPE.CREATE)
  const [modalProfile, setModalProfile] = useState<Profile>()
  const [modalOpen, setModalOpen] = useState(false)

  const [selected, setSelected] = useSelectedProfile()
  const { profiles } = useProfiles()

  function openModal(modalType: MODAL_TYPE, profile?: Profile) {
    if (profile) setModalProfile(profile)
    setModalType(modalType)
    setModalOpen(true)
  }

  return (
    <div className={`${styles.profileList} ${className}`}>
      <ProfileModal
        profile={modalProfile}
        type={modalType}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <Button onClick={() => openModal(MODAL_TYPE.CREATE)} primary>
        Create Profile
      </Button>

      {profiles.length > 0 && <hr />}

      {/* Profile List */}
      <ul>
        {profiles?.map((profile) => (
          <div key={profile.id} className={styles.profileRow}>
            <Button onClick={() => setSelected(profile.id)}>
              {(selected?.id === profile.id ? 'Selected: ' : '') + profile.name}
            </Button>
            <Button onClick={() => openModal(MODAL_TYPE.EDIT, profile)}>
              Edit
            </Button>
            <Button
              onClick={() => openModal(MODAL_TYPE.REMOVE, profile)}
              destroy
            >
              Remove
            </Button>
          </div>
        ))}
      </ul>
    </div>
  )
}

export default ProfileList
