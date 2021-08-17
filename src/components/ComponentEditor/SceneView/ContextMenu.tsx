import logger from '../../../lib/logger'

import React, { useEffect, useState } from 'react'

import styles from './styles.module.less'

const ContextMenu: React.FC<{
  trigger: string
}> = ({ trigger }) => {
  const [visible, setVisible] = useState(false),
    [position, setPostion] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  function showContextMenu(event: MouseEvent) {
    const parentElement = document.getElementById(trigger),
      targetElement = event.target as Element,
      triggered = parentElement?.contains(targetElement)

    if (triggered) {
      logger.info('SceneView->showContextMenu->visible')

      document.addEventListener('click', hideContextMenu)
      document.addEventListener('mousedown', hideContextMenu)

      setPostion({ x: event.clientX, y: event.clientY })
      setVisible(true)
    }
  }

  function hideContextMenu() {
    setVisible((isVisible: boolean) => {
      if (isVisible) {
        logger.info('SceneView->hideContextMenu->not visible')

        document.removeEventListener('click', hideContextMenu)
        document.removeEventListener('mousedown', hideContextMenu)
      }

      return false
    })
  }

  useEffect(() => {
    document.addEventListener('contextmenu', showContextMenu)

    return () => {
      document.removeEventListener('contextmenu', showContextMenu)
      document.removeEventListener('click', hideContextMenu)
      document.removeEventListener('mousedown', hideContextMenu)
    }
  }, [])

  return (
    <div
      className={styles.ContextMenu}
      style={{
        opacity: visible ? 1.0 : 0.0,
        left: position.x,
        top: position.y
      }}
    >
      Scene View Context Menu
    </div>
  )
}

export default ContextMenu
