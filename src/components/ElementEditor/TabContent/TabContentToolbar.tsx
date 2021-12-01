// #356
import React, { useContext } from 'react'

import { ELEMENT_TYPE, World, Scene } from '../../../data/types'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import styles from './styles.module.less'

const TabToolbar: React.FC<{
  component: { type: ELEMENT_TYPE; data: World | Scene | undefined }
}> = ({ children, component }) => {
  const { composer: editor, composerDispatch: editorDispatch } = useContext(ComposerContext)

  return (
    <div
      className={styles.TabContentToolbar}
      onMouseDown={() => {
        if (
          component.type === ELEMENT_TYPE.SCENE &&
          component.data &&
          component.data.id &&
          component.data.id !== editor.selectedWorldOutlineElement.id
        ) {
          editorDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
            selectedWorldOutlineElement: {
              id: component.data.id,
              title: component.data.title,
              type: ELEMENT_TYPE.SCENE,
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
