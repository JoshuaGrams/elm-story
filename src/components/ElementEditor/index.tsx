import React, { useContext, useEffect, useRef, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import logger from '../../lib/logger'

import {
  ElementId,
  ELEMENT_TYPE,
  World,
  Event,
  Scene,
  StudioId
} from '../../data/types'

import { ComposerContext, COMPOSER_ACTION_TYPE } from '../../contexts/ComposerContext'

import { ReactFlowProvider } from 'react-flow-renderer'

import DockLayout, {
  DropDirection,
  LayoutBase,
  LayoutData,
  PanelData,
  TabData
} from 'rc-dock'

import { find as findBox } from 'rc-dock/lib/Algorithm'

import {
  PartitionOutlined,
  CloseOutlined,
  QuestionOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons'

import TabContent from './TabContent'
import WorldPreview, { StoryworldPreviewTools } from './WorldPreview'
import SceneMap, { SceneMapTools } from './SceneMap'

import styles from './styles.module.less'

import api from '../../api'

function createBaseLayoutData(studioId: StudioId, world: World): LayoutData {
  if (!world.id)
    throw new Error('Unable to create base layout. Missing world ID.')

  return {
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          id: '+0',
          tabs: [
            {
              title: getTabTitle({
                id: world.id,
                title: world.title,
                type: ELEMENT_TYPE.WORLD,
                expanded: true
              }),
              id: world.id,
              content: (
                <TabContent
                  studioId={studioId}
                  id={world.id}
                  type={ELEMENT_TYPE.WORLD}
                  tools={
                    <StoryworldPreviewTools
                      studioId={studioId}
                      worldId={world.id}
                    />
                  }
                  view={<WorldPreview studioId={studioId} worldId={world.id} />}
                />
              ),
              group: 'default',
              cached: true
            }
          ]
        }
      ]
    }
  }
}

function getTabContent(
  studioId: StudioId,
  id: ElementId,
  type: ELEMENT_TYPE | undefined
): JSX.Element {
  switch (type) {
    case ELEMENT_TYPE.SCENE:
      return (
        <TabContent
          studioId={studioId}
          id={id}
          type={type}
          tools={<SceneMapTools studioId={studioId} sceneId={id} />}
          view={
            <ReactFlowProvider>
              <SceneMap studioId={studioId} sceneId={id} />
            </ReactFlowProvider>
          }
        />
      )
    default:
      return <div>Unknown Content</div>
  }
}

function getTabIcon(type: ELEMENT_TYPE | undefined): JSX.Element {
  switch (type) {
    case ELEMENT_TYPE.WORLD:
      return <DeploymentUnitOutlined className={styles.tabIcon} />
    case ELEMENT_TYPE.SCENE:
      return <PartitionOutlined className={styles.tabIcon} />
    default:
      return <QuestionOutlined className={styles.tabIcon} />
  }
}

function getTabTitle(
  element: {
    id?: string | undefined
    expanded?: boolean | undefined
    type?: ELEMENT_TYPE | undefined
    title?: string | undefined
  },
  onClose?: (elementId: ElementId) => void
): JSX.Element {
  return (
    <div className={styles.tabTitle}>
      {getTabIcon(element.type)}
      {element.type === ELEMENT_TYPE.WORLD && (
        <span className={styles.title}>Preview</span>
      )}

      {element.type !== ELEMENT_TYPE.WORLD && (
        <span className={styles.title}>{element.title || 'Unknown Title'}</span>
      )}
      {element.type !== ELEMENT_TYPE.WORLD && (
        <CloseOutlined
          className={styles.tabCloseButton}
          onClick={(event) => {
            event.stopPropagation()
            element.id && onClose && onClose(element.id)
          }}
        />
      )}
    </div>
  )
}

const ElementEditor: React.FC<{ studioId: StudioId; world: World }> = ({
  studioId,
  world
}) => {
  const dockLayout = useRef<DockLayout>(null)

  const [activePanelId, setActivePanelId] = useState<string | undefined>('+0'),
    [activeTabId, setActiveTabId] = useState<ElementId | undefined>(undefined),
    [tabs, setTabs] = useState<
      {
        id?: string | undefined
        expanded?: boolean | undefined
        type?: ELEMENT_TYPE | undefined
        title?: string | undefined
      }[]
    >([
      {
        id: world.id,
        title: world.title,
        type: ELEMENT_TYPE.WORLD,
        expanded: true
      }
    ])

  const { composer: editor, composerDispatch: editorDispatch } = useContext(ComposerContext)

  function onLayoutChange(
    newLayout: LayoutBase,
    changingTabId?: string | undefined,
    direction?: DropDirection | undefined
  ) {
    logger.info(`ElementEditor->onLayoutChange`)

    if (dockLayout.current && changingTabId) {
      const oldLayoutParentPanel = dockLayout.current.find(changingTabId)
          ?.parent as PanelData | undefined,
        newLayoutParentPanel =
          (oldLayoutParentPanel?.id &&
            (findBox(newLayout as LayoutData, oldLayoutParentPanel.id) as
              | PanelData
              | undefined)) ||
          undefined

      // Set active panel ID
      if (oldLayoutParentPanel?.id) {
        const newActivePanelId = newLayoutParentPanel
          ? newLayoutParentPanel.id
          : newLayout.dockbox.children[0].id

        // #58
        const oldActiveTab = document.querySelector(
          `.dock-panel[data-dockid="${activePanelId}"] .dock-tab-active ~ .dock-ink-bar`
        ) as HTMLDivElement | null

        let newActiveTab: HTMLDivElement | null

        if (activePanelId !== newActivePanelId && oldActiveTab) {
          oldActiveTab.style.background = 'var(--highlight-color-dark)'
        }

        logger.info(`setting active panel to '${newActivePanelId}'`)

        // #TODO: stack hack
        setTimeout(() => {
          newActiveTab = document.querySelector(
            `.dock-panel[data-dockid="${newActivePanelId}"] .dock-tab-active ~ .dock-ink-bar`
          ) as HTMLDivElement | null

          if (newActiveTab) {
            newActiveTab.style.background = 'var(--highlight-color)'
          }
        }, 100)

        setActivePanelId(newActivePanelId)
      }

      const clonedTabs = cloneDeep(tabs),
        clonedTabIndex = clonedTabs.findIndex(
          (clonedTab) => clonedTab.id === changingTabId
        )

      // Removing tab
      if (
        direction === 'remove' &&
        changingTabId === editor.selectedWorldOutlineElement.id
      ) {
        logger.info(`Removing tab`)

        if (clonedTabIndex !== -1) {
          clonedTabs.splice(clonedTabIndex, 1)
        }

        setTabs(clonedTabs)

        editor.selectedSceneMapEvent &&
          editorDispatch({
            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
            selectedSceneMapEvent: null
          })

        editor.selectedSceneMapJump &&
          editorDispatch({
            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
            selectedSceneMapJump: null
          })

        const removedTabIndex =
            oldLayoutParentPanel?.tabs.findIndex(
              (tab) => tab.id === changingTabId
            ) || 0,
          tabToSelectId =
            newLayoutParentPanel?.tabs[
              removedTabIndex > 0 ? removedTabIndex - 1 : 0
            ].id,
          tabToSelect =
            (tabToSelectId &&
              clonedTabs.find((clonedTab) => clonedTab.id === tabToSelectId)) ||
            undefined

        editorDispatch({
          type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
          selectedWorldOutlineElement: {
            id: tabToSelect?.id || world.id,
            expanded: true,
            title: tabToSelect?.title || world.title,
            type: tabToSelect?.type || ELEMENT_TYPE.WORLD
          }
        })
      }

      // Not removing tab
      if (
        direction !== 'remove' &&
        changingTabId !== editor.selectedWorldOutlineElement.id &&
        !editor.renamedElement.id
      ) {
        logger.info(`Not removing tab`)

        // Keep the event selected in WorldOutline
        // if (editor.selectedWorldOutlineElement.type !== ELEMENT_TYPE.EVENT)
        editorDispatch({
          type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
          selectedWorldOutlineElement:
            clonedTabIndex !== -1 ? cloneDeep(tabs[clonedTabIndex]) : {}
        })

        // #305
        if (
          clonedTabIndex !== -1 &&
          tabs[clonedTabIndex].type === ELEMENT_TYPE.WORLD &&
          editor.selectedSceneMapEvent
        )
          editorDispatch({
            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
            selectedSceneMapEvent: null
          })
      }

      if (editor.renamedElement.id) {
        editorDispatch({
          type: COMPOSER_ACTION_TYPE.ELEMENT_RENAME,
          renamedElement: {}
        })
      }
    }
  }

  useEffect(() => {
    const selectedElement = editor.selectedWorldOutlineElement

    async function findTabAndOpen() {
      if (dockLayout.current && selectedElement.id && activePanelId) {
        const event: Event | null =
            selectedElement.type === ELEMENT_TYPE.EVENT
              ? await api().events.getEvent(studioId, selectedElement.id)
              : null,
          sceneFromEvent: Scene | null = event
            ? await api().scenes.getScene(studioId, event.sceneId)
            : null

        const foundTab = dockLayout.current.find(
          sceneFromEvent && sceneFromEvent.id
            ? sceneFromEvent.id
            : selectedElement.id
        ) as TabData

        if (!foundTab && selectedElement.type !== ELEMENT_TYPE.FOLDER) {
          dockLayout.current.dockMove(
            {
              title: getTabTitle(
                sceneFromEvent
                  ? {
                      id: sceneFromEvent.id,
                      expanded: true,
                      title: sceneFromEvent.title,
                      type: ELEMENT_TYPE.SCENE
                    }
                  : selectedElement,
                (componentId: ElementId) => {
                  const tabToRemove = dockLayout.current?.find(componentId) as
                    | TabData
                    | undefined

                  tabToRemove &&
                    dockLayout.current &&
                    // @ts-ignore
                    dockLayout.current.dockMove(tabToRemove, null, 'remove')
                }
              ),
              id: sceneFromEvent?.id || selectedElement.id,
              content: getTabContent(
                studioId,
                sceneFromEvent?.id || selectedElement.id,
                sceneFromEvent ? ELEMENT_TYPE.SCENE : selectedElement.type
              ),
              group: 'default',
              closable: true,
              cached: true
            },
            activePanelId,
            'middle'
          )

          setTabs([
            ...tabs,
            sceneFromEvent
              ? {
                  id: sceneFromEvent.id,
                  expanded: true,
                  title: sceneFromEvent.title,
                  type: ELEMENT_TYPE.SCENE
                }
              : selectedElement
          ])
        }

        if (foundTab?.id) {
          dockLayout.current.updateTab(foundTab.id, foundTab)
        }
      }
    }

    logger.info(
      `ElementEditor->editor.selectedWorldOutlineElement.id->useEffect->type: ${selectedElement.type}`
    )

    findTabAndOpen()
  }, [editor.selectedWorldOutlineElement.id])

  useEffect(() => {
    if (
      dockLayout.current &&
      editor.renamedElement.id &&
      editor.renamedElement.newTitle
    ) {
      const tabToUpdate = cloneDeep(
        dockLayout.current.find(editor.renamedElement.id)
      ) as TabData | undefined

      logger.info(`ElementEditor->editor.renamedElement->useEffect`)

      if (tabToUpdate) {
        const clonedTabs = cloneDeep(tabs),
          foundTab = clonedTabs.find(
            (clonedTab) => clonedTab.id === editor.renamedElement.id
          )

        if (foundTab) {
          foundTab.title = editor.renamedElement.newTitle

          tabToUpdate.title = getTabTitle(
            {
              ...foundTab,
              title: editor.renamedElement.newTitle
            },
            (componentId: ElementId) => {
              const tabToRemove = dockLayout.current?.find(componentId) as
                | TabData
                | undefined

              tabToRemove &&
                dockLayout.current &&
                // @ts-ignore
                dockLayout.current.dockMove(tabToRemove, null, 'remove')

              const clonedTabs = cloneDeep(tabs)

              clonedTabs.splice(
                clonedTabs.findIndex(
                  (clonedTab) => clonedTab.id === componentId
                ),
                1
              )

              setTabs(clonedTabs)
            }
          )

          setTabs(clonedTabs)

          // BUG: This is a call stack hack to ensure tab
          //      state isn't stale when onLayoutChange fires.
          //      This could possibly be improved by doing the
          //      tab update in a useEffect.
          setTimeout(
            () =>
              dockLayout.current &&
              editor.renamedElement.id &&
              dockLayout.current.updateTab(
                editor.renamedElement.id,
                tabToUpdate,
                false
              ),
            0
          )
        }
      }
    }
  }, [editor.renamedElement])

  useEffect(() => {
    async function removeTabs() {
      if (!dockLayout.current || !editor.removedElement.id) return

      let scenesById: ElementId[] =
          editor.removedElement.type === ELEMENT_TYPE.SCENE
            ? [editor.removedElement.id]
            : [],
        eventsById: ElementId[] = []

      const clonedTabs = cloneDeep(tabs)

      if (editor.removedElement.type === ELEMENT_TYPE.FOLDER) {
        scenesById = (
          await api().folders.getChildRefsByFolderRef(
            studioId,
            editor.removedElement.id
          )
        ).map((child) => child[1])
      }

      if (editor.removedElement.type === ELEMENT_TYPE.SCENE) {
        await Promise.all(
          scenesById.map(async (sceneId) => {
            eventsById = [
              ...eventsById,
              ...(
                await api().scenes.getChildRefsBySceneRef(studioId, sceneId)
              ).map((child) => child[1])
            ]
          })
        )
      }

      scenesById.map((sceneId) => {
        const foundTab = dockLayout.current?.find(sceneId) as
          | TabData
          | undefined

        if (foundTab?.parent?.id) {
          // @ts-ignore rc-dock #75
          dockLayout.current?.dockMove(foundTab, null, 'remove')

          clonedTabs.splice(
            clonedTabs.findIndex((clonedTab) => clonedTab.id === sceneId),
            1
          )
        }
      })

      eventsById.map((eventId) => {
        const foundTab = dockLayout.current?.find(eventId) as
          | TabData
          | undefined

        if (foundTab?.parent?.id) {
          // @ts-ignore rc-dock #75
          dockLayout.current?.dockMove(foundTab, null, 'remove')

          clonedTabs.splice(
            clonedTabs.findIndex((clonedTab) => clonedTab.id === eventId),
            1
          )
        }
      })

      const foundTab = dockLayout.current.find(editor.removedElement.id)

      if (foundTab?.parent?.id) {
        // @ts-ignore rc-dock #75
        dockLayout.current.dockMove(foundTab, null, 'remove')

        clonedTabs.splice(
          clonedTabs.findIndex(
            (clonedTab) => clonedTab.id === editor.removedElement.id
          ),
          1
        )
      }
    }

    removeTabs()
  }, [editor.removedElement])

  useEffect(() => {
    logger.info(`ElementEditor->editor.closedEditorTab->useEffect`)

    if (editor.closedEditorTab.id && dockLayout.current) {
      const foundTab = dockLayout.current.find(editor.closedEditorTab.id) as
        | TabData
        | undefined

      foundTab && dockLayout.current.dockMove(foundTab, null, 'remove')

      editorDispatch({
        type: COMPOSER_ACTION_TYPE.ELEMENT_EDITOR_CLOSE_TAB,
        closedEditorTab: {}
      })
    }
  }, [editor.closedEditorTab])

  return (
    <>
      <DockLayout
        ref={dockLayout}
        defaultLayout={createBaseLayoutData(studioId, world)}
        groups={{
          default: { floatable: false, animated: false }
        }}
        onLayoutChange={onLayoutChange}
        dropMode="edge"
      />
    </>
  )
}

ElementEditor.displayName = 'ElementEditor'

export default ElementEditor
