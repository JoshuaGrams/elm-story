import React, { useRef, useState, useEffect, useContext } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

import api from '../../api'

import { COMPONENT_TYPE, WorldId, StudioId } from '../../data/types'
import {
  EngineDevToolsEvent,
  ENGINE_DEVTOOLS_EVENTS,
  ENGINE_DEVTOOLS_EVENT_TYPE
} from '../../lib/transport/types/0.5.1'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import Runtime from './embeded/Runtime'

const GameEngine: React.FC<{
  studioId: StudioId
  gameId: WorldId
}> = React.memo(({ studioId, gameId }) => {
  const { editorDispatch } = useContext(EditorContext)

  const runtimeWrapperRef = useRef<HTMLDivElement>(null)

  const [runtimeStyles, setRuntimeStyles] = useState({})

  const processEvents = async (event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsEvent>

    switch (detail.eventType) {
      case ENGINE_DEVTOOLS_EVENT_TYPE.OPEN_PASSAGE:
        if (detail.passageId) {
          const passage = await api().passages.getPassage(
            studioId,
            detail.passageId
          )

          if (passage) {
            const scene = await api().scenes.getScene(studioId, passage.sceneId)

            if (scene?.id) {
              editorDispatch({
                type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
                selectedGameOutlineComponent: {
                  expanded: true,
                  id: scene.id,
                  title: scene.title,
                  type: COMPONENT_TYPE.SCENE
                }
              })

              // #313: stack hack
              setTimeout(
                () =>
                  detail.passageId &&
                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                    selectedComponentEditorSceneViewPassage: detail.passageId
                  }),
                1
              )
            }
          }
        }
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
      ENGINE_DEVTOOLS_EVENTS.ENGINE_TO_EDITOR,
      processEvents
    )

    return () => {
      window.removeEventListener(
        ENGINE_DEVTOOLS_EVENTS.ENGINE_TO_EDITOR,
        processEvents
      )
    }
  }, [])

  return (
    <div ref={runtimeWrapperRef} style={{ width: '100%', height: '100%' }}>
      <div id="runtime" style={runtimeStyles}>
        <Runtime studioId={studioId} game={{ id: gameId }} />
      </div>
    </div>
  )
})

export default GameEngine
