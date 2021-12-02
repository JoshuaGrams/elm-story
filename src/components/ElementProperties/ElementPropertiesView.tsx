import React from 'react'

import { ElementId, ELEMENT_TYPE, StudioId } from '../../data/types'

import {
  AlignLeftOutlined,
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
  element: {
    id: ElementId
    type: ELEMENT_TYPE
  }
}> = ({ studioId, element }) => {
  return (
    <div className={styles.ComponentDetailView}>
      {element.type === ELEMENT_TYPE.WORLD && (
        <>
          <div className={styles.componentDetailViewHeader}>
            &#127757; Selected Storyworld
            <ElementHelpButton type={ELEMENT_TYPE.WORLD} />
          </div>
          <StoryworldProperties studioId={studioId} worldId={element.id} />
        </>
      )}

      {element.type === ELEMENT_TYPE.FOLDER && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <FolderOutlined className={styles.headerIcon} /> Selected Folder
            <ElementHelpButton type={ELEMENT_TYPE.FOLDER} />
          </div>
          <FolderProperties studioId={studioId} folderId={element.id} />
        </>
      )}

      {element.type === ELEMENT_TYPE.SCENE && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <PartitionOutlined className={styles.headerIcon} /> Selected Scene
            <ElementHelpButton type={ELEMENT_TYPE.SCENE} />
          </div>
          <SceneProperties studioId={studioId} sceneId={element.id} />
        </>
      )}

      {/* TODO: is this dead code? */}
      {element.type === ELEMENT_TYPE.EVENT && (
        <>
          <div className={styles.componentDetailViewHeader}>
            <AlignLeftOutlined className={styles.headerIcon} /> Selected Event
            <ElementHelpButton type={ELEMENT_TYPE.EVENT} />
          </div>
          <EventProperties studioId={studioId} eventId={element.id} />
        </>
      )}
    </div>
  )
}

export default ComponentDetailView
