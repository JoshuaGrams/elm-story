import React from 'react'

import { ElementId, StudioId } from '../../../data/types'

import { useJump } from '../../../hooks'

import ComponentTitle from '../ElementTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const JumpDetails: React.FC<{
  studioId: StudioId
  jumpId: ElementId
}> = ({ studioId, jumpId }) => {
  const jump = useJump(studioId, jumpId, [jumpId])

  return (
    <>
      {jump && (
        <div className={styles.componentDetailViewWrapper}>
          <div className={styles.content}>
            <ComponentTitle
              title={jump.title}
              onUpdate={async (title) => {
                if (jump.id) {
                  await api().jumps.saveJump(studioId, {
                    ...(await api().jumps.getJump(studioId, jump.id)),
                    title
                  })

                  // TODO: This is not yet needed.
                  // editorDispatch({
                  //   type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
                  //   renamedComponent: {
                  //     id: jump.id,
                  //     newTitle: title
                  //   }
                  // })
                }
              }}
            />
            <div className={styles.componentId}>{jump.id}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default JumpDetails
