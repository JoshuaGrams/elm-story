import logger from '../../../lib/logger'

import React, { useEffect, useRef, useState } from 'react'

import styles from './styles.module.less'

const ContextMenu: React.FC<{
  trigger: string
  forceHide: boolean
}> = ({ trigger, forceHide }) => {
  const menuRef = useRef<HTMLDivElement>(null)

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

      const parentRect = parentElement?.getBoundingClientRect(),
        menuRect = menuRef.current?.getBoundingClientRect()

      if (menuRect && parentRect)
        setPostion({
          x:
            event.offsetX + menuRect.width > parentRect.width
              ? event.clientX - menuRect.width
              : event.clientX,
          y:
            event.offsetY + menuRect.height > parentRect.height
              ? event.clientY - menuRect.height
              : event.clientY
        })

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
    if (visible && forceHide) hideContextMenu()
  }, [forceHide])

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
      ref={menuRef}
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
