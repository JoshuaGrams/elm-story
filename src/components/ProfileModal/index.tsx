import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useProfiles, useSelectedProfile } from '../../hooks'

import type { Profile } from '../../db'
import type { ModalProps } from '../Modal'

import Modal from '../Modal'
import Button from '../Button'

export enum MODAL_TYPE {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

interface ProfileModalProps extends ModalProps {
  profile?: Profile
  type?: MODAL_TYPE
}

interface SaveProfileLayoutProps extends ProfileModalProps {
  existing: boolean
}

const SaveProfileLayout: React.FC<SaveProfileLayoutProps> = ({
  profile,
  open,
  onClose,
  existing = false
}) => {
  const [name, setName] = useState('')
  const [, setSelected] = useSelectedProfile()
  const { save } = useProfiles()
  const nameInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(existing && profile ? profile.name : '')

      setTimeout(() => {
        if (nameInput && nameInput.current) {
          nameInput.current.focus()
          nameInput.current.select()
        }
      }, 1)
    }
  }, [open])

  async function saveProfile(event: React.MouseEvent) {
    event.preventDefault()
    if (name) {
      if (existing && profile) {
        await save({ name, existing, id: profile.id })
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
      <h3>{existing && profile ? 'Edit ' : 'New '} Profile</h3>
      <form>
        <input
          type="value"
          placeholder="Profile Name"
          onChange={(event) => setName(event.target.value)}
          value={name}
          ref={nameInput}
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

const RemoveProfileLayout: React.FC<ProfileModalProps> = ({
  profile,
  onClose
}) => {
  const { remove } = useProfiles()

  async function removeProfile() {
    if (profile) remove(profile.id)
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

/**
 * ProfileModal instance will unmount when
 * open prop is false.
 */
const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  type = MODAL_TYPE.CREATE,
  open = false,
  onClose
}) => (
  <Modal open={open}>
    {type === MODAL_TYPE.CREATE && (
      <SaveProfileLayout open={open} onClose={onClose} existing={false} />
    )}
    {type === MODAL_TYPE.EDIT && (
      <SaveProfileLayout
        open={open}
        profile={profile}
        onClose={onClose}
        existing
      />
    )}
    {type === MODAL_TYPE.REMOVE && (
      <RemoveProfileLayout profile={profile} onClose={onClose} />
    )}
    <Button onClick={onClose}>Cancel</Button>
  </Modal>
)

export default ProfileModal
