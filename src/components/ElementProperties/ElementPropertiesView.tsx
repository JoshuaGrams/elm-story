import React from 'react'

import { ElementId, ELEMENT_TYPE, StudioId } from '../../data/types'

import {
  AlignLeftOutlined,
  DeploymentUnitOutlined,
  FolderOutlined,
  PartitionOutlined
} from '@ant-design/icons'

import StoryworldProperties from './WorldProperties'
import FolderProperties from './FolderProperties'
import SceneProperties from './SceneProperties'
import EventProperties from './EventProperties'
import ElementHelpButton from '../ElementHelpButton'

import styles from './styles.module.less'

const ComponentDetailView: React.FC<{
  studioId: StudioId
  component: {
    id: ElementId
    type: ELEMENT_TYPE
  }
}> = ({ studioId, component }) => {
  return (
    <div className={styles.ComponentDetailView}>
      {component.type === ELEMENT_TYPE.WORLD && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <DeploymentUnitOutlined className={styles.headerIcon} /> Selected
            Storyworld
            <ElementHelpButton type={ELEMENT_TYPE.WORLD} />
          </div>
          <StoryworldProperties studioId={studioId} worldId={component.id} />
        </>
      )}

      {component.type === ELEMENT_TYPE.FOLDER && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <FolderOutlined className={styles.headerIcon} /> Selected Folder
            <ElementHelpButton type={ELEMENT_TYPE.FOLDER} />
          </div>
          <FolderProperties studioId={studioId} folderId={component.id} />
        </>
      )}

      {component.type === ELEMENT_TYPE.SCENE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <PartitionOutlined className={styles.headerIcon} /> Selected Scene
            <ElementHelpButton type={ELEMENT_TYPE.SCENE} />
          </div>
          <SceneProperties studioId={studioId} sceneId={component.id} />
        </>
      )}

      {/* TODO: is this dead code? */}
      {component.type === ELEMENT_TYPE.EVENT && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <AlignLeftOutlined className={styles.headerIcon} /> Selected Event
            <ElementHelpButton type={ELEMENT_TYPE.EVENT} />
          </div>
          <EventProperties studioId={studioId} passageId={component.id} />
        </>
      )}
    </div>
  )
}

export default ComponentDetailView
