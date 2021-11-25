import React from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import {
  AlignLeftOutlined,
  DeploymentUnitOutlined,
  FolderOutlined,
  PartitionOutlined
} from '@ant-design/icons'

import GameDetails from './StoryworldProperties'
import FolderDetails from './FolderProperties'
import SceneDetails from './SceneProperties'
import EventProperties from './EventProperties'
import ElementHelpButton from '../ElementHelpButton'

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
            <DeploymentUnitOutlined className={styles.headerIcon} /> Selected
            Storyworld
            <ElementHelpButton type={COMPONENT_TYPE.GAME} />
          </div>
          <GameDetails studioId={studioId} gameId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.FOLDER && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <FolderOutlined className={styles.headerIcon} /> Selected Folder
            <ElementHelpButton type={COMPONENT_TYPE.FOLDER} />
          </div>
          <FolderDetails studioId={studioId} folderId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.SCENE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <PartitionOutlined className={styles.headerIcon} /> Selected Scene
            <ElementHelpButton type={COMPONENT_TYPE.SCENE} />
          </div>
          <SceneDetails studioId={studioId} sceneId={component.id} />
        </>
      )}

      {/* TODO: is this dead code? */}
      {component.type === COMPONENT_TYPE.PASSAGE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <AlignLeftOutlined className={styles.headerIcon} /> Selected Event
            <ElementHelpButton type={COMPONENT_TYPE.PASSAGE} />
          </div>
          <EventProperties studioId={studioId} passageId={component.id} />
        </>
      )}
    </div>
  )
}

export default ComponentDetailView
