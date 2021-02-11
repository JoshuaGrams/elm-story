import { ipcRenderer } from 'electron'
import React, { useState, useContext } from 'react'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import { useSelectedProfile } from '../../hooks/useProfiles'

import { WINDOW_EVENTS } from '../../lib/events'

import styles from './styles.module.scss'

import Button, { ButtonProps } from '../Button'

import Modal from '../Modal'
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
  const [profileModelOpen, setProfileModalOpen] = useState(false)
  const [selectedProfile] = useSelectedProfile()

  return (
    <>
      <Modal open={profileModelOpen} onClose={() => setProfileModalOpen(false)}>
        <ProfileModalLayout type={PROFILE_MODAL_LAYOUT_TYPE.CREATE} />
      </Modal>

      {app.menuOpen && (
        <div className={`${styles.appMenu} ${className}`}>
          <MenuRow
            title="Create Profile..."
            onClick={() => {
              appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })
              setProfileModalOpen(true)
            }}
          />
          {selectedProfile && selectedProfile.name && (
            <MenuRow title={`Selected profile: ${selectedProfile?.name}`} />
          )}

          <MenuRowSpacer />

          <MenuRow title="Create Game..." />

          <MenuRowSpacer />

          <MenuRow
            title="Quit"
            destroy
            onClick={() => ipcRenderer.send(WINDOW_EVENTS.QUIT)}
          />
        </div>
      )}
    </>
  )
}

export default AppMenu
