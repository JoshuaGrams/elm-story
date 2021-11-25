// #356
import React, { useContext } from 'react'

import { COMPONENT_TYPE, Game, Scene } from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import styles from './styles.module.less'

const TabToolbar: React.FC<{
  component: { type: COMPONENT_TYPE; data: Game | Scene | undefined }
}> = ({ children, component }) => {
  const { editor, editorDispatch } = useContext(EditorContext)

  return (
    <div
      className={styles.TabContentToolbar}
      onMouseDown={() => {
        if (
          component.type === COMPONENT_TYPE.SCENE &&
          component.data &&
          component.data.id &&
          component.data.id !== editor.selectedGameOutlineComponent.id
        ) {
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: component.data.id,
              title: component.data.title,
              type: COMPONENT_TYPE.SCENE,
              expanded: true
            }
          })
        }
      }}
    >
      {children}
    </div>
  )
}

export default TabToolbar
