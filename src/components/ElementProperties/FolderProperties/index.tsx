import React, { useContext } from 'react'

import { ElementId, StudioId } from '../../../data/types'

import { useFolder } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import ElementTitle from '../ElementTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const FolderDetails: React.FC<{
  studioId: StudioId
  folderId: ElementId
}> = ({ studioId, folderId }) => {
  const folder = useFolder(studioId, folderId, [folderId])

  const { composerDispatch } = useContext(ComposerContext)

  return (
    <>
      {folder && (
        <div className={styles.componentDetailViewWrapper}>
          <div className={styles.content}>
            <ElementTitle
              title={folder.title}
              onUpdate={async (title) => {
                if (folder.id) {
                  await api().folders.saveFolder(studioId, {
                    ...(await api().folders.getFolder(studioId, folder.id)),
                    title
                  })

                  composerDispatch({
                    type: COMPOSER_ACTION_TYPE.ELEMENT_RENAME,
                    renamedElement: {
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
