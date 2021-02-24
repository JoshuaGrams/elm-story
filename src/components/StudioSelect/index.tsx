import React, { useContext, useState } from 'react'

import { useStudios } from '../../hooks'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import { Button, Divider, Select } from 'antd'

import { SaveStudioModal } from '../Modal'

import styles from './styles.module.less'

type StudioSelectProps = {
  className?: string
}

const StudioSelect: React.FC<StudioSelectProps> = ({
  className = ''
}: StudioSelectProps) => {
  const studios = useStudios()

  const { app, appDispatch } = useContext(AppContext)

  const { Option } = Select

  const [saveStudioModalVisible, setSaveStudioModalVisible] = useState(false)

  return (
    <>
      <SaveStudioModal
        visible={saveStudioModalVisible}
        onCancel={() => setSaveStudioModalVisible(false)}
        afterClose={() => setSaveStudioModalVisible(false)}
        onSave={(studioId) =>
          appDispatch({
            type: APP_ACTION_TYPE.STUDIO_SELECT,
            selectedStudioId: studioId
          })
        }
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
                  <Divider />
                  <Button
                    style={{ width: '100%' }}
                    onClick={() => setSaveStudioModalVisible(true)}
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
