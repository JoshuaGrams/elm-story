import React from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import {
  AlignLeftOutlined,
  DeploymentUnitOutlined,
  FolderOutlined,
  PartitionOutlined
} from '@ant-design/icons'

import StoryworldProperties from './StoryworldProperties'
import FolderProperties from './FolderProperties'
import SceneProperties from './SceneProperties'
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
          <StoryworldProperties studioId={studioId} gameId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.FOLDER && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <FolderOutlined className={styles.headerIcon} /> Selected Folder
            <ElementHelpButton type={COMPONENT_TYPE.FOLDER} />
          </div>
          <FolderProperties studioId={studioId} folderId={component.id} />
        </>
      )}

      {component.type === COMPONENT_TYPE.SCENE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <PartitionOutlined className={styles.headerIcon} /> Selected Scene
            <ElementHelpButton type={COMPONENT_TYPE.SCENE} />
          </div>
          <SceneProperties studioId={studioId} sceneId={component.id} />
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
