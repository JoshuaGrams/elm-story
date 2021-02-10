import { ipcRenderer } from 'electron'
import React from 'react'

import { useSelectedProfile } from '../../hooks/useProfiles'

import { WINDOW_EVENTS } from '../../lib/events'

import styles from './styles.module.scss'

import Button, { ButtonProps } from '../Button'

interface AppMenuRowProps extends ButtonProps {
  title: string
}

const MenuRow = ({ title, onClick, destroy = false }: AppMenuRowProps) => {
  return (
    <Button className={styles.row} onClick={onClick} destroy={destroy}>
      {title}
    </Button>
  )
}

const MenuRowSpacer = () => {
  return <div className={styles.spacer} />
}

interface AppMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
}

export default ({ open = false, className }: AppMenuProps) => {
  const [selectedProfile] = useSelectedProfile()

  return (
    <>
      {open && (
        <div className={`${styles.appMenu} ${className}`}>
          <MenuRow title="Create Profile..." />
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
