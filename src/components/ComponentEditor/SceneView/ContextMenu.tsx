import logger from '../../../lib/logger'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ComponentId } from '../../../data/types'

import { Menu } from 'antd'

import styles from './styles.module.less'

interface MenuItemReturnData {
  clickPosition: {
    x: number
    y: number
  }
  componentId: ComponentId | null
}

const CONTEXT_MENU_CLASS_NAME = 'sv-cm',
  MENU_ITEM_CLASS_NAME = 'sv-cm-item',
  COMPONENT_ID_ATTRIBUTE_NAME = 'data-component-id'

const ContextMenu: React.FC<{
  trigger: string
  features: {
    className: string
    items: [
      ((componentId: string | null) => string) | string,
      (featureReturn: MenuItemReturnData) => void
    ][]
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
    }),
    [byComponentId, setByComponentId] = useState<ComponentId | null>(null)

  const whitelistByClassName = features.map((feature) => feature.className)

  const showContextMenu = useCallback(
    (event: MouseEvent) => {
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

        setMenuContents(
          features
            .find((feature) => feature.className === targetElement.className)
            ?.items.map((item, index) => {
              return (
                <Menu.Item
                  key={`${targetElement.className},${index}`}
                  className={`${MENU_ITEM_CLASS_NAME} ant-dropdown-menu-item`}
                >
                  {' '}
                  {typeof item[0] === 'function'
                    ? item[0](
                        targetElement.getAttribute(COMPONENT_ID_ATTRIBUTE_NAME)
                      )
                    : item[0]}
                </Menu.Item>
              )
            })
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

        setClickPosition({ x: event.offsetX, y: event.offsetY })
        setByComponentId(
          targetElement.getAttribute(COMPONENT_ID_ATTRIBUTE_NAME)
        )

        setMenuVisible(true)
      }
    },
    [features]
  )

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
      isVisible && logger.info('SceneView->hideContextMenu->not visible')

      return false
    })

    setMenuContents(undefined)
    setClickPosition({ x: 0, y: 0 })
    setByComponentId(null)
  }

  useEffect(() => {
    if (menuVisible && forceHide) hideContextMenu()
  }, [forceHide])

  useEffect(() => {
    document.addEventListener('contextmenu', showContextMenu)
    document.addEventListener('click', hideContextMenu)
    document.addEventListener('mousedown', hideContextMenu)

    return () => {
      document.removeEventListener('contextmenu', showContextMenu)
      document.removeEventListener('click', hideContextMenu)
      document.removeEventListener('mousedown', hideContextMenu)
    }
  })

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
            foundFeature.items[parseInt(keyParts[1])][1]({
              clickPosition: {
                x: clickPosition.x,
                y: clickPosition.y
              },
              componentId: byComponentId
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
