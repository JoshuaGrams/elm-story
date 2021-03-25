import React, { useContext, useEffect, useRef, useState } from 'react'
import { cloneDeep } from 'lodash'
import logger from '../../lib/logger'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import DockLayout, {
  DropDirection,
  LayoutBase,
  LayoutData,
  PanelData,
  TabData
} from 'rc-dock'

import { find as findBox } from 'rc-dock/lib/Algorithm'
import ChapterTabContent from './ChapterTabContent'
import SceneTabContent from './SceneTabContent'
import api from '../../api'

const createBaseLayoutData = (): LayoutData => ({
  dockbox: {
    mode: 'horizontal',
    children: [
      {
        id: '+0',
        tabs: [
          {
            title: 'Game Title',
            id: 'game-id',
            content: <div>Game Content</div>,
            group: 'default'
          }
        ]
      }
    ]
  }
})

const ComponentEditor: React.FC<{ studioId: StudioId }> = ({ studioId }) => {
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
    >([])

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
          logger.info('setting active panel to existing parent')
          setActivePanelId(newLayoutParentPanel.id)
        } else {
          logger.info('setting active panel to root panel')
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
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent:
            clonedTabIndex !== -1 ? cloneDeep(tabs[clonedTabIndex]) : {}
        })
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
        let contentComponent: React.ReactElement

        switch (editor.selectedGameOutlineComponent.type) {
          case COMPONENT_TYPE.CHAPTER:
            contentComponent = (
              <ChapterTabContent
                studioId={studioId}
                chapterId={editor.selectedGameOutlineComponent.id}
              />
            )
            break
          case COMPONENT_TYPE.SCENE:
            contentComponent = (
              <SceneTabContent
                studioId={studioId}
                sceneId={editor.selectedGameOutlineComponent.id}
              />
            )
            break
          case COMPONENT_TYPE.PASSAGE:
            contentComponent = <div>Passage Content</div>
            break
          default:
            contentComponent = <div>Unknown Content</div>
            break
        }

        setTabs([...tabs, editor.selectedGameOutlineComponent])

        dockLayout.current.dockMove(
          {
            title: editor.selectedGameOutlineComponent.title ?? 'Untitled',
            id: editor.selectedGameOutlineComponent.id,
            content: contentComponent,
            group: 'default',
            closable: true,
            cached:
              editor.selectedGameOutlineComponent.type === COMPONENT_TYPE.SCENE
          },
          activePanelId,
          'middle'
        )
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

      if (tabToUpdate) {
        tabToUpdate.title = editor.renamedComponent.newTitle

        dockLayout.current.updateTab(editor.renamedComponent.id, tabToUpdate)
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
        scenesById = await api().chapters.getSceneIdsByChapterId(
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
              ...(await api().scenes.getPassageIdsBySceneId(studioId, sceneId))
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
    <DockLayout
      ref={dockLayout}
      defaultLayout={createBaseLayoutData()}
      groups={{
        default: { floatable: false, animated: false, maximizable: true }
      }}
      onLayoutChange={onLayoutChange}
      dropMode="edge"
    />
  )
}

export default ComponentEditor
