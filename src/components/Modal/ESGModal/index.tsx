import { ipcRenderer } from 'electron'

import React, { useContext } from 'react'

import { WINDOW_EVENT_TYPE } from '../../../lib/events'

import { AppContext } from '../../../contexts/AppContext'

import { Modal } from 'antd'

import ESGBanner from './ESGBanner'
import SocialIcon from './SocialIcon'

import styles from './styles.module.less'

const ESGModal: React.FC<{ visible: boolean; onCancel: () => void }> = ({
  visible = false,
  onCancel
}) => {
  const { app } = useContext(AppContext)

  return (
    <Modal
      visible={visible}
      destroyOnClose
      centered
      onCancel={onCancel}
      footer={null}
      className={styles.ESGModal}
    >
      <div>
        <div className={styles.ESGBanner}>
          <ESGBanner />
        </div>

        <div className={styles.content}>
          <div className={styles.version}>
            <div>
              <span className={styles.versionHeader}>Elm Story Version</span>{' '}
              {app.version} (Alpha M2)
            </div>
            <div>
              <span className={styles.versionHeader}>Elm Story Build</span>{' '}
              {app.build}
            </div>
          </div>

          <ul className={styles.socialLinks}>
            <li
              onClick={() =>
                ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                  'https://patreon.com/ElmStoryGames'
                ])
              }
            >
              <SocialIcon type="patreon" />
            </li>
            <li
              onClick={() =>
                ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                  'https://twitter.com/ElmStoryGames'
                ])
              }
            >
              <SocialIcon type="twitter" />
            </li>
            <li
              onClick={() =>
                ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                  'https://elmstorygames.itch.io'
                ])
              }
            >
              <SocialIcon type="itch" />
            </li>
            <li
              onClick={() =>
                ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                  'https://reddit.com/r/ElmStoryGames'
                ])
              }
            >
              <SocialIcon type="reddit" />
            </li>
            <li
              onClick={() =>
                ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                  'https://twitch.tv/ElmStoryGames'
                ])
              }
            >
              <SocialIcon type="twitch" />
            </li>
            <li
              onClick={() =>
                ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                  'https://youtube.com/channel/UCkc_XSTzMxOAb-hMCeWoUyQ'
                ])
              }
            >
              <SocialIcon type="youtube" />
            </li>
          </ul>
        </div>

        <div className={styles.copyright}>
          <span
            className={styles.siteLink}
            onClick={() =>
              ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                'https://elmstory.com'
              ])
            }
          >
            elmstory.com
          </span>{' '}
          | &copy; 2021 Elm Story Games LLC |{' '}
          <span
            className={styles.siteLink}
            onClick={() =>
              ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                'https://elmstory.com/license'
              ])
            }
          >
            License
          </span>
        </div>
      </div>
    </Modal>
  )
}

export default ESGModal
