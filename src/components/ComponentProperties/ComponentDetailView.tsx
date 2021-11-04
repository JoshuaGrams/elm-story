import React from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import {
  AlignLeftOutlined,
  FolderOutlined,
  PartitionOutlined,
  PlayCircleFilled
} from '@ant-design/icons'

import GameDetails from './GameDetails'
import FolderDetails from './FolderDetails'
import SceneDetails from './SceneDetails'
import PassageDetails from './PassageDetails'
import ComponentHelpButton from '../ComponentHelpButton'

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
            <ComponentHelpButton type={COMPONENT_TYPE.GAME} />
          </div>
          <GameDetails studioId={studioId} gameId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.FOLDER && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <FolderOutlined className={styles.headerIcon} /> Folder Details
            <ComponentHelpButton type={COMPONENT_TYPE.FOLDER} />
          </div>
          <FolderDetails studioId={studioId} folderId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.SCENE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <PartitionOutlined className={styles.headerIcon} /> Scene Details
            <ComponentHelpButton type={COMPONENT_TYPE.SCENE} />
          </div>
          <SceneDetails studioId={studioId} sceneId={component.id} />
        </>
      )}

      {/* TODO: is this dead code? */}
      {component.type === COMPONENT_TYPE.PASSAGE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <AlignLeftOutlined className={styles.headerIcon} /> Passage Details
            <ComponentHelpButton type={COMPONENT_TYPE.PASSAGE} />
          </div>
          <PassageDetails studioId={studioId} passageId={component.id} />
        </>
      )}
    </div>
  )
}

export default ComponentDetailView
