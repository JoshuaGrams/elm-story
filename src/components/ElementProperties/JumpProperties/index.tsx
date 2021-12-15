import React, { useContext } from 'react'

import { ElementId, StudioId } from '../../../data/types'

import { useJump } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import ElementTitle from '../ElementTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const JumpDetails: React.FC<{
  studioId: StudioId
  jumpId: ElementId
}> = ({ studioId, jumpId }) => {
  const jump = useJump(studioId, jumpId, [jumpId])

  const { composerDispatch } = useContext(ComposerContext)

  return (
    <>
      {jump && (
        <div className={styles.componentDetailViewWrapper}>
          <div className={styles.content}>
            <ElementTitle
              title={jump.title}
              onUpdate={async (title) => {
                if (jump.id) {
                  await api().jumps.saveJump(studioId, {
                    ...(await api().jumps.getJump(studioId, jump.id)),
                    title
                  })

                  composerDispatch({
                    type: COMPOSER_ACTION_TYPE.ELEMENT_RENAME,
                    renamedElement: {
                      id: jump.id,
                      newTitle: title
                    }
                  })
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
