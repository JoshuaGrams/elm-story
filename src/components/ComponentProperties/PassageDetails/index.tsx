import React, { useContext } from 'react'

import { ComponentId, StudioId } from '../../../data/types'

import { usePassage } from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import ComponentTitle from '../ComponentTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const PassageDetails: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
  const passage = usePassage(studioId, passageId, [passageId])

  const { editorDispatch } = useContext(EditorContext)

  return (
    <>
      {passage && (
        <div className={styles.componentDetailViewWrapper}>
          <div className={styles.content}>
            <ComponentTitle
              title={passage.title}
              onUpdate={async (title) => {
                if (passage.id) {
                  await api().passages.savePassage(studioId, {
                    ...(await api().passages.getPassage(studioId, passage.id)),
                    title
                  })

                  editorDispatch({
                    type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
                    renamedComponent: {
                      id: passage.id,
                      newTitle: title
                    }
                  })
                }
              }}
            />
            <div className={styles.componentId}>{passage.id}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default PassageDetails
