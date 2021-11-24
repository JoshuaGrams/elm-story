import React, { useState, useEffect, useContext } from 'react'

import {
  Character,
  COMPONENT_TYPE,
  GameId,
  Passage,
  Scene,
  StudioId
} from '../../data/types'

import { useCharacterEvents, useScene } from '../../hooks'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { Table } from 'antd'
import { PartitionOutlined } from '@ant-design/icons'

import styles from './styles.module.less'
import CharacterMask from './CharacterMask'

const SceneRow: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { editorDispatch } = useContext(EditorContext)

  return (
    <div className={styles.SceneRow}>
      <PartitionOutlined className={styles.icon} />
      <h1
        onClick={() => {
          editorDispatch({ type: EDITOR_ACTION_TYPE.CLOSE_CHARACTER_MODAL })

          scene?.id &&
            editorDispatch({
              type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
              selectedGameOutlineComponent: {
                expanded: true,
                id: scene.id,
                title: scene.title,
                type: COMPONENT_TYPE.SCENE
              }
            })
        }}
      >
        {scene.title}
      </h1>
    </div>
  )
}

SceneRow.displayName = 'SceneRow'

const EventRow: React.FC<{
  studioId: StudioId
  character: Character
  event: Passage
}> = ({ studioId, character, event }) => {
  const { editorDispatch } = useContext(EditorContext)

  const ref = character.refs.find((ref) => ref[0] === event.persona?.[2])?.[1]

  const openScene = () => {
    editorDispatch({
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
      selectedGameOutlineComponent: {
        expanded: true,
        id: event.sceneId,
        title: event.title,
        type: COMPONENT_TYPE.SCENE
      }
    })
  }

  const openEvent = () => {
    editorDispatch({ type: EDITOR_ACTION_TYPE.CLOSE_CHARACTER_MODAL })

    openScene()

    // stack hack
    setTimeout(
      () =>
        event.id &&
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
          selectedComponentEditorSceneViewPassage: event.id
        }),
      1
    )
  }

  return (
    <div className={styles.EventRow}>
      <Table
        dataSource={[
          {
            key: event.id,
            title: event.title,
            ref,
            mask: event.persona?.[1]
          }
        ]}
        columns={[
          {
            title: 'Event',
            dataIndex: 'title',
            key: 'title',
            render: (title) => (
              <span className={styles.link} onClick={openEvent}>
                {title}
              </span>
            )
          },
          {
            title: 'Reference',
            dataIndex: 'ref',
            key: 'ref',
            className: styles.reference,
            render: (ref) => <>{ref || <span>&mdash;</span>}</>
          },
          {
            title: 'Mask',
            dataIndex: 'mask',
            key: 'mask',
            className: styles.mask,
            render: (mask) => (
              <div>
                {character.id && (
                  <CharacterMask
                    studioId={studioId}
                    gameId={character.gameId}
                    type={mask}
                    characterId={character.id}
                    width="76px"
                    aspectRatio="1/1"
                    assetId={
                      character.masks.find((_mask) => _mask.type === mask)
                        ?.assetId
                    }
                    active
                    fill
                  />
                )}

                <span>{mask}</span>
              </div>
            )
          }
        ]}
        pagination={false}
      />
    </div>
  )
}

EventRow.displayName = 'EventRow'

const SceneGroup: React.FC<{
  studioId: StudioId
  group: [string, JSX.Element[]]
}> = ({ studioId, group }) => {
  const scene = useScene(studioId, group[0], [group[0]])

  return (
    <>
      {scene && (
        <div className={styles.group}>
          <SceneRow scene={scene} />
          {group[1]
            .sort(
              (a, b) =>
                scene?.children.findIndex((child) => child[1] === a.key) -
                scene?.children.findIndex((child) => child[1] === b.key)
            )
            .map((event) => event)}
        </div>
      )}
    </>
  )
}

SceneGroup.displayName = 'SceneGroup'

const CharacterEvents: React.FC<{
  studioId: StudioId
  gameId: GameId
  character: Character
}> = ({ studioId, character }) => {
  const events = useCharacterEvents(studioId, character.id, [character.id])

  const [eventsByScene, setEventsByScene] = useState<
    [string, JSX.Element[]][] | undefined
  >(undefined)

  // groups events by scene
  useEffect(() => {
    if (events) {
      const newEventsByScene: [string, JSX.Element[]][] = []

      events?.map((event) => {
        const foundScene = newEventsByScene.find(
          (scene) => scene[0] === event.sceneId
        )

        if (foundScene) {
          foundScene[1].push(
            <EventRow
              studioId={studioId}
              character={character}
              event={event}
              key={event.id}
            />
          )
        }

        if (!foundScene) {
          newEventsByScene.push([event.sceneId, []])

          newEventsByScene[newEventsByScene.length - 1][1].push(
            <EventRow
              studioId={studioId}
              character={character}
              event={event}
              key={event.id}
            />
          )
        }
      })

      setEventsByScene(newEventsByScene)
    }
  }, [events])

  return (
    <div className={styles.CharacterEvents}>
      {eventsByScene && (
        <>
          {eventsByScene.length === 0 && 'No events found.'}

          {eventsByScene.map((group) => (
            <SceneGroup studioId={studioId} group={group} key={group[0]} />
          ))}
        </>
      )}
    </div>
  )
}

CharacterEvents.displayName = 'CharacterEvents'

export default CharacterEvents
