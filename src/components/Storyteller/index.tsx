import { ipcRenderer } from 'electron'

import React, { useRef, useState, useEffect, useContext } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

import api from '../../api'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import {
  ELEMENT_TYPE,
  WorldId,
  StudioId,
  Event as _Event,
  Scene
} from '../../data/types'
import {
  EngineDevToolsLiveEvent,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../../lib/transport/types/0.7.1'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../contexts/ComposerContext'

// @ts-ignore
import Runtime from './embedded/Runtime'

import styles from './styles.module.less'
import logger from '../../lib/logger'

const Storyteller: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = React.memo(({ studioId, worldId }) => {
  const { composer, composerDispatch } = useContext(ComposerContext)

  const runtimeWrapperRef = useRef<HTMLDivElement>(null)

  const [runtimeStyles, setRuntimeStyles] = useState({})

  const processEvents = async (event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsLiveEvent>

    let eventData: _Event | undefined,
      sceneData: Scene | undefined = undefined

    switch (detail.eventType) {
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.OPEN_EVENT:
        if (!detail.eventId) return

        eventData = await api().events.getEvent(studioId, detail.eventId)

        if (!eventData) return

        sceneData = await api().scenes.getScene(studioId, eventData.sceneId)

        if (sceneData?.id) {
          composerDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
            selectedWorldOutlineElement: {
              expanded: true,
              id: sceneData.id,
              title: sceneData.title,
              type: ELEMENT_TYPE.SCENE
            }
          })

          // #313: stack hack
          setTimeout(
            () =>
              detail.eventId &&
              composerDispatch({
                type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
                selectedSceneMapEvent: detail.eventId
              }),
            1
          )
        }

        break
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.OPEN_SCENE:
        if (!detail.scene?.id || !detail.scene?.title) return

        composerDispatch({
          type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
          selectedWorldOutlineElement: {
            expanded: true,
            id: detail.scene.id,
            title: detail.scene.title,
            type: ELEMENT_TYPE.SCENE
          }
        })

        // #313: stack hack
        setTimeout(
          () =>
            detail.eventId &&
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
              selectedSceneMapEvent: null
            }),
          1
        )

        break
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.GET_ASSET_URL:
        const [url, exists, ext]: [
          string,
          boolean,
          'jpeg' | 'webp' | 'mp3'
        ] = await ipcRenderer.invoke(WINDOW_EVENT_TYPE.GET_ASSET, {
          studioId,
          worldId,
          id: detail.asset?.id,
          ext: detail.asset?.ext
        })

        window.dispatchEvent(
          new CustomEvent<EngineDevToolsLiveEvent>(
            ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
            {
              detail: {
                eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RETURN_ASSET_URL,
                eventId: detail.eventId,
                asset: {
                  id: detail.asset?.id,
                  for: detail.asset?.for,
                  url,
                  exists,
                  ext
                }
              }
            }
          )
        )

        break
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.GET_EVENT_DATA:
        if (!detail.eventId) return

        eventData = await api().events.getEvent(studioId, detail.eventId)

        if (!eventData?.id) return

        sceneData = await api().scenes.getScene(studioId, eventData.sceneId)

        if (!sceneData?.id) return

        window.dispatchEvent(
          new CustomEvent<EngineDevToolsLiveEvent>(
            ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
            {
              detail: {
                eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RETURN_EVENT_DATA,
                eventId: detail.eventId,
                event: {
                  title: eventData.title,
                  sceneId: sceneData.id,
                  sceneTitle: sceneData.title
                }
              }
            }
          )
        )

        break
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.MUTE:
        logger.info(
          `[STORYTELLER] Muting ${
            detail.muteFrom === 'AUDIO_PROFILE'
              ? 'storyteller'
              : 'audio profile'
          } audio preview.`
        )
        break
      default:
        logger.error('Unknown engine event type.')
        break
    }
  }

  useResizeObserver(runtimeWrapperRef, () => {
    if (runtimeWrapperRef.current) {
      setRuntimeStyles(
        runtimeWrapperRef.current.offsetWidth > 680
          ? {
              width: '680px',
              left: '50%',
              transform: 'translate(-50%, 0%)',
              borderLeft: '1px solid var(--renderer-border-color)',
              borderRight: '1px solid var(--renderer-border-color)'
            }
          : {
              width: '100%',
              left: '0%',
              transform: 'translate(0%, 0%)',
              border: 'none'
            }
      )
    }
  })

  useEffect(() => {
    if (composer.renamedElement.type === ELEMENT_TYPE.SCENE) {
      window.dispatchEvent(
        new CustomEvent<EngineDevToolsLiveEvent>(
          ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
          {
            detail: {
              eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RETURN_EVENT_DATA,
              event: {
                sceneId: composer.renamedElement.id,
                sceneTitle: composer.renamedElement.newTitle
              }
            }
          }
        )
      )
    }

    if (composer.renamedElement.type === ELEMENT_TYPE.EVENT) {
      window.dispatchEvent(
        new CustomEvent<EngineDevToolsLiveEvent>(
          ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
          {
            detail: {
              eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RETURN_EVENT_DATA,
              eventId: composer.renamedElement.id,
              event: {
                title: composer.renamedElement.newTitle
              }
            }
          }
        )
      )
    }
  }, [composer.renamedElement])

  useEffect(() => {
    window.addEventListener(
      ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
      processEvents
    )

    return () => {
      window.removeEventListener(
        ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
        processEvents
      )
    }
  }, [])

  return (
    <div
      ref={runtimeWrapperRef}
      className={styles.Storyteller}
      style={{ background: 'hsl(0, 0%, 3%)', width: '100%', height: '100%' }}
    >
      <div id="runtime" style={runtimeStyles}>
        <Runtime studioId={studioId} world={{ id: worldId }} />
      </div>
    </div>
  )
})

export default Storyteller
