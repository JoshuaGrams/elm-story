import React, { useState, useEffect } from 'react'

import { ModalProps } from '../../components/Modal'
import { DocumentId, GameDocument, GAME_TEMPLATE } from '../../data/types'

import api from '../../api'

import Button from '../../components/Button'
import Input from '../../components/Input'

export enum GAME_MODAL_LAYOUT_TYPE {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

interface GameModalLayoutProps extends ModalProps {
  profileId: DocumentId
  game?: GameDocument
  type?: GAME_MODAL_LAYOUT_TYPE
  visible?: boolean
}

const SaveGameLayout: React.FC<GameModalLayoutProps> = ({
  profileId,
  game,
  visible = false,
  onCreate,
  onClose
}) => {
  const [title, setTitle] = useState<string | undefined>(undefined),
    [director, setDirector] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (visible) {
      setTitle(game?.title || undefined)
      setDirector(game?.director || undefined)
    }
  }, [visible])

  async function saveGame(event: React.MouseEvent) {
    event.preventDefault()

    if (title && director) {
      try {
        const gameId = await api().games.saveGame(
          profileId,
          game
            ? { ...game, title, director }
            : {
                title,
                director,
                // @TODO: Enable user-defined once more templates are supported.
                template: GAME_TEMPLATE.ADVENTURE,
                tags: [],
                chapters: [],
                // @TODO: Move to defines/types.
                engine: '1.0.0',
                version: '1.0.0'
              }
        )

        if (onCreate) onCreate(gameId)
        if (onClose) onClose()
      } catch (error) {
        throw new Error(error)
      }
    } else {
      throw new Error('Game title required.')
    }
  }

  return (
    <>
      <h3>{game ? 'Edit' : 'New'} Game</h3>
      <form>
        <Input
          type="value"
          placeholder="Game Title"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
          focusOnMount
          selectOnMount
        />
        <Input
          type="value"
          placeholder="Director"
          onChange={(event) => setDirector(event.target.value)}
          value={director}
        />
        <Button
          type="submit"
          onClick={(event) => saveGame(event)}
          disabled={!title || !director}
          primary
        >
          Save
        </Button>
      </form>
    </>
  )
}

const RemoveGameLayout: React.FC<GameModalLayoutProps> = ({
  profileId,
  game,
  onRemove,
  onClose
}) => {
  async function removeGame() {
    if (game && game.id) await api().games.removeGame(profileId, game.id)

    if (onRemove) onRemove()
    if (onClose) onClose()
  }

  if (!game)
    throw new Error('Unable to use RemoveGameLayout. Missing game data.')

  return (
    <>
      <h3>Remove Game</h3>
      <div>Are you sure you want to remove game '{game.title}'?</div>
      <Button onClick={removeGame} destroy>
        Remove
      </Button>
    </>
  )
}

const GameModalLayout: React.FC<GameModalLayoutProps> = ({
  profileId,
  game,
  type,
  open,
  onCreate,
  onRemove,
  onClose
}) => {
  return (
    <>
      {type === GAME_MODAL_LAYOUT_TYPE.CREATE && (
        <SaveGameLayout
          profileId={profileId}
          visible={open}
          onCreate={onCreate}
          onClose={onClose}
        />
      )}
      {type === GAME_MODAL_LAYOUT_TYPE.EDIT && (
        <SaveGameLayout
          profileId={profileId}
          game={game}
          visible={open}
          onClose={onClose}
        />
      )}
      {type === GAME_MODAL_LAYOUT_TYPE.REMOVE && (
        <RemoveGameLayout
          profileId={profileId}
          game={game}
          onRemove={onRemove}
          onClose={onClose}
        />
      )}
      <Button onClick={onClose}>Cancel</Button>
    </>
  )
}

export default GameModalLayout
