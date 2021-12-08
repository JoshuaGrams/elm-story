import React, { useContext, useEffect, useState } from 'react'

import { Studio } from '../../data/types'

import { useStudios } from '../../hooks'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import { Button, Select } from 'antd'
import { EditOutlined } from '@ant-design/icons'

import { SaveStudioModal } from '../Modal'

import styles from './styles.module.less'

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
          setTimeout(
            () =>
              appDispatch({
                type: APP_ACTION_TYPE.STUDIO_SELECT,
                selectedStudioId: studioId
              }),
            100
          )
        }
        onRemove={() => {
          appDispatch({
            type: APP_ACTION_TYPE.STUDIO_SELECT,
            selectedStudioId: undefined
          })

          setSaveStudioModal({ visible: false, edit: false })
        }}
      />

      <div className={`${styles.StudioList} ${className}`}>
        {studios && (
          <>
            <Select
              style={{ width: '100%', textAlign: 'center' }}
              placeholder="Select studio..."
              value={app.selectedStudioId}
              dropdownRender={(menu) => (
                <div>
                  {menu}

                  <Button
                    type="primary"
                    style={{
                      width: '100%',
                      marginTop: studios.length > 0 ? '6px' : '0px',
                      borderTopLeftRadius: '0 !important',
                      borderTopRightRadius: 0
                    }}
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
              {studios.map(
                (studio) =>
                  studio.id &&
                  studio.title && (
                    <Option
                      style={{ textAlign: 'center' }}
                      value={studio.id}
                      key={studio.id}
                    >
                      {studio.title}{' '}
                      <span style={{ color: `hsl(0, 0%, 40%)` }}>|</span>{' '}
                      {`${studio.worlds.length} ${
                        studio.worlds.length === 1 ? 'world' : 'worlds'
                      }`}
                    </Option>
                  )
              )}
            </Select>
            {app.selectedStudioId && (
              <Button
                type="primary"
                style={{ marginRight: 6, borderRadius: 2 }}
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
