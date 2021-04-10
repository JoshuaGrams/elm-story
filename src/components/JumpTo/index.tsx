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

import { Divider, Select } from 'antd'

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
    componentId: ComponentId
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

  return (
    <div className={styles.JumpSelect}>
      {chapters && (
        <>
          <Divider>
            <h2>Chapter</h2>
          </Divider>
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
        </>
      )}

      {scenes && scenes.length > 0 && (
        <>
          <Divider>
            <h2>Scene</h2>
          </Divider>
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
        </>
      )}

      {passages && passages.length > 0 && (
        <>
          <Divider>
            <h2>Passage</h2>
          </Divider>
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
        </>
      )}
    </div>
  )
}

const JumpTo: React.FC<{
  studioId: StudioId
  jumpId: ComponentId
}> = ({ studioId, jumpId }) => {
  const jump = useJump(studioId, jumpId, [studioId, jumpId])

  async function onChangeRoutePart(
    componentType: COMPONENT_TYPE,
    componentId: ComponentId
  ) {
    if (jump?.id) {
      switch (componentType) {
        case COMPONENT_TYPE.CHAPTER:
          await api().jumps.saveJumpRoute(studioId, jump.id, [componentId])
          break
        case COMPONENT_TYPE.SCENE:
          await api().jumps.saveJumpRoute(studioId, jump.id, [
            jump.route[0],
            componentId
          ])
          break
        case COMPONENT_TYPE.PASSAGE:
          await api().jumps.saveJumpRoute(studioId, jump.id, [
            jump.route[0],
            jump.route[1],
            componentId
          ])
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
