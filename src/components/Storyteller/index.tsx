import { ipcRenderer } from 'electron'

import React, { useRef, useState, useEffect, useContext } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

import api from '../../api'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import { ELEMENT_TYPE, WorldId, StudioId } from '../../data/types'
import {
  EngineDevToolsLiveEvent,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../../lib/transport/types/0.7.0'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../contexts/ComposerContext'

// @ts-ignore
import Runtime from './embedded/Runtime'

import styles from './styles.module.less'

const Storyteller: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = React.memo(({ studioId, worldId }) => {
  const { composerDispatch } = useContext(ComposerContext)

  const runtimeWrapperRef = useRef<HTMLDivElement>(null)

  const [runtimeStyles, setRuntimeStyles] = useState({})

  const processEvents = async (event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsLiveEvent>

    switch (detail.eventType) {
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.OPEN_EVENT:
        if (detail.eventId) {
          const events = await api().events.getEvent(studioId, detail.eventId)

          if (events) {
            const scene = await api().scenes.getScene(studioId, events.sceneId)

            if (scene?.id) {
              composerDispatch({
                type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
                selectedWorldOutlineElement: {
                  expanded: true,
                  id: scene.id,
                  title: scene.title,
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
          }
        }
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
                  url,
                  exists,
                  ext
                }
              }
            }
          )
        )

        break
      default:
        throw 'Unknown engine event type.'
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
