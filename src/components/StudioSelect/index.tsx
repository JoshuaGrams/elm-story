import React, { useContext, useEffect, useState } from 'react'

import { useStudios } from '../../hooks'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import { Button, Divider, Select } from 'antd'
import { EditOutlined } from '@ant-design/icons'

import { SaveStudioModal } from '../Modal'

import styles from './styles.module.less'
import { Studio } from '../../data/types'

type StudioSelectProps = {
  className?: string
}

const StudioSelect: React.FC<StudioSelectProps> = ({
  className = ''
}: StudioSelectProps) => {
  const { app, appDispatch } = useContext(AppContext)

  const studios = useStudios([app.selectedStudioId])

  const { Option } = Select

  const [selectedStudio, setSelectedStudio] = useState<Studio | undefined>(
      undefined
    ),
    [saveStudioModal, setSaveStudioModal] = useState({
      visible: false,
      edit: false
    })

  useEffect(() => {
    if (studios) {
      setSelectedStudio(
        app.selectedStudioId
          ? studios.filter((studio) => studio.id === app.selectedStudioId)[0]
          : undefined
      )
    }
  }, [studios, app.selectedStudioId])

  return (
    <>
      <SaveStudioModal
        visible={saveStudioModal.visible}
        onCancel={() => setSaveStudioModal({ visible: false, edit: false })}
        afterClose={() => setSaveStudioModal({ visible: false, edit: false })}
        studio={selectedStudio}
        edit={saveStudioModal.edit}
        onSave={(studioId) =>
          appDispatch({
            type: APP_ACTION_TYPE.STUDIO_SELECT,
            selectedStudioId: studioId
          })
        }
        onRemove={() => {
          appDispatch({
            type: APP_ACTION_TYPE.STUDIO_SELECT,
            selectedStudioId: undefined
          })

          setSaveStudioModal({ visible: false, edit: false })
        }}
      />

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

                  <Button
                    type="primary"
                    style={{ width: '100%' }}
                    onClick={() =>
                      setSaveStudioModal({ visible: true, edit: false })
                    }
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
            {app.selectedStudioId && (
              <Button
                type="primary"
                onClick={() =>
                  setSaveStudioModal({ visible: true, edit: true })
                }
              >
                <EditOutlined />
              </Button>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default StudioSelect
