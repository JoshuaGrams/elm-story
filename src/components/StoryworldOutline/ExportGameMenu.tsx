import { ipcRenderer } from 'electron'

import React, { useContext, useState, useEffect } from 'react'

import getGameDataJSON from '../../lib/getGameDataJSON'

import { World } from '../../data/types'
import { StudioId } from '../../lib/transport/types/0.5.1'
import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { AppContext } from '../../contexts/AppContext'

import { Dropdown, Menu } from 'antd'
import { QuestionCircleFilled } from '@ant-design/icons'
import { ExportGameModal } from '../Modal'

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

const ExportGameMenu: React.FC<{ studioId: StudioId; game: World }> = ({
  children,
  studioId,
  game
}) => {
  const { app } = useContext(AppContext)

  const [exportGameModal, setExportGameModal] = useState({
    title: 'Gathering game data...',
    visible: false
  })

  async function exportGame(jsonOnly?: boolean) {
    if (game.id) {
      setExportGameModal({ ...exportGameModal, visible: true })

      const json = await getGameDataJSON(studioId, game.id, app.version)

      if (jsonOnly) {
        const element = document.createElement('a'),
          file = new Blob([json], { type: 'text/json' })

        element.href = URL.createObjectURL(file)
        element.download = `${game.title.trim()}.json`

        setTimeout(() => {
          element.click()

          setExportGameModal({ ...exportGameModal, visible: false })
        }, 1000)
      }

      if (!jsonOnly) {
        setTimeout(() => {
          ipcRenderer.send(WINDOW_EVENT_TYPE.EXPORT_GAME_START, json)

          setExportGameModal({ ...exportGameModal, visible: false })
        }, 1000)
      }
    }
  }

  useEffect(() => {
    ipcRenderer.on(WINDOW_EVENT_TYPE.EXPORT_GAME_PROCESSING, () => {
      setExportGameModal({ title: 'Compiling game...', visible: true })
    })

    ipcRenderer.on(WINDOW_EVENT_TYPE.EXPORT_GAME_COMPLETE, () => {
      setExportGameModal({ ...exportGameModal, visible: false })
    })
  }, [])

  return (
    <>
      <ExportGameModal
        title={exportGameModal.title}
        visible={exportGameModal.visible}
      />

      <Dropdown
        overlay={
          <Menu onClick={(event) => event.domEvent.stopPropagation()}>
            <Menu.Item onClick={() => exportGame(true)}>
              Export JSON <HelpButton type="JSON" />
            </Menu.Item>
            <Menu.Item onClick={() => exportGame()}>
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

ExportGameMenu.displayName = 'ExportGameMenu'

export default ExportGameMenu
