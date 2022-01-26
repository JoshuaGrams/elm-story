import React, { useState, useEffect, useContext } from 'react'

import {
  Character,
  ELEMENT_TYPE,
  WorldId,
  Event,
  Scene,
  StudioId,
  CHARACTER_MASK_TYPE
} from '../../data/types'

import { useCharacterEvents, useScene } from '../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../contexts/ComposerContext'

import { Table } from 'antd'
import { PartitionOutlined } from '@ant-design/icons'

import styles from './styles.module.less'
import CharacterMask from './CharacterMask'
import {
  formatCharacterRefDisplay,
  getCharacterDetailsFromEventContent
} from '../../lib/contentEditor'

const SceneRow: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { composerDispatch } = useContext(ComposerContext)

  return (
    <div className={styles.SceneRow}>
      <PartitionOutlined className={styles.icon} />
      <h1
        onClick={() => {
          composerDispatch({ type: COMPOSER_ACTION_TYPE.CLOSE_CHARACTER_MODAL })

          scene?.id &&
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
              selectedWorldOutlineElement: {
                expanded: true,
                id: scene.id,
                title: scene.title,
                type: ELEMENT_TYPE.SCENE
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
  event: Event
}> = ({ studioId, character, event }) => {
  const { composerDispatch } = useContext(ComposerContext)

  const singleRef = character.refs.find(
    (ref) => ref[0] === event.persona?.[2]
  )?.[1]

  const [refs, setRefs] = useState<string[]>([])

  const openScene = () => {
    composerDispatch({
      type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
      selectedWorldOutlineElement: {
        expanded: true,
        id: event.sceneId,
        title: event.title,
        type: ELEMENT_TYPE.SCENE
      }
    })
  }

  const openEvent = () => {
    composerDispatch({ type: COMPOSER_ACTION_TYPE.CLOSE_CHARACTER_MODAL })

    openScene()

    // stack hack
    setTimeout(
      () =>
        event.id &&
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
          selectedSceneMapEvent: event.id
        }),
      1
    )
  }

  // elmstorygames/feedback#199
  useEffect(() => {
    const combinedRefs: string[] = []

    singleRef && combinedRefs.push(formatCharacterRefDisplay(singleRef, 'cap'))

    const characterDetails = getCharacterDetailsFromEventContent(
      JSON.parse(event.content)
    )

    characterDetails.map(({ character_id, alias_id }) => {
      if (character_id && !alias_id) {
        const formattedCharacterTitle = formatCharacterRefDisplay(
          character.title,
          'cap'
        )

        !combinedRefs.includes(formattedCharacterTitle) &&
          combinedRefs.push(formattedCharacterTitle)
      }

      if (alias_id) {
        const foundAlias = character.refs.find((ref) => ref[0] === alias_id)

        if (foundAlias) {
          const formattedCharacterAlias = formatCharacterRefDisplay(
            foundAlias[1],
            'cap'
          )

          !combinedRefs.includes(formattedCharacterAlias) &&
            combinedRefs.push(formattedCharacterAlias)
        }
      }
    })

    setRefs(combinedRefs)
  }, [])

  return (
    <div className={styles.EventRow}>
      <Table
        dataSource={[
          {
            key: event.id,
            title: event.title,
            refs,
            mask: event.persona?.[1]
          }
        ]}
        columns={[
          {
            title: 'Event',
            dataIndex: 'title',
            key: 'title',
            render: (title: string) => (
              <span className={styles.link} onClick={openEvent}>
                {title}
              </span>
            )
          },
          {
            title: 'Reference',
            dataIndex: 'refs',
            key: 'refs',
            className: styles.reference,
            render: (refs: string[]) => (
              <>
                {refs.length > 0 ? (
                  <span>{refs.join(', ')}</span>
                ) : (
                  <span>&mdash;</span>
                )}
              </>
            )
          },
          {
            title: 'Mask',
            dataIndex: 'mask',
            key: 'mask',
            className: styles.mask,
            render: (mask: CHARACTER_MASK_TYPE | undefined) => (
              <div>
                {character.id && mask && (
                  <>
                    <CharacterMask
                      studioId={studioId}
                      worldId={character.worldId}
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

                    <span>{mask}</span>
                  </>
                )}

                {!mask && <div style={{ textAlign: 'center' }}>N/A</div>}
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
  worldId: WorldId
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
