import { ipcRenderer } from 'electron'

import React, { useContext, useState, useEffect } from 'react'

import getGameDataJSON from '../../lib/getGameDataJSON'

import { Game } from '../../data/types'
import { StudioId } from '../../lib/transport/types/0.5.0'
import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { AppContext } from '../../contexts/AppContext'

import { Dropdown, Menu } from 'antd'
import { ExportGameModal } from '../Modal'

const ExportGameMenu: React.FC<{ studioId: StudioId; game: Game }> = ({
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
            <Menu.Item onClick={() => exportGame(true)}>JSON</Menu.Item>
            <Menu.Item onClick={() => exportGame()}>Web App</Menu.Item>
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
