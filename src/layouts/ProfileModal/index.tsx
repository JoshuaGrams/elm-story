import React, { useEffect, useState } from 'react'

import { ProfileDocument } from '../../data/types'
import type { ModalProps } from '../../components/Modal'

import api from '../../api'

import Button from '../../components/Button'
import Input from '../../components/Input'

export enum PROFILE_MODAL_LAYOUT_TYPE {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

interface ProfileModalLayoutProps extends ModalProps {
  profile?: ProfileDocument
  type?: PROFILE_MODAL_LAYOUT_TYPE
  visible?: boolean
}

const SaveProfileLayout: React.FC<ProfileModalLayoutProps> = ({
  profile,
  visible = false,
  onClose
}) => {
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (visible) setTitle(profile ? profile.title : '')
  }, [visible])

  async function saveProfile(event: React.MouseEvent) {
    event.preventDefault()

    if (title) {
      await api().profiles.saveProfile(
        profile ? { ...profile, title } : { title, tags: [], games: [] }
      )

      if (onClose) onClose()
    } else {
      throw new Error('Profile title required.')
    }
  }

  return (
    <>
      <h3>{profile ? 'Edit ' : 'New '} Profile</h3>
      <form>
        <Input
          type="value"
          placeholder="Profile Title"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
          focusOnMount
          selectOnMount
        />
        <Button
          type="submit"
          onClick={(event) => saveProfile(event)}
          disabled={!title}
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
  async function removeProfile() {
    if (profile && profile.id) await api().profiles.removeProfile(profile.id)
    if (onClose) onClose()
  }

  if (!profile)
    throw new Error(
      'Unable to use remove profile layout. Missing profile data.'
    )

  return (
    <>
      <h3>Remove Profile</h3>
      <div>Are you sure you want to remove profile '{profile.title}'?</div>
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
