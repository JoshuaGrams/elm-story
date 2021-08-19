import React, { useContext, useEffect, useRef, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import logger from '../../lib/logger'

import {
  ComponentId,
  COMPONENT_TYPE,
  Game,
  Passage,
  Scene,
  StudioId
} from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

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
  PlayCircleFilled,
  QuestionOutlined
} from '@ant-design/icons'

import TabContent from './TabContent'
import GameView, { GameViewTools } from './GameView'
import SceneView, { SceneViewTools } from './SceneView'

import styles from './styles.module.less'

import api from '../../api'

function createBaseLayoutData(studioId: StudioId, game: Game): LayoutData {
  if (!game.id)
    throw new Error('Unable to create base layout. Missing game ID.')

  return {
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          id: '+0',
          tabs: [
            {
              title: getTabTitle({
                id: game.id,
                title: game.title,
                type: COMPONENT_TYPE.GAME,
                expanded: true
              }),
              id: game.id,
              content: (
                <TabContent
                  studioId={studioId}
                  id={game.id}
                  type={COMPONENT_TYPE.GAME}
                  tools={<GameViewTools studioId={studioId} gameId={game.id} />}
                  view={<GameView studioId={studioId} gameId={game.id} />}
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
  id: ComponentId,
  type: COMPONENT_TYPE | undefined
): JSX.Element {
  switch (type) {
    case COMPONENT_TYPE.SCENE:
      return (
        <TabContent
          studioId={studioId}
          id={id}
          type={type}
          tools={<SceneViewTools studioId={studioId} sceneId={id} />}
          view={
            <ReactFlowProvider>
              <SceneView studioId={studioId} sceneId={id} />
            </ReactFlowProvider>
          }
        />
      )
    default:
      return <div>Unknown Content</div>
  }
}

function getTabIcon(type: COMPONENT_TYPE | undefined): JSX.Element {
  switch (type) {
    case COMPONENT_TYPE.GAME:
      return <PlayCircleFilled className={styles.gameTabIcon} />
    case COMPONENT_TYPE.SCENE:
      return <PartitionOutlined className={styles.tabIcon} />
    default:
      return <QuestionOutlined className={styles.tabIcon} />
  }
}

function getTabTitle(
  component: {
    id?: string | undefined
    expanded?: boolean | undefined
    type?: COMPONENT_TYPE | undefined
    title?: string | undefined
  },
  onClose?: (componentId: ComponentId) => void
): JSX.Element {
  return (
    <div className={styles.tabTitle}>
      {getTabIcon(component.type)}
      {component.type !== COMPONENT_TYPE.GAME && (
        <span className={styles.title}>
          {component.title || 'Unknown Title'}
        </span>
      )}
      {component.type !== COMPONENT_TYPE.GAME && (
        <CloseOutlined
          className={styles.tabCloseButton}
          onClick={(event) => {
            event.stopPropagation()
            component.id && onClose && onClose(component.id)
          }}
        />
      )}
    </div>
  )
}

const ComponentEditor: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
  const dockLayout = useRef<DockLayout>(null)

  const [activePanelId, setActivePanelId] = useState<string | undefined>('+0'),
    [activeTabId, setActiveTabId] = useState<ComponentId | undefined>(
      undefined
    ),
    [tabs, setTabs] = useState<
      {
        id?: string | undefined
        expanded?: boolean | undefined
        type?: COMPONENT_TYPE | undefined
        title?: string | undefined
      }[]
    >([
      {
        id: game.id,
        title: game.title,
        type: COMPONENT_TYPE.GAME,
        expanded: true
      }
    ])

  const { editor, editorDispatch } = useContext(EditorContext)

  function onLayoutChange(
    newLayout: LayoutBase,
    changingTabId?: string | undefined,
    direction?: DropDirection | undefined
  ) {
    logger.info(`ComponentEditor->onLayoutChange`)

    if (dockLayout.current && changingTabId) {
      const oldLayoutParentPanel = dockLayout.current.find(changingTabId)
        ?.parent as PanelData | undefined

      // Set active panel ID
      if (oldLayoutParentPanel?.id) {
        const newLayoutParentPanel = findBox(
          newLayout as LayoutData,
          oldLayoutParentPanel.id
        ) as PanelData | undefined

        if (newLayoutParentPanel) {
          logger.info(
            `setting active panel to existing parent '${newLayoutParentPanel.id}'`
          )
          setActivePanelId(newLayoutParentPanel.id)
        } else {
          logger.info(
            `setting active panel to root panel '${newLayout.dockbox.children[0].id}'`
          )
          setActivePanelId(newLayout.dockbox.children[0].id)
        }
      }

      const clonedTabs = cloneDeep(tabs),
        clonedTabIndex = clonedTabs.findIndex(
          (clonedTab) => clonedTab.id === changingTabId
        )

      // Removing tab
      if (
        direction === 'remove' &&
        changingTabId === editor.selectedGameOutlineComponent.id
      ) {
        logger.info(`Removing tab`)

        if (clonedTabIndex !== -1) {
          clonedTabs.splice(clonedTabIndex, 1)
        }

        setTabs(clonedTabs)

        editor.selectedComponentEditorSceneViewPassage &&
          editorDispatch({
            type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
            selectedComponentEditorSceneViewPassage: null
          })

        editor.selectedComponentEditorSceneViewJump &&
          editorDispatch({
            type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
            selectedComponentEditorSceneViewJump: null
          })

        // TODO: This should be the next available
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {
            id: game.id,
            expanded: true,
            title: game.title,
            type: COMPONENT_TYPE.GAME
          }
        })
      }

      // Not removing tab
      if (
        direction !== 'remove' &&
        changingTabId !== editor.selectedGameOutlineComponent.id &&
        !editor.renamedComponent.id
      ) {
        logger.info(`Not removing tab`)

        // Keep the passage selected in GameOutline
        // if (editor.selectedGameOutlineComponent.type !== COMPONENT_TYPE.PASSAGE)
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent:
            clonedTabIndex !== -1 ? cloneDeep(tabs[clonedTabIndex]) : {}
        })
      }

      if (editor.renamedComponent.id) {
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
          renamedComponent: {}
        })
      }
    }
  }

  useEffect(() => {
    const selectedComponent = editor.selectedGameOutlineComponent

    async function findTabAndOpen() {
      if (dockLayout.current && selectedComponent.id && activePanelId) {
        const passage: Passage | null =
            selectedComponent.type === COMPONENT_TYPE.PASSAGE
              ? await api().passages.getPassage(studioId, selectedComponent.id)
              : null,
          sceneFromPassage: Scene | null = passage
            ? await api().scenes.getScene(studioId, passage.sceneId)
            : null

        const foundTab = dockLayout.current.find(
          sceneFromPassage && sceneFromPassage.id
            ? sceneFromPassage.id
            : selectedComponent.id
        ) as TabData

        if (!foundTab && selectedComponent.type !== COMPONENT_TYPE.FOLDER) {
          dockLayout.current.dockMove(
            {
              title: getTabTitle(
                sceneFromPassage
                  ? {
                      id: sceneFromPassage.id,
                      expanded: true,
                      title: sceneFromPassage.title,
                      type: COMPONENT_TYPE.SCENE
                    }
                  : selectedComponent,
                (componentId: ComponentId) => {
                  const tabToRemove = dockLayout.current?.find(componentId) as
                    | TabData
                    | undefined

                  tabToRemove &&
                    dockLayout.current &&
                    // @ts-ignore
                    dockLayout.current.dockMove(tabToRemove, null, 'remove')
                }
              ),
              id: sceneFromPassage?.id || selectedComponent.id,
              content: getTabContent(
                studioId,
                sceneFromPassage?.id || selectedComponent.id,
                sceneFromPassage ? COMPONENT_TYPE.SCENE : selectedComponent.type
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
            sceneFromPassage
              ? {
                  id: sceneFromPassage.id,
                  expanded: true,
                  title: sceneFromPassage.title,
                  type: COMPONENT_TYPE.SCENE
                }
              : selectedComponent
          ])
        }

        if (foundTab?.id) {
          dockLayout.current.updateTab(foundTab.id, foundTab)
        }
      }
    }

    logger.info(
      `ComponentEditor->editor.selectedGameOutlineComponent.id->useEffect->type: ${selectedComponent.type}`
    )

    findTabAndOpen()
  }, [editor.selectedGameOutlineComponent.id])

  useEffect(() => {
    if (
      dockLayout.current &&
      editor.renamedComponent.id &&
      editor.renamedComponent.newTitle
    ) {
      const tabToUpdate = cloneDeep(
        dockLayout.current.find(editor.renamedComponent.id)
      ) as TabData | undefined

      logger.info(`ComponentEditor->editor.renamedComponent->useEffect`)

      if (tabToUpdate) {
        const clonedTabs = cloneDeep(tabs),
          foundTab = clonedTabs.find(
            (clonedTab) => clonedTab.id === editor.renamedComponent.id
          )

        if (foundTab) {
          foundTab.title = editor.renamedComponent.newTitle

          tabToUpdate.title = getTabTitle(
            {
              ...foundTab,
              title: editor.renamedComponent.newTitle
            },
            (componentId: ComponentId) => {
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
              editor.renamedComponent.id &&
              dockLayout.current.updateTab(
                editor.renamedComponent.id,
                tabToUpdate,
                false
              ),
            0
          )
        }
      }
    }
  }, [editor.renamedComponent])

  useEffect(() => {
    async function removeTabs() {
      if (!dockLayout.current || !editor.removedComponent.id) return

      let scenesById: ComponentId[] =
          editor.removedComponent.type === COMPONENT_TYPE.SCENE
            ? [editor.removedComponent.id]
            : [],
        passagesById: ComponentId[] = []

      const clonedTabs = cloneDeep(tabs)

      if (editor.removedComponent.type === COMPONENT_TYPE.FOLDER) {
        scenesById = (
          await api().folders.getChildRefsByFolderRef(
            studioId,
            editor.removedComponent.id
          )
        ).map((child) => child[1])
      }

      if (editor.removedComponent.type === COMPONENT_TYPE.SCENE) {
        await Promise.all(
          scenesById.map(async (sceneId) => {
            passagesById = [
              ...passagesById,
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

      passagesById.map((passageId) => {
        const foundTab = dockLayout.current?.find(passageId) as
          | TabData
          | undefined

        if (foundTab?.parent?.id) {
          // @ts-ignore rc-dock #75
          dockLayout.current?.dockMove(foundTab, null, 'remove')

          clonedTabs.splice(
            clonedTabs.findIndex((clonedTab) => clonedTab.id === passageId),
            1
          )
        }
      })

      const foundTab = dockLayout.current.find(editor.removedComponent.id)

      if (foundTab?.parent?.id) {
        // @ts-ignore rc-dock #75
        dockLayout.current.dockMove(foundTab, null, 'remove')

        clonedTabs.splice(
          clonedTabs.findIndex(
            (clonedTab) => clonedTab.id === editor.removedComponent.id
          ),
          1
        )
      }
    }

    removeTabs()
  }, [editor.removedComponent])

  useEffect(() => {
    logger.info(`ComponentEditor->editor.closedEditorTab->useEffect`)

    if (editor.closedEditorTab.id && dockLayout.current) {
      const foundTab = dockLayout.current.find(editor.closedEditorTab.id) as
        | TabData
        | undefined

      foundTab && dockLayout.current.dockMove(foundTab, null, 'remove')

      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_CLOSE_TAB,
        closedEditorTab: {}
      })
    }
  }, [editor.closedEditorTab])

  return (
    <>
      <DockLayout
        ref={dockLayout}
        defaultLayout={createBaseLayoutData(studioId, game)}
        groups={{
          default: { floatable: false, animated: false }
        }}
        onLayoutChange={onLayoutChange}
        dropMode="edge"
      />
    </>
  )
}

export default ComponentEditor
