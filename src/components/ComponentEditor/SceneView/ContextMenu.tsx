import logger from '../../../lib/logger'

import React, { useEffect, useRef, useState } from 'react'

import { Menu } from 'antd'

import styles from './styles.module.less'

interface FeatureReturn {
  clickPosition: {
    x: number
    y: number
  }
}

const CONTEXT_MENU_CLASS_NAME = 'sv-cm',
  MENU_ITEM_CLASS_NAME = 'sv-cm-item'

const ContextMenu: React.FC<{
  trigger: string
  features: {
    className: string
    items: [string, (featureReturn: FeatureReturn) => void][]
  }[]
  forceHide: boolean
}> = ({ trigger, features, forceHide }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  const [menuVisible, setMenuVisible] = useState(false),
    [menuContents, setMenuContents] = useState<JSX.Element[] | undefined>(
      undefined
    ),
    [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0
    }),
    [clickPosition, setClickPosition] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0
    })

  const whitelistByClassName = features.map((feature) => feature.className)

  function showContextMenu(event: MouseEvent) {
    const parentElement = document.getElementById(trigger),
      targetElement = event.target as Element,
      triggered = parentElement?.contains(targetElement)

    if (
      triggered &&
      event
        .composedPath()
        .findIndex((target) =>
          whitelistByClassName.includes((target as Element).className)
        ) !== -1
    ) {
      logger.info('SceneView->showContextMenu->visible')

      document.addEventListener('click', hideContextMenu)
      document.addEventListener('mousedown', hideContextMenu)

      setMenuContents(
        features
          .find((feature) => feature.className === targetElement.className)
          ?.items.map((item, index) => (
            <Menu.Item
              key={`${targetElement.className},${index}`}
              className={`${MENU_ITEM_CLASS_NAME} ant-dropdown-menu-item`}
            >
              {' '}
              {item[0]}
            </Menu.Item>
          ))
      )

      const parentRect = parentElement?.getBoundingClientRect(),
        menuRect = menuRef.current?.getBoundingClientRect()

      if (menuRect && parentRect)
        setMenuPosition({
          x:
            event.offsetX + menuRect.width > parentRect.width
              ? event.clientX - menuRect.width
              : event.clientX,
          y:
            event.offsetY + menuRect.height > parentRect.height
              ? event.clientY - menuRect.height
              : event.clientY
        })

      setMenuVisible(true)
      setClickPosition({ x: event.offsetX, y: event.offsetY })
    }
  }

  function hideContextMenu(event?: MouseEvent) {
    if (
      event &&
      event.composedPath().findIndex((target) => {
        const classList = (target as Element).classList

        return classList && classList.contains(CONTEXT_MENU_CLASS_NAME)
      }) !== -1
    )
      return

    setMenuVisible((isVisible: boolean) => {
      if (isVisible) {
        logger.info('SceneView->hideContextMenu->not visible')

        document.removeEventListener('click', hideContextMenu)
        document.removeEventListener('mousedown', hideContextMenu)
      }

      return false
    })

    setMenuContents(undefined)
    setClickPosition({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (menuVisible && forceHide) hideContextMenu()
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
      className={`ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ${styles.ContextMenu}`}
      style={{
        visibility: menuVisible ? 'visible' : 'hidden',
        left: menuPosition.x,
        top: menuPosition.y
      }}
    >
      <Menu
        className={CONTEXT_MENU_CLASS_NAME}
        selectedKeys={[]}
        onClick={(info) => {
          const keyParts: string[] = (info.key as string).split(','),
            foundFeature = features.find(
              (feature) => feature.className === keyParts[0]
            )

          if (foundFeature) {
            const parentElement = document.getElementById(trigger)

            // TODO: users may want node to drop where menu opened
            // revert to click position
            foundFeature.items[parseInt(keyParts[1])][1]({
              clickPosition: {
                x:
                  info.domEvent.clientX -
                  (parentElement?.getBoundingClientRect().left || 0),
                y:
                  info.domEvent.clientY -
                  (parentElement?.getBoundingClientRect().top || 0)
              }
            })

            hideContextMenu()
          }
        }}
      >
        {menuContents}
      </Menu>
    </div>
  )
}

export default ContextMenu
