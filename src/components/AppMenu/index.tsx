import { ipcRenderer } from 'electron'
import React, { useContext } from 'react'

import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { useSelectedProfile } from '../../hooks/useProfiles'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'
import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import Button, { ButtonProps } from '../Button'

import styles from './styles.module.scss'

import ProfileModalLayout, {
  PROFILE_MODAL_LAYOUT_TYPE
} from '../../layouts/ProfileModal'

interface AppMenuRowProps extends ButtonProps {
  title: string
}

const MenuRow: React.FC<AppMenuRowProps> = ({
  title,
  onClick,
  destroy = false
}) => {
  return (
    <Button className={styles.row} onClick={onClick} destroy={destroy}>
      {title}
    </Button>
  )
}

const MenuRowSpacer: React.FC = () => {
  return <div className={styles.spacer} />
}

const AppMenu: React.FC<{ className: string }> = ({ className }) => {
  const { app, appDispatch } = useContext(AppContext)
  const { modalDispatch } = useContext(ModalContext)
  const [selectedProfile] = useSelectedProfile()

  return (
    <>
      {app.menuOpen && (
        <div className={`${styles.appMenu} ${className}`}>
          <MenuRow
            title="Create Profile..."
            onClick={() => {
              appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

              modalDispatch({
                type: MODAL_ACTION_TYPE.LAYOUT,
                layout: (
                  <ProfileModalLayout type={PROFILE_MODAL_LAYOUT_TYPE.CREATE} />
                )
              })

              modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
            }}
          />
          {selectedProfile && selectedProfile.name && (
            <MenuRow
              title={`Selected profile: ${selectedProfile?.name}`}
              onClick={() => {
                appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

                modalDispatch({
                  type: MODAL_ACTION_TYPE.LAYOUT,
                  layout: (
                    <ProfileModalLayout
                      type={PROFILE_MODAL_LAYOUT_TYPE.EDIT}
                      profile={selectedProfile}
                    />
                  )
                })

                modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
              }}
            />
          )}

          <MenuRowSpacer />

          <MenuRow title="Create Game..." />

          <MenuRowSpacer />

          <MenuRow
            title="Quit"
            destroy
            onClick={() => ipcRenderer.send(WINDOW_EVENT_TYPE.QUIT)}
          />
        </div>
      )}
    </>
  )
}

export default AppMenu
