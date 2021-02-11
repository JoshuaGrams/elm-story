import React, { useState } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

import type { Profile } from '../../db'

import Button from '../Button'

import Modal from '../Modal'
import ProfileModalLayout, {
  PROFILE_MODAL_LAYOUT_TYPE
} from '../../layouts/ProfileModal'

import styles from './styles.module.scss'

type ProfileListProps = {
  className?: string
}

const ProfileList: React.FC<ProfileListProps> = ({
  className = ''
}: ProfileListProps) => {
  const [modalLayoutType, setModalLayoutType] = useState(
    PROFILE_MODAL_LAYOUT_TYPE.CREATE
  )
  const [modalProfile, setModalProfile] = useState<Profile>()
  const [modalOpen, setModalOpen] = useState(false)

  const [selected, setSelected] = useSelectedProfile()
  const { profiles } = useProfiles()

  function openModal(
    modalLayoutType: PROFILE_MODAL_LAYOUT_TYPE,
    profile?: Profile
  ) {
    if (profile) setModalProfile(profile)
    setModalLayoutType(modalLayoutType)
    setModalOpen(true)
  }

  return (
    <div className={`${styles.profileList} ${className}`}>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ProfileModalLayout profile={modalProfile} type={modalLayoutType} />
      </Modal>

      <Button
        onClick={() => openModal(PROFILE_MODAL_LAYOUT_TYPE.CREATE)}
        primary
      >
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
            <Button
              onClick={() => openModal(PROFILE_MODAL_LAYOUT_TYPE.EDIT, profile)}
            >
              Edit
            </Button>
            <Button
              onClick={() =>
                openModal(PROFILE_MODAL_LAYOUT_TYPE.REMOVE, profile)
              }
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
