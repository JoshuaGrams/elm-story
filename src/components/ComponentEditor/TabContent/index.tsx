import logger from '../../../lib/logger'

import React, { useContext, useEffect } from 'react'

import {
  Chapter,
  ComponentId,
  COMPONENT_TYPE,
  Game,
  Passage,
  Scene,
  StudioId
} from '../../../data/types'

import {
  useDebouncedResizeObserver,
  useGame,
  usePassage,
  useScene
} from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import TabContentToolbar from './TabContentToolbar'

import styles from './styles.module.less'

const TabContent: React.FC<{
  studioId: StudioId
  id: ComponentId
  type: COMPONENT_TYPE
  view: JSX.Element
  tools: JSX.Element
}> = ({ studioId, id, type, tools, view }) => {
  let game: Game | undefined,
    chapter: Chapter | undefined,
    scene: Scene | undefined,
    passage: Passage | undefined

  const {
    ref: tabContentViewRef,
    width: tabContentViewWidth,
    height: tabContentViewHeight
  } = useDebouncedResizeObserver(1000)

  const { editor, editorDispatch } = useContext(EditorContext)

  switch (type) {
    case COMPONENT_TYPE.GAME:
      game = useGame(studioId, id)
      break
    case COMPONENT_TYPE.SCENE:
      scene = useScene(studioId, id)
      break
    case COMPONENT_TYPE.PASSAGE:
      passage = usePassage(studioId, id)
      break
    default:
      break
  }

  const onSelectTab = () => {
    if (id !== editor.selectedGameOutlineComponent.id) {
      switch (type) {
        case COMPONENT_TYPE.GAME:
          if (game && game.id) {
            logger.info(
              `TabContent->onClick: setSelectedGameOutlineComponent to game: ${game.id}`
            )

            editorDispatch({
              type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
              selectedGameOutlineComponent: {
                id: game.id,
                title: game.title,
                type: COMPONENT_TYPE.GAME,
                expanded: true
              }
            })
          }
          return
        case COMPONENT_TYPE.CHAPTER:
          if (chapter && chapter.id) {
            logger.info(
              `TabContent->onClick: setSelectedGameOutlineComponent to chapter: ${chapter.id}`
            )

            editorDispatch({
              type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
              selectedGameOutlineComponent: {
                id: chapter.id,
                title: chapter.title,
                type: COMPONENT_TYPE.CHAPTER,
                expanded: true
              }
            })
          }
          return
        case COMPONENT_TYPE.SCENE:
          if (scene && scene.id) {
            logger.info(
              `TabContent->onClick: setSelectedGameOutlineComponent to scene: ${scene.id}`
            )

            editorDispatch({
              type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
              selectedGameOutlineComponent: {
                id: scene.id,
                title: scene.title,
                type: COMPONENT_TYPE.SCENE,
                expanded: true
              }
            })
          }
          return
        case COMPONENT_TYPE.PASSAGE:
          if (passage && passage.id) {
            logger.info(
              `TabContent->onClick: setSelectedGameOutlineComponent to passage: ${passage.id}`
            )

            editorDispatch({
              type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
              selectedGameOutlineComponent: {
                id: passage.id,
                title: passage.title,
                type: COMPONENT_TYPE.PASSAGE,
                expanded: true
              }
            })
          }
          return
        default:
          break
      }
    }
  }

  useEffect(() => {
    logger.info(
      `TabContent->type,tabContentViewWidth,tabContentViewHeight->useEffect->
       type: ${type} width: ${tabContentViewWidth} height: ${tabContentViewHeight}`
    )
  }, [type, tabContentViewWidth, tabContentViewHeight])

  return (
    <div className={styles.TabContent}>
      {/* This mask selects tab without interacting with tab content. */}
      <div
        onClick={onSelectTab}
        onMouseDown={onSelectTab}
        className={styles.interactionMask}
        style={{
          display:
            editor.selectedGameOutlineComponent.id === id ? 'none' : 'block'
        }}
      />
      <TabContentToolbar>{tools}</TabContentToolbar>
      <div
        ref={tabContentViewRef}
        className={styles.TabContentView}
        style={{
          overflow: type === COMPONENT_TYPE.GAME ? 'hidden' : 'initial'
        }}
      >
        {view}
      </div>
    </div>
  )
}

export default TabContent
