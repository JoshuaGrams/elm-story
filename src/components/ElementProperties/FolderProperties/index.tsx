import React, { useContext } from 'react'

import { ElementId, StudioId } from '../../../data/types'

import { useFolder } from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import ComponentTitle from '../ElementTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const FolderDetails: React.FC<{
  studioId: StudioId
  folderId: ElementId
}> = ({ studioId, folderId }) => {
  const folder = useFolder(studioId, folderId, [folderId])

  const { editorDispatch } = useContext(EditorContext)

  return (
    <>
      {folder && (
        <div className={styles.componentDetailViewWrapper}>
          <div className={styles.content}>
            <ComponentTitle
              title={folder.title}
              onUpdate={async (title) => {
                if (folder.id) {
                  await api().folders.saveFolder(studioId, {
                    ...(await api().folders.getFolder(studioId, folder.id)),
                    title
                  })

                  editorDispatch({
                    type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
                    renamedComponent: {
                      id: folder.id,
                      newTitle: title
                    }
                  })
                }
              }}
            />
            <div className={styles.componentId}>{folder.id}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default FolderDetails
