import React, { useContext } from 'react'

import { ElementId, ELEMENT_TYPE, StudioId } from '../../../data/types'

import { useJump } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import ElementTitle from '../ElementTitle'
import JumpTo from '../../JumpTo'

import rootStyles from '../styles.module.less'
import styles from './styles.module.less'

import api from '../../../api'

const JumpDetails: React.FC<{
  studioId: StudioId
  jumpId: ElementId
}> = ({ studioId, jumpId }) => {
  const jump = useJump(studioId, jumpId, [jumpId])

  const { composer, composerDispatch } = useContext(ComposerContext)

  return (
    <>
      {jump && (
        <div className={rootStyles.componentDetailViewWrapper}>
          <div className={rootStyles.content}>
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
            <div className={rootStyles.componentId}>{jump.id}</div>

            <div className={styles.jumpTo}>
              {jump.id && (
                <JumpTo
                  studioId={studioId}
                  jumpId={jump.id}
                  onRemove={async (jumpId) => {
                    if (jumpId === composer.selectedSceneMapJump) {
                      composerDispatch({
                        type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
                        selectedSceneMapJump: null
                      })
                    }

                    composerDispatch({
                      type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
                      removedElement: {
                        type: ELEMENT_TYPE.JUMP,
                        id: jumpId
                      }
                    })
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default JumpDetails
