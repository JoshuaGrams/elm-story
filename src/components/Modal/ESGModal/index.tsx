import { ipcRenderer } from 'electron'

import React, { useContext } from 'react'

import { WINDOW_EVENT_TYPE } from '../../../lib/events'

import { AppContext } from '../../../contexts/AppContext'

import { Modal, Tooltip } from 'antd'

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
              {app.version} (Early Access)
            </div>
            <div>
              <span className={styles.versionHeader}>Elm Story Build</span>{' '}
              {app.build}
            </div>
          </div>

          <ul className={styles.socialLinks}>
            <Tooltip title="Patreon &mdash; join to support the future of Elm Story and access dev chat">
              <li
                onClick={() =>
                  ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                    'https://patreon.com/ElmStoryGames'
                  ])
                }
              >
                <SocialIcon type="patreon" />
              </li>
            </Tooltip>

            <Tooltip title="Twitter &mdash; follow the latest updates on Elm Story development">
              <li
                onClick={() =>
                  ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                    'https://twitter.com/ElmStoryGames'
                  ])
                }
              >
                <SocialIcon type="twitter" />
              </li>
            </Tooltip>

            <Tooltip title="Itch.io &mdash; read the devlog and add Elm Story to your collection for app updates">
              <li
                onClick={() =>
                  ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                    'https://elmstorygames.itch.io'
                  ])
                }
              >
                <SocialIcon type="itch" />
              </li>
            </Tooltip>

            <Tooltip title="Reddit &mdash; get Elm Story app support and contribute feedback and ideas">
              <li
                onClick={() =>
                  ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                    'https://reddit.com/r/ElmStoryGames'
                  ])
                }
              >
                <SocialIcon type="reddit" />
              </li>
            </Tooltip>

            <Tooltip title="Twitch &mdash; watch development livestreams">
              <li
                onClick={() =>
                  ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                    'https://twitch.tv/ElmStoryGames'
                  ])
                }
              >
                <SocialIcon type="twitch" />
              </li>
            </Tooltip>

            <Tooltip title="YouTube &mdash; watch Elm Story tutorials">
              <li
                onClick={() =>
                  ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                    'https://youtube.com/channel/UCkc_XSTzMxOAb-hMCeWoUyQ'
                  ])
                }
              >
                <SocialIcon type="youtube" />
              </li>
            </Tooltip>
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
