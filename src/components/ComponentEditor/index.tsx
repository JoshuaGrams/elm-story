import React, { useContext, useEffect, useRef, useState } from 'react'
import { cloneDeep } from 'lodash'
import logger from '../../lib/logger'

import { ComponentId, COMPONENT_TYPE, Game, StudioId } from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import DockLayout, {
  DropDirection,
  LayoutBase,
  LayoutData,
  PanelData,
  TabData
} from 'rc-dock'

import { find as findBox } from 'rc-dock/lib/Algorithm'

import {
  AlignLeftOutlined,
  BookOutlined,
  BranchesOutlined,
  CloseOutlined,
  PlayCircleFilled,
  QuestionOutlined
} from '@ant-design/icons'

import TabContent from './TabContent'
import GameView, { GameViewTools } from './GameView'
import ChapterView, { ChapterViewTools } from './ChapterView'
import SceneView, { SceneViewTools } from './SceneView'
import PassageView, { PassageViewTools } from './PassageView'

import styles from './styles.module.less'

import api from '../../api'
import { ReactFlowProvider } from 'react-flow-renderer'

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
    case COMPONENT_TYPE.CHAPTER:
      return (
        <TabContent
          studioId={studioId}
          id={id}
          type={type}
          tools={<ChapterViewTools studioId={studioId} chapterId={id} />}
          view={<ChapterView studioId={studioId} chapterId={id} />}
        />
      )
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
    case COMPONENT_TYPE.PASSAGE:
      return (
        <TabContent
          studioId={studioId}
          id={id}
          type={type}
          tools={<PassageViewTools studioId={studioId} passageId={id} />}
          view={<PassageView studioId={studioId} passageId={id} />}
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
    case COMPONENT_TYPE.CHAPTER:
      return <BookOutlined className={styles.tabIcon} />
    case COMPONENT_TYPE.SCENE:
      return <BranchesOutlined className={styles.tabIcon} />
    case COMPONENT_TYPE.PASSAGE:
      return <AlignLeftOutlined className={styles.tabIcon} />
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
      {component.type !== COMPONENT_TYPE.GAME &&
        (component.title || 'Unknown Title')}
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
        if (clonedTabIndex !== -1) {
          clonedTabs.splice(clonedTabIndex, 1)
        }

        setTabs(clonedTabs)

        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {}
        })
      }

      // Not removing tab
      if (
        direction !== 'remove' &&
        changingTabId !== editor.selectedGameOutlineComponent.id
      ) {
        if (clonedTabIndex !== -1) {
          const foundTab = cloneDeep(tabs[clonedTabIndex])

          console.log('test')
          console.log(tabs[clonedTabIndex])

          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent:
              foundTab.type !== COMPONENT_TYPE.GAME
                ? cloneDeep(tabs[clonedTabIndex])
                : {}
          })
        } else {
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {}
          })
        }
      }
    }
  }

  useEffect(() => {
    if (
      dockLayout.current &&
      editor.selectedGameOutlineComponent.id &&
      activePanelId
    ) {
      const foundTab = dockLayout.current.find(
        editor.selectedGameOutlineComponent.id
      ) as TabData

      if (!foundTab) {
        dockLayout.current.dockMove(
          {
            title: getTabTitle(
              editor.selectedGameOutlineComponent,
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
            ),
            id: editor.selectedGameOutlineComponent.id,
            content: getTabContent(
              studioId,
              editor.selectedGameOutlineComponent.id,
              editor.selectedGameOutlineComponent.type
            ),
            group: 'default',
            closable: true,
            cached: true
          },
          activePanelId,
          'middle'
        )

        setTabs([...tabs, editor.selectedGameOutlineComponent])
      } else {
        if (foundTab.id) {
          dockLayout.current.updateTab(foundTab.id, foundTab)
        }
      }
    }
  }, [editor.selectedGameOutlineComponent])

  useEffect(() => {
    if (
      dockLayout.current &&
      editor.renamedComponent.id &&
      editor.renamedComponent.newTitle
    ) {
      const tabToUpdate = cloneDeep(
        dockLayout.current.find(editor.renamedComponent.id)
      ) as TabData | undefined

      logger.info(`ComponentEditor: editor.renamedComponent`)

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

          dockLayout.current.updateTab(editor.renamedComponent.id, tabToUpdate)
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

      if (editor.removedComponent.type === COMPONENT_TYPE.CHAPTER) {
        scenesById = await api().chapters.getSceneRefsByChapterRef(
          studioId,
          editor.removedComponent.id
        )
      }

      if (
        editor.removedComponent.type === COMPONENT_TYPE.CHAPTER ||
        editor.removedComponent.type === COMPONENT_TYPE.SCENE
      ) {
        await Promise.all(
          scenesById.map(async (sceneId) => {
            passagesById = [
              ...passagesById,
              ...(await api().scenes.getPassageRefsBySceneRef(
                studioId,
                sceneId
              ))
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
