import logger from '../../lib/logger'

import React, { useEffect, useState } from 'react'

import {
  Chapter,
  ComponentId,
  COMPONENT_TYPE,
  GameId,
  Passage,
  Scene,
  StudioId
} from '../../data/types'

import {
  useChapters,
  useJump,
  usePassagesBySceneRef,
  useScenesByChapterRef
} from '../../hooks'

import { Button, Col, Divider, Row, Select } from 'antd'
import { RollbackOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../api'

const JumpSelect: React.FC<{
  studioId: StudioId
  gameId?: GameId
  chapterId?: ComponentId
  sceneId?: ComponentId
  selectedId: ComponentId | undefined
  onChangeRoutePart: (
    componentType: COMPONENT_TYPE,
    componentId: ComponentId | null
  ) => Promise<void>
}> = ({
  studioId,
  gameId,
  chapterId,
  sceneId,
  selectedId,
  onChangeRoutePart
}) => {
  let chapters: Chapter[] | undefined = gameId
      ? useChapters(studioId, gameId, [gameId])
      : undefined,
    scenes: Scene[] | undefined = chapterId
      ? useScenesByChapterRef(studioId, chapterId, [chapterId])
      : undefined,
    passages: Passage[] | undefined = sceneId
      ? usePassagesBySceneRef(studioId, sceneId, [sceneId])
      : undefined

  const [selectedChapterId, setSelectedChapterId] = useState<
      ComponentId | undefined
    >(undefined),
    [selectedSceneId, setSelectedSceneId] = useState<ComponentId | undefined>(
      undefined
    ),
    [selectedPassageId, setSelectedPassageId] = useState<
      ComponentId | undefined
    >(undefined)

  async function onChange(componentId: string) {
    gameId && (await onChangeRoutePart(COMPONENT_TYPE.CHAPTER, componentId))

    chapterId && (await onChangeRoutePart(COMPONENT_TYPE.SCENE, componentId))

    sceneId && (await onChangeRoutePart(COMPONENT_TYPE.PASSAGE, componentId))
  }

  useEffect(() => {
    logger.info(`JumpSelect->chapters->useEffect`)

    chapters &&
      setSelectedChapterId(
        chapters.find((chapter) => chapter.id === selectedId)?.id
      )
  }, [chapters, selectedId])

  useEffect(() => {
    logger.info(`JumpSelect->scenes->useEffect`)

    scenes &&
      setSelectedSceneId(scenes.find((scene) => scene.id === selectedId)?.id)
  }, [scenes, selectedId])

  useEffect(() => {
    logger.info(`JumpSelect->passages->useEffect`)

    passages &&
      setSelectedPassageId(
        passages.find((passage) => passage.id === selectedId)?.id
      )
  }, [passages, selectedId])

  // TODO: abstract
  return (
    <div className={styles.JumpSelect}>
      {chapters && (
        <>
          <Divider>
            <h2>Chapter</h2>
          </Divider>

          <div className={styles.selectWrapper}>
            {selectedChapterId && (
              <>
                <Select value={selectedChapterId} onChange={onChange}>
                  {chapters.map(
                    (chapter) =>
                      chapter.id && (
                        <Select.Option value={chapter.id} key={chapter.id}>
                          {chapter.title}
                        </Select.Option>
                      )
                  )}
                </Select>

                <Button className={styles.rollBackBtn}>
                  <RollbackOutlined
                    onClick={() =>
                      onChangeRoutePart(COMPONENT_TYPE.CHAPTER, null)
                    }
                  />
                </Button>
              </>
            )}
          </div>
        </>
      )}

      {scenes && scenes.length > 0 && (
        <>
          <Divider>
            <h2>Scene</h2>
          </Divider>

          <div className={styles.selectWrapper}>
            {selectedSceneId && (
              <>
                <Select value={selectedSceneId} onChange={onChange}>
                  {scenes.map(
                    (scene) =>
                      scene.id && (
                        <Select.Option value={scene.id} key={scene.id}>
                          {scene.title}
                        </Select.Option>
                      )
                  )}
                </Select>

                <Button className={styles.rollBackBtn}>
                  <RollbackOutlined
                    onClick={() =>
                      onChangeRoutePart(COMPONENT_TYPE.SCENE, null)
                    }
                  />
                </Button>
              </>
            )}

            {!selectedSceneId && (
              <Button
                onClick={async () => {
                  if (scenes) {
                    const chapter = await api().chapters.getChapter(
                      studioId,
                      scenes[0].chapterId
                    )

                    onChange(chapter.scenes[0])
                  }
                }}
              >
                Jump to Scene
              </Button>
            )}
          </div>
        </>
      )}

      {passages && passages.length > 0 && (
        <>
          <Divider>
            <h2>Passage</h2>
          </Divider>

          <div className={styles.selectWrapper}>
            {selectedPassageId && (
              <>
                <Select value={selectedPassageId} onChange={onChange}>
                  {passages.map(
                    (passage) =>
                      passage.id && (
                        <Select.Option value={passage.id} key={passage.id}>
                          {passage.title}
                        </Select.Option>
                      )
                  )}
                </Select>

                <Button className={styles.rollBackBtn}>
                  <RollbackOutlined
                    onClick={() =>
                      onChangeRoutePart(COMPONENT_TYPE.PASSAGE, null)
                    }
                  />
                </Button>
              </>
            )}

            {!selectedPassageId && (
              <Button
                onClick={async () => {
                  if (passages) {
                    const scene = await api().scenes.getScene(
                      studioId,
                      passages[0].sceneId
                    )

                    onChange(scene.passages[0])
                  }
                }}
              >
                Jump to Passage
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const JumpTo: React.FC<{
  studioId: StudioId
  jumpId: ComponentId
  onRemove?: (jumpId: ComponentId) => Promise<void>
}> = ({ studioId, jumpId, onRemove }) => {
  const jump = useJump(studioId, jumpId, [studioId, jumpId])

  async function onChangeRoutePart(
    componentType: COMPONENT_TYPE,
    componentId: ComponentId | null
  ) {
    if (jump?.id) {
      switch (componentType) {
        case COMPONENT_TYPE.CHAPTER:
          componentId &&
            (await api().jumps.saveJumpRoute(studioId, jump.id, [componentId]))

          if (!componentId) {
            await api().games.saveJumpRefToGame(studioId, jump.gameId, null)

            await api().jumps.removeJump(studioId, jump.id)

            onRemove && (await onRemove(jumpId))
          }

          break
        case COMPONENT_TYPE.SCENE:
          await api().jumps.saveJumpRoute(
            studioId,
            jump.id,
            componentId ? [jump.route[0], componentId] : [jump.route[0]]
          )
          break
        case COMPONENT_TYPE.PASSAGE:
          await api().jumps.saveJumpRoute(
            studioId,
            jump.id,
            componentId
              ? [jump.route[0], jump.route[1], componentId]
              : [jump.route[0], jump.route[1]]
          )
          break
        default:
          break
      }
    }
  }

  return (
    <div className={styles.JumpTo}>
      {jump && (
        <>
          {/* Chapter */}
          {
            <JumpSelect
              studioId={studioId}
              gameId={jump.gameId}
              selectedId={jump.route[0]}
              onChangeRoutePart={onChangeRoutePart}
            />
          }

          {/* Scene */}
          {jump.route[0] && (
            <JumpSelect
              studioId={studioId}
              chapterId={jump.route[0]}
              selectedId={jump.route[1]}
              onChangeRoutePart={onChangeRoutePart}
            />
          )}

          {/* Passage */}
          {jump.route[1] && (
            <JumpSelect
              studioId={studioId}
              sceneId={jump.route[1]}
              selectedId={jump.route[2]}
              onChangeRoutePart={onChangeRoutePart}
            />
          )}
        </>
      )}
    </div>
  )
}

export default JumpTo
