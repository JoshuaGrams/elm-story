import React, { useContext } from 'react'

import { useStudios } from '../../hooks'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'
import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import Button from '../Button'

import StudioModalLayout, {
  STUDIO_MODAL_LAYOUT_TYPE
} from '../../layouts/StudioModal'

import styles from './styles.module.scss'

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
    <div className={`${styles.studioList} ${className}`}>
      <h3>Studios</h3>
      {studios.length > 0 && (
        <>
          <select
            onChange={(event) => {
              appDispatch({
                type: APP_ACTION_TYPE.STUDIO_SELECT,
                selectedStudioId:
                  event.target.value === 'undefined'
                    ? undefined
                    : event.target.value
              })
            }}
            value={app.selectedStudioId || 'undefined'}
          >
            <option value="undefined">--- Select Studio ---</option>
            {studios.map((studio) => (
              <option value={studio.id} key={studio.id}>
                {studio.title} | {studio.games.length} Games
              </option>
            ))}
          </select>

          {app.selectedStudioId && (
            <>
              <hr />

              <div className={styles.buttonBar}>
                {/* Edit studio button */}
                <Button
                  onClick={() => {
                    modalDispatch({
                      type: MODAL_ACTION_TYPE.LAYOUT,
                      layout: (
                        <StudioModalLayout
                          type={STUDIO_MODAL_LAYOUT_TYPE.EDIT}
                          studio={
                            studios.filter(
                              (studio) => studio.id === app.selectedStudioId
                            )[0]
                          }
                        />
                      )
                    })

                    modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
                  }}
                >
                  Edit
                </Button>

                {/* Remove studio button */}
                <Button
                  onClick={() => {
                    modalDispatch({
                      type: MODAL_ACTION_TYPE.LAYOUT,
                      layout: (
                        <StudioModalLayout
                          type={STUDIO_MODAL_LAYOUT_TYPE.REMOVE}
                          studio={
                            studios.filter(
                              (studio) => studio.id === app.selectedStudioId
                            )[0]
                          }
                          onRemove={() =>
                            appDispatch({
                              type: APP_ACTION_TYPE.STUDIO_SELECT,
                              selectedStudioId: undefined
                            })
                          }
                        />
                      )
                    })

                    modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
                  }}
                  destroy
                >
                  Remove
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default StudioSelect
