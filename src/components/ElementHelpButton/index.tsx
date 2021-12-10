import { ipcRenderer } from 'electron'

import React from 'react'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import { ELEMENT_TYPE } from '../../data/types'

import { QuestionCircleFilled } from '@ant-design/icons'

import styles from './styles.module.less'

const ElementHelpButton: React.FC<{ type: ELEMENT_TYPE }> = ({ type }) => {
  const openHelp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation()

    let helpUrl =
      'https://docs.elmstory.com/guides/production/composer/elements'

    switch (type) {
      case ELEMENT_TYPE.CHARACTER:
        helpUrl = `${helpUrl}/character-element/`
        break
      case ELEMENT_TYPE.CHOICE:
        helpUrl = `${helpUrl}/choice-element/`
        break
      case ELEMENT_TYPE.CONDITION:
        helpUrl = `${helpUrl}/condition-element/`
        break
      case ELEMENT_TYPE.EFFECT:
        helpUrl = `${helpUrl}/effect-element/`
        break
      case ELEMENT_TYPE.FOLDER:
        helpUrl = `${helpUrl}/folder-element/`
        break
      case ELEMENT_TYPE.WORLD:
        helpUrl = `${helpUrl}/world-root-element/`
        break
      case ELEMENT_TYPE.JUMP:
        helpUrl = `${helpUrl}/jump-element/`
        break
      case ELEMENT_TYPE.EVENT:
        helpUrl = `${helpUrl}/event-element/`
        break
      case ELEMENT_TYPE.PATH:
        helpUrl = `${helpUrl}/path-element/`
        break
      case ELEMENT_TYPE.SCENE:
        helpUrl = `${helpUrl}/scene-element/`
        break
      case ELEMENT_TYPE.VARIABLE:
        helpUrl = `${helpUrl}/variable-element/`
        break
      default:
        helpUrl = 'https://docs.elmstory.com/'
        break
    }

    ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [helpUrl])
  }

  return (
    <div className={styles.ElementHelpButton} onClick={openHelp}>
      <QuestionCircleFilled />
    </div>
  )
}

ElementHelpButton.displayName = 'ElementHelpButton'

export default ElementHelpButton
