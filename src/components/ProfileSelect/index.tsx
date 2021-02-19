import React, { useContext } from 'react'

import { useProfiles } from '../../hooks'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'
import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import Button from '../Button'

import ProfileModalLayout, {
  PROFILE_MODAL_LAYOUT_TYPE
} from '../../layouts/ProfileModal'

import styles from './styles.module.scss'

type ProfileSelectProps = {
  className?: string
}

const ProfileSelect: React.FC<ProfileSelectProps> = ({
  className = ''
}: ProfileSelectProps) => {
  const profiles = useProfiles()
  const { app, appDispatch } = useContext(AppContext)
  const { modalDispatch } = useContext(ModalContext)

  return (
    <div className={`${styles.profileList} ${className}`}>
      {/* Create profile button */}
      <Button
        onClick={() => {
          modalDispatch({
            type: MODAL_ACTION_TYPE.LAYOUT,
            layout: (
              <ProfileModalLayout
                type={PROFILE_MODAL_LAYOUT_TYPE.CREATE}
                onCreate={(profileId) =>
                  appDispatch({
                    type: APP_ACTION_TYPE.PROFILE_SELECT,
                    selectedProfileId: profileId
                  })
                }
              />
            )
          })

          modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
        }}
        primary
      >
        Create Profile
      </Button>

      {profiles.length > 0 && (
        <>
          <hr />

          <select
            onChange={(event) => {
              appDispatch({
                type: APP_ACTION_TYPE.PROFILE_SELECT,
                selectedProfileId:
                  event.target.value === 'undefined'
                    ? undefined
                    : event.target.value
              })
            }}
            value={app.selectedProfileId || 'undefined'}
          >
            <option value="undefined">--- Select Profile ---</option>
            {profiles.map((profile) => (
              <option value={profile.id} key={profile.id}>
                {profile.title} | {profile.games.length} Games
              </option>
            ))}
          </select>

          {app.selectedProfileId && (
            <>
              <hr />

              {/* Edit profile button */}
              <Button
                onClick={() => {
                  modalDispatch({
                    type: MODAL_ACTION_TYPE.LAYOUT,
                    layout: (
                      <ProfileModalLayout
                        type={PROFILE_MODAL_LAYOUT_TYPE.EDIT}
                        profile={
                          profiles.filter(
                            (profile) => profile.id === app.selectedProfileId
                          )[0]
                        }
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
                        profile={
                          profiles.filter(
                            (profile) => profile.id === app.selectedProfileId
                          )[0]
                        }
                        onRemove={() =>
                          appDispatch({
                            type: APP_ACTION_TYPE.PROFILE_SELECT,
                            selectedProfileId: undefined
                          })
                        }
                      />
                    )
                  })

                  modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
                }}
                destroy
              >
                Remove
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ProfileSelect
