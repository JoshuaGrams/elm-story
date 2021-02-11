import React, { useContext } from 'react'

import { useProfiles, useSelectedProfile } from '../../hooks'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import Button from '../Button'

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
  const [selected, setSelected] = useSelectedProfile()
  const { profiles } = useProfiles()

  const { modalDispatch } = useContext(ModalContext)

  return (
    <div className={`${styles.profileList} ${className}`}>
      {/* Create profile button */}
      <Button
        onClick={() => {
          modalDispatch({
            type: MODAL_ACTION_TYPE.LAYOUT,
            layout: (
              <ProfileModalLayout type={PROFILE_MODAL_LAYOUT_TYPE.CREATE} />
            )
          })

          modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
        }}
        primary
      >
        Create Profile
      </Button>

      {profiles.length > 0 && <hr />}

      {/* Profile List */}
      <ul>
        {profiles?.map((profile) => (
          <div key={profile.id} className={styles.profileRow}>
            {/* Select profile button */}
            <Button onClick={() => setSelected(profile.id)}>
              {(selected?.id === profile.id ? 'Selected: ' : '') + profile.name}
            </Button>

            {/* Edit profile button */}
            <Button
              onClick={() => {
                modalDispatch({
                  type: MODAL_ACTION_TYPE.LAYOUT,
                  layout: (
                    <ProfileModalLayout
                      type={PROFILE_MODAL_LAYOUT_TYPE.EDIT}
                      profile={profile}
                    />
                  )
                })

                modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
              }}
            >
              Edit
            </Button>

            {/* Remove profile button */}
            <Button
              onClick={() => {
                modalDispatch({
                  type: MODAL_ACTION_TYPE.LAYOUT,
                  layout: (
                    <ProfileModalLayout
                      type={PROFILE_MODAL_LAYOUT_TYPE.REMOVE}
                      profile={profile}
                    />
                  )
                })

                modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
              }}
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
