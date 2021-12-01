import { ipcRenderer } from 'electron'

import React, { useContext, useState, useEffect } from 'react'

import getGameDataJSON from '../../lib/getGameDataJSON'

import { World } from '../../data/types'
import { StudioId } from '../../lib/transport/types/0.5.1'
import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { AppContext } from '../../contexts/AppContext'

import { Dropdown, Menu } from 'antd'
import { QuestionCircleFilled } from '@ant-design/icons'
import { ExportWorldModal } from '../Modal'

import styles from './styles.module.less'

const HelpButton: React.FC<{ type: 'JSON' | 'PWA' }> = ({ type }) => {
  const openHelp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation()

    let helpUrl

    switch (type) {
      case 'JSON':
        helpUrl = 'https://docs.elmstory.com/guides/data/json/overview/'
        break
      case 'PWA':
        helpUrl = 'https://docs.elmstory.com/guides/data/pwa/overview/'
        break
      default:
        helpUrl = 'https://docs.elmstory.com'
    }

    ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [helpUrl])
  }

  return (
    <div className={styles.HelpButton} onClick={openHelp}>
      <QuestionCircleFilled />
    </div>
  )
}

const ExportWorldMenu: React.FC<{ studioId: StudioId; world: World }> = ({
  children,
  studioId,
  world
}) => {
  const { app } = useContext(AppContext)

  const [exportWorldModal, setExportWorldModal] = useState({
    title: 'Gathering world data...',
    visible: false
  })

  async function exportWorld(jsonOnly?: boolean) {
    if (world.id) {
      setExportWorldModal({ ...exportWorldModal, visible: true })

      const json = await getGameDataJSON(studioId, world.id, app.version)

      if (jsonOnly) {
        const element = document.createElement('a'),
          file = new Blob([json], { type: 'text/json' })

        element.href = URL.createObjectURL(file)
        element.download = `${world.title.trim()}.json`

        setTimeout(() => {
          element.click()

          setExportWorldModal({ ...exportWorldModal, visible: false })
        }, 1000)
      }

      if (!jsonOnly) {
        setTimeout(() => {
          ipcRenderer.send(WINDOW_EVENT_TYPE.EXPORT_GAME_START, json)

          setExportWorldModal({ ...exportWorldModal, visible: false })
        }, 1000)
      }
    }
  }

  useEffect(() => {
    ipcRenderer.on(WINDOW_EVENT_TYPE.EXPORT_GAME_PROCESSING, () => {
      setExportWorldModal({ title: 'Compiling game...', visible: true })
    })

    ipcRenderer.on(WINDOW_EVENT_TYPE.EXPORT_GAME_COMPLETE, () => {
      setExportWorldModal({ ...exportWorldModal, visible: false })
    })
  }, [])

  return (
    <>
      <ExportWorldModal
        title={exportWorldModal.title}
        visible={exportWorldModal.visible}
      />

      <Dropdown
        overlay={
          <Menu onClick={(event) => event.domEvent.stopPropagation()}>
            <Menu.Item onClick={() => exportWorld(true)}>
              Export JSON <HelpButton type="JSON" />
            </Menu.Item>
            <Menu.Item onClick={() => exportWorld()}>
              Export PWA <HelpButton type="PWA" />
            </Menu.Item>
          </Menu>
        }
        trigger={['click']}
      >
        {children}
      </Dropdown>
    </>
  )
}

ExportWorldMenu.displayName = 'ExportWorldMenu'

export default ExportWorldMenu
