import { ipcRenderer } from 'electron'

import React, { useContext, useState, useEffect } from 'react'

import getWorldDataJSON from '../../lib/getWorldDataJSON'

import { World, WORLD_EXPORT_TYPE } from '../../data/types'
import { StudioId } from '../../lib/transport/types/0.5.1'
import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { AppContext } from '../../contexts/AppContext'

import { Dropdown, Menu } from 'antd'
import { QuestionCircleFilled } from '@ant-design/icons'
import { ExportWorldModal } from '../Modal'

import styles from './styles.module.less'

const HelpButton: React.FC<{ type: WORLD_EXPORT_TYPE }> = ({ type }) => {
  const openHelp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation()

    let helpUrl

    switch (type) {
      case WORLD_EXPORT_TYPE.JSON:
        helpUrl = 'https://docs.elmstory.com/guides/data/json/overview/'
        break
      case WORLD_EXPORT_TYPE.PWA:
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
    title: 'Gathering storyworld data...',
    visible: false
  })

  async function exportWorld(type: WORLD_EXPORT_TYPE) {
    if (world.id) {
      setExportWorldModal({ ...exportWorldModal, visible: true })

      const worldDataAsString = await getWorldDataJSON(
        studioId,
        world.id,
        app.version
      )

      setTimeout(() => {
        ipcRenderer.invoke(WINDOW_EVENT_TYPE.EXPORT_WORLD_START, {
          type,
          data: worldDataAsString
        })

        setExportWorldModal({ ...exportWorldModal, visible: false })
      }, 1000)
    }
  }

  useEffect(() => {
    ipcRenderer.on(WINDOW_EVENT_TYPE.EXPORT_WORLD_PROCESSING, () => {
      setExportWorldModal({
        title: 'Compiling storyworld data...',
        visible: true
      })
    })

    ipcRenderer.on(WINDOW_EVENT_TYPE.EXPORT_WORLD_COMPLETE, () => {
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
            <Menu.Item onClick={() => exportWorld(WORLD_EXPORT_TYPE.JSON)}>
              Export JSON <HelpButton type={WORLD_EXPORT_TYPE.JSON} />
            </Menu.Item>
            <Menu.Item onClick={() => exportWorld(WORLD_EXPORT_TYPE.PWA)}>
              Export PWA <HelpButton type={WORLD_EXPORT_TYPE.PWA} />
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
