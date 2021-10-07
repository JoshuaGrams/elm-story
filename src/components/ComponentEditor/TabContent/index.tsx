import logger from '../../../lib/logger'

import React, { useEffect } from 'react'

import {
  ComponentId,
  COMPONENT_TYPE,
  Game,
  Scene,
  StudioId
} from '../../../data/types'

import { useDebouncedResizeObserver, useGame, useScene } from '../../../hooks'

import EditorTabProvider from '../../../contexts/EditorTabContext'

import TabContentToolbar from './TabContentToolbar'

import styles from './styles.module.less'

const TabContent: React.FC<{
  studioId: StudioId
  id: ComponentId
  type: COMPONENT_TYPE
  view: JSX.Element
  tools: JSX.Element
}> = ({ studioId, id, type, tools, view }) => {
  let component: { type: COMPONENT_TYPE; data: Game | Scene | undefined }

  const {
    ref: tabContentViewRef,
    width: tabContentViewWidth,
    height: tabContentViewHeight
  } = useDebouncedResizeObserver(1000)

  switch (type) {
    case COMPONENT_TYPE.GAME:
      component = { type: COMPONENT_TYPE.GAME, data: useGame(studioId, id) }
      break
    case COMPONENT_TYPE.SCENE:
      component = { type: COMPONENT_TYPE.SCENE, data: useScene(studioId, id) }
      break
    default:
      throw 'Unable to render TabContent. Unknown component type.'
  }

  useEffect(() => {
    logger.info(
      `TabContent->type,tabContentViewWidth,tabContentViewHeight->useEffect->
       type: ${type} width: ${tabContentViewWidth} height: ${tabContentViewHeight}`
    )
  }, [type, tabContentViewWidth, tabContentViewHeight])

  return (
    <EditorTabProvider>
      <div className={styles.TabContent}>
        {/* #356 */}
        <TabContentToolbar component={component}>{tools}</TabContentToolbar>
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
    </EditorTabProvider>
  )
}

export default TabContent
