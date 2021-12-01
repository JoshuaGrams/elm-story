import logger from '../../../lib/logger'

import React, { useEffect } from 'react'

import {
  ElementId,
  ELEMENT_TYPE,
  World,
  Scene,
  StudioId
} from '../../../data/types'

import { useDebouncedResizeObserver, useWorld, useScene } from '../../../hooks'

import EditorTabProvider from '../../../contexts/EditorTabContext'

import TabContentToolbar from './TabContentToolbar'

import styles from './styles.module.less'

const TabContent: React.FC<{
  studioId: StudioId
  id: ElementId
  type: ELEMENT_TYPE
  view: JSX.Element
  tools: JSX.Element
}> = ({ studioId, id, type, tools, view }) => {
  let component: { type: ELEMENT_TYPE; data: World | Scene | undefined }

  const {
    ref: tabContentViewRef,
    width: tabContentViewWidth,
    height: tabContentViewHeight
  } = useDebouncedResizeObserver(1000)

  switch (type) {
    case ELEMENT_TYPE.WORLD:
      component = { type: ELEMENT_TYPE.WORLD, data: useWorld(studioId, id) }
      break
    case ELEMENT_TYPE.SCENE:
      component = { type: ELEMENT_TYPE.SCENE, data: useScene(studioId, id) }
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
            overflow: type === ELEMENT_TYPE.WORLD ? 'hidden' : 'initial'
          }}
        >
          {view}
        </div>
      </div>
    </EditorTabProvider>
  )
}

export default TabContent
