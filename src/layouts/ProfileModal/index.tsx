import type { Profile } from '../../db'
import type { ModalProps } from '../../components/Modal'

import React, { useEffect, useState } from 'react'

import { useProfiles, useSelectedProfile } from '../../hooks'

import Button from '../../components/Button'
import Input from '../../components/Input'

export enum PROFILE_MODAL_LAYOUT_TYPE {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

interface ProfileModalLayoutProps extends ModalProps {
  profile?: Profile
  type?: PROFILE_MODAL_LAYOUT_TYPE
  visible?: boolean
}

const SaveProfileLayout: React.FC<ProfileModalLayoutProps> = ({
  profile,
  visible = false,
  onClose
}) => {
  const [name, setName] = useState('')
  const [, setSelected] = useSelectedProfile()
  const { save } = useProfiles()

  useEffect(() => {
    if (visible) setName(profile ? profile.name : '')
  }, [visible])

  async function saveProfile(event: React.MouseEvent) {
    event.preventDefault()

    if (name) {
      if (profile) {
        await save({ name, exists: true, id: profile.id })
      } else {
        await setSelected(await save({ name }))
      }

      if (onClose) onClose()
    } else {
      throw new Error('Profile name required.')
    }
  }

  return (
    <>
      <h3>{profile ? 'Edit ' : 'New '} Profile</h3>
      <form>
        <Input
          type="value"
          placeholder="Profile Name"
          onChange={(event) => setName(event.target.value)}
          value={name}
          focusOnMount
          selectOnMount
        />
        <Button
          type="submit"
          onClick={(event) => saveProfile(event)}
          disabled={!name}
          primary
        >
          Save
        </Button>
      </form>
    </>
  )
}

const RemoveProfileLayout: React.FC<ProfileModalLayoutProps> = ({
  profile,
  onClose
}) => {
  const { remove } = useProfiles()

  async function removeProfile() {
    if (profile) await remove(profile.id)
    if (onClose) onClose()
  }

  if (!profile)
    throw new Error(
      'Unable to use remove profile layout. Missing profile data.'
    )

  return (
    <>
      <h3>Remove Profile</h3>
      <div>Are you sure you want to remove profile '{profile.name}'?</div>
      <div>All games under this profile will be removed forever.</div>
      <Button onClick={removeProfile} destroy>
        Remove
      </Button>
    </>
  )
}

const ProfileModalLayout: React.FC<ProfileModalLayoutProps> = ({
  profile,
  type,
  open,
  onClose
}) => {
  return (
    <>
      {type === PROFILE_MODAL_LAYOUT_TYPE.CREATE && (
        <SaveProfileLayout visible={open} onClose={onClose} />
      )}
      {type === PROFILE_MODAL_LAYOUT_TYPE.EDIT && (
        <SaveProfileLayout profile={profile} visible={open} onClose={onClose} />
      )}
      {type === PROFILE_MODAL_LAYOUT_TYPE.REMOVE && (
        <RemoveProfileLayout profile={profile} onClose={onClose} />
      )}
      <Button onClick={onClose}>Cancel</Button>
    </>
  )
}

export default ProfileModalLayout
