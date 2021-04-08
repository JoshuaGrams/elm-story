import React from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import {
  AlignLeftOutlined,
  BookOutlined,
  PartitionOutlined,
  PlayCircleFilled
} from '@ant-design/icons'

import GameDetails from './GameDetails'
import ChapterDetails from './ChapterDetails'
import SceneDetails from './SceneDetails'
import PassageDetails from './PassageDetails'

import styles from './styles.module.less'

const ComponentDetailView: React.FC<{
  studioId: StudioId
  component: {
    id: ComponentId
    type: COMPONENT_TYPE
  }
}> = ({ studioId, component }) => {
  return (
    <div className={styles.ComponentDetailView}>
      {component.type === COMPONENT_TYPE.GAME && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <PlayCircleFilled className={styles.headerIcon} /> Game Details
          </div>
          <GameDetails studioId={studioId} gameId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.CHAPTER && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <BookOutlined className={styles.headerIcon} /> Chapter Details
          </div>
          <ChapterDetails studioId={studioId} chapterId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.SCENE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <PartitionOutlined className={styles.headerIcon} /> Scene Details
          </div>
          <SceneDetails studioId={studioId} sceneId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.PASSAGE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <AlignLeftOutlined className={styles.headerIcon} /> Passage Details
          </div>
          <PassageDetails studioId={studioId} passageId={component.id} />
        </>
      )}
    </div>
  )
}

export default ComponentDetailView
