import React, { useContext } from 'react'

import { useStudios } from '../../hooks'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'
import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import StudioModalLayout, {
  STUDIO_MODAL_LAYOUT_TYPE
} from '../../layouts/StudioModal'

import { Button, Divider, Select } from 'antd'

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

  const { Option } = Select

  return (
    <>
      <div className={`${styles.studioList} ${className}`}>
        {studios && (
          <>
            <Select
              style={{ width: '100%', textAlign: 'center' }}
              placeholder="Select studio..."
              value={app.selectedStudioId || undefined}
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider />
                  <Button
                    style={{ width: '100%' }}
                    onClick={() => {
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
                    }}
                  >
                    Create Studio...
                  </Button>
                </div>
              )}
              onSelect={(selectedStudioId: string) => {
                appDispatch({
                  type: APP_ACTION_TYPE.STUDIO_SELECT,
                  selectedStudioId
                })
              }}
            >
              {studios.map((studio) => (
                <Option
                  style={{ textAlign: 'center' }}
                  value={`${studio.id}`}
                  key={studio.id}
                >
                  {studio.title} | {studio.games.length} Games
                </Option>
              ))}
            </Select>
          </>
        )}
      </div>
    </>
  )
}

export default StudioSelect
