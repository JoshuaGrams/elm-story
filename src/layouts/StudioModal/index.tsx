// @TODO: Combine common modal layouts.
import React, { useEffect, useState } from 'react'

import type { ModalProps } from '../../components/Modal'
import { StudioDocument } from '../../data/types'

import api from '../../api'

import Button from '../../components/Button'
import Input from '../../components/Input'

export enum STUDIO_MODAL_LAYOUT_TYPE {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

interface StudioModalLayoutProps extends ModalProps {
  studio?: StudioDocument
  type?: STUDIO_MODAL_LAYOUT_TYPE
  visible?: boolean
}

const SaveStudioLayout: React.FC<StudioModalLayoutProps> = ({
  studio,
  visible = false,
  onCreate,
  onClose
}) => {
  const [title, setTitle] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (visible) setTitle(studio?.title || undefined)
  }, [visible])

  async function saveStudio(event: React.MouseEvent) {
    event.preventDefault()

    if (title) {
      try {
        const studioId = await api().studios.saveStudio(
          studio ? { ...studio, title } : { title, tags: [], games: [] }
        )

        if (onCreate) onCreate(studioId)
        if (onClose) onClose()
      } catch (error) {
        throw new Error(error)
      }
    } else {
      throw new Error('Studio title required.')
    }
  }

  return (
    <>
      <h3>{studio ? 'Edit ' : 'New '} Studio</h3>
      <form>
        <Input
          type="value"
          placeholder="Studio Title"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
          focusOnMount
          selectOnMount
        />
        <Button
          type="submit"
          onClick={(event) => saveStudio(event)}
          disabled={!title}
          primary
        >
          Save
        </Button>
      </form>
    </>
  )
}

const RemoveStudioLayout: React.FC<StudioModalLayoutProps> = ({
  studio,
  onRemove,
  onClose
}) => {
  async function removeStudio() {
    if (studio && studio.id) await api().studios.removeStudio(studio.id)

    if (onRemove) onRemove()
    if (onClose) onClose()
  }

  if (!studio)
    throw new Error('Unable to use RemoveStudioLayout. Missing studio data.')

  return (
    <>
      <h3>Remove Studio</h3>
      <div>Are you sure you want to remove studio '{studio.title}'?</div>
      <div>All games under this studio will be removed forever.</div>
      <Button onClick={removeStudio} destroy>
        Remove
      </Button>
    </>
  )
}

const StudioModalLayout: React.FC<StudioModalLayoutProps> = ({
  studio,
  type,
  open,
  onCreate,
  onRemove,
  onClose // @BUG: not used properly; see AppModal
}) => {
  return (
    <>
      {type === STUDIO_MODAL_LAYOUT_TYPE.CREATE && (
        <SaveStudioLayout
          visible={open}
          onCreate={onCreate}
          onClose={onClose}
        />
      )}
      {type === STUDIO_MODAL_LAYOUT_TYPE.EDIT && (
        <SaveStudioLayout studio={studio} visible={open} onClose={onClose} />
      )}
      {type === STUDIO_MODAL_LAYOUT_TYPE.REMOVE && (
        <RemoveStudioLayout
          studio={studio}
          onRemove={onRemove}
          onClose={onClose}
        />
      )}
      <Button onClick={onClose}>Cancel</Button>
    </>
  )
}

export default StudioModalLayout
