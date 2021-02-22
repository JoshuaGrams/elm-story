import React from 'react'

import { ModalProps } from '../../components/Modal'
import { DocumentId, GameDocument, GAME_TEMPLATE } from '../../data/types'

import { Form, Button, Input, Divider } from 'antd'

import api from '../../api'

export enum GAME_MODAL_LAYOUT_TYPE {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

interface GameModalLayoutProps extends ModalProps {
  studioId: DocumentId
  game?: GameDocument
  type?: GAME_MODAL_LAYOUT_TYPE
}

const SaveGameLayout: React.FC<GameModalLayoutProps> = ({
  studioId,
  game,
  onCreate,
  onClose
}) => {
  return (
    <>
      <h3>{game ? 'Edit' : 'New'} Game</h3>

      <Divider />

      <Form
        initialValues={{
          title: game?.title || '',
          director: game?.director || ''
        }}
        onFinish={async ({
          title,
          director
        }: {
          title: string
          director: string
        }) => {
          try {
            const gameId = await api().games.saveGame(
              studioId,
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
        }}
      >
        <Form.Item
          label="Game Title"
          name="title"
          rules={[{ required: true, message: 'Game title is required.' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Director"
          name="director"
          rules={[{ required: true, message: 'Director is required.' }]}
        >
          <Input />
        </Form.Item>

        <Divider />

        <Button onClick={onClose}>Cancel</Button>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            Save
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

const RemoveGameLayout: React.FC<GameModalLayoutProps> = ({
  studioId,
  game,
  onRemove,
  onClose
}) => {
  if (!game)
    throw new Error('Unable to use RemoveGameLayout. Missing game data.')

  return (
    <>
      <h3>Remove Game</h3>

      <Divider />

      <div>Are you sure you want to remove game '{game.title}'?</div>

      <Divider />

      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={async () => {
          if (game && game.id) await api().games.removeGame(studioId, game.id)

          if (onRemove) onRemove()
          if (onClose) onClose()
        }}
        type="primary"
        danger
      >
        Remove
      </Button>
    </>
  )
}

const GameModalLayout: React.FC<GameModalLayoutProps> = ({
  studioId,
  game,
  type,
  onCreate,
  onRemove,
  onClose
}) => {
  return (
    <>
      {type === GAME_MODAL_LAYOUT_TYPE.CREATE && (
        <SaveGameLayout
          studioId={studioId}
          onCreate={onCreate}
          onClose={onClose}
        />
      )}
      {type === GAME_MODAL_LAYOUT_TYPE.EDIT && (
        <SaveGameLayout studioId={studioId} game={game} onClose={onClose} />
      )}
      {type === GAME_MODAL_LAYOUT_TYPE.REMOVE && (
        <RemoveGameLayout
          studioId={studioId}
          game={game}
          onRemove={onRemove}
          onClose={onClose}
        />
      )}
    </>
  )
}

export default GameModalLayout
