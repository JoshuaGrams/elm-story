import React, { useContext } from 'react'

import { useStudios } from '../../hooks'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'
import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import StudioModalLayout, {
  STUDIO_MODAL_LAYOUT_TYPE
} from '../../layouts/StudioModal'

import styles from './styles.module.less'

type StudioSelectProps = {
  className?: string
}

const StudioSelect: React.FC<StudioSelectProps> = ({
  className = ''
}: StudioSelectProps) => {
  const studios = useStudios()
  const { app, appDispatch } = useContext(AppContext)
  const { modalDispatch } = useContext(ModalContext)

  return (
    <>
      <div className={`${styles.studioList} ${className}`}>
        <h3>Game Studios</h3>

        {studios && (
          <>
            <select
              onChange={(event) => {
                const selection = event.target.value

                switch (selection) {
                  case 'create':
                    modalDispatch({
                      type: MODAL_ACTION_TYPE.LAYOUT,
                      layout: (
                        <StudioModalLayout
                          type={STUDIO_MODAL_LAYOUT_TYPE.CREATE}
                          onCreate={(studioId) =>
                            appDispatch({
                              type: APP_ACTION_TYPE.STUDIO_SELECT,
                              selectedStudioId: studioId
                            })
                          }
                        />
                      )
                    })

                    modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })

                    break
                  default:
                    appDispatch({
                      type: APP_ACTION_TYPE.STUDIO_SELECT,
                      selectedStudioId:
                        selection === 'undefined' ? undefined : selection
                    })
                    break
                }
              }}
              value={app.selectedStudioId || 'undefined'}
            >
              <option value="undefined">--- Select Studio ---</option>
              {studios.map((studio) => (
                <option value={studio.id} key={studio.id}>
                  {studio.title} | {studio.games.length} Games
                </option>
              ))}
              <option value="create">--- Create Studio ---</option>
            </select>
          </>
        )}
      </div>
      <hr />
    </>
  )
}

export default StudioSelect
