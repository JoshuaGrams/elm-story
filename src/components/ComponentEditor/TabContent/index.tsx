import logger from '../../../lib/logger'

import React, { useContext } from 'react'

import {
  Chapter,
  ComponentId,
  COMPONENT_TYPE,
  Game,
  Passage,
  Scene,
  StudioId
} from '../../../data/types'

import { useChapter, useGame, usePassage, useScene } from '../../../hooks'

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

  const { editor, editorDispatch } = useContext(EditorContext)

  switch (type) {
    case COMPONENT_TYPE.GAME:
      game = useGame(studioId, id)
      break
    case COMPONENT_TYPE.CHAPTER:
      chapter = useChapter(studioId, id)
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

  return (
    <div
      className={styles.TabContent}
      onClick={() => {
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
      }}
    >
      <TabContentToolbar>{tools}</TabContentToolbar>
      <div className={styles.TabContentView}>{view}</div>
    </div>
  )
}

export default TabContent
