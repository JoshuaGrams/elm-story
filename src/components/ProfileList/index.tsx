import React, { useState } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

import Button from '../Button'
import ProfileModal from '../../components/ProfileModal'

import styles from './styles.module.scss'
import type { Profile } from '../../db'

export enum MODAL_TYPE {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

type ModalType = MODAL_TYPE

type ProfileListProps = {
  className?: string
}

const ProfileList: React.FC<ProfileListProps> = ({
  className = ''
}: ProfileListProps) => {
  const [modalType, setModalType] = useState<ModalType>(MODAL_TYPE.CREATE)
  const [modalProfile, setModalProfile] = useState<Profile>()
  const [modalOpen, setModalOpen] = useState(false)

  const [selected, setSelected] = useSelectedProfile()
  const { profiles } = useProfiles()

  function showModal(modalType: ModalType, profile?: Profile) {
    if (profile) setModalProfile(profile)
    setModalType(modalType)
    setModalOpen(true)
  }

  return (
    <div className={`${styles.profileList} ${className}`}>
      <ProfileModal
        profile={modalProfile}
        open={modalOpen}
        create={modalType === MODAL_TYPE.CREATE}
        edit={modalType === MODAL_TYPE.EDIT}
        remove={modalType === MODAL_TYPE.REMOVE}
        onClose={() => setModalOpen(false)}
      />

      <Button onClick={() => showModal(MODAL_TYPE.CREATE)} primary>
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
            <Button onClick={() => showModal(MODAL_TYPE.EDIT, profile)}>
              Edit
            </Button>
            <Button
              onClick={() => showModal(MODAL_TYPE.REMOVE, profile)}
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
