import React, { useRef, useState, useContext, useEffect } from 'react'
import { cloneDeep } from 'lodash'
import logger from '../../lib/logger'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import DockLayout, {
  PanelData,
  TabData,
  TabBase,
  LayoutBase,
  DropDirection,
  PanelBase,
  BoxBase
} from 'rc-dock'

import ChapterTabContent from './ChapterTabContent'
import SceneTabContent from './SceneTabContent'

interface EditorTab {
  panelId: string
  active: boolean
  type?: COMPONENT_TYPE
  expanded?: boolean
  position: number // order in panel 0-n
  data: TabData
}

const EditorContent: React.FC<{ title: string }> = ({ title }) => {
  return <div>{title}</div>
}

const createEditorTab = ({
  panelId,
  active,
  type,
  expanded,
  position,
  data: { id, title, content, group = 'default' }
}: EditorTab): EditorTab => ({
  panelId,
  active,
  type,
  expanded,
  position,
  data: {
    id,
    title,
    content,
    group,
    closable: true
  }
})

const createBaseLayoutData = (): LayoutBase => ({
  dockbox: {
    mode: 'horizontal',
    children: [{ id: '+0', tabs: [] }]
  }
})

const getBoxes = (box: BoxBase): BoxBase[] =>
  [box].concat(...(box.children || []).map((box) => getBoxes(box as BoxBase)))

interface Panel extends BoxBase {
  tabs?: TabData[]
}

const getPanels = (boxes: BoxBase[]): Panel[] =>
  boxes.filter((box) => !box.mode).map((panel) => panel)

const ComponentEditor: React.FC<{ studioId: StudioId }> = ({ studioId }) => {
  const dockLayout = useRef<DockLayout>(null)

  const { editor, editorDispatch } = useContext(EditorContext)

  const [layoutData, setLayoutData] = useState<LayoutBase>(
      createBaseLayoutData()
    ),
    [panels, setPanels] = useState<PanelBase[]>([]),
    [activePanelId, setActivePanelId] = useState<string | undefined>(undefined),
    [tabs, setTabs] = useState<{ data: EditorTab[]; updateLayout: boolean }>({
      data: [],
      updateLayout: false
    }),
    [activeTabId, setActiveTabId] = useState<ComponentId | undefined>(undefined)

  function onLayoutChange(
    newLayout: LayoutBase,
    changingTabId?: string | undefined,
    direction?: DropDirection | undefined
  ) {
    logger.info('onLayoutChange')
    console.log(newLayout)

    setLayoutData(newLayout)

    if (changingTabId) {
      const clonedPanels = cloneDeep(
          getPanels(getBoxes(newLayout.dockbox)) as PanelBase[]
        ),
        activeClonedPanel = clonedPanels.find(
          (panel) =>
            panel.tabs.findIndex((tab) => tab.id === changingTabId) !== -1
        ),
        clonedTabsData = cloneDeep(tabs.data)

      if (activeClonedPanel && activeClonedPanel.id) {
        setActivePanelId(activeClonedPanel.id)

        clonedTabsData.map((clonedTab) => {
          if (clonedTab.data.id === changingTabId && activeClonedPanel.id) {
            clonedTab.panelId = activeClonedPanel.id
          }
        })
      }

      if (direction && direction === 'remove') {
        clonedTabsData.map((clonedTab, index) => {
          if (clonedTab.data.id === changingTabId) {
            if (
              // panel is closing
              clonedPanels.findIndex(
                (clonedPanel) =>
                  clonedTabsData[index].panelId === clonedPanel.id
              ) === -1
            ) {
              const firstPanel = clonedPanels[0],
                activeTab = clonedTabsData.find(
                  (clonedTab) => clonedTab.data.id === firstPanel.activeId
                )

              // TODO: closest ccw panel, not the first
              setActivePanelId(firstPanel.id)

              editorDispatch({
                type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
                selectedGameOutlineComponent: {
                  id: activeTab?.data.id,
                  type: activeTab?.type,
                  title: activeTab?.data.title as string,
                  expanded: true
                }
              })
            }

            clonedTabsData.splice(index, 1)
          } else {
            // TODO: select correct component
            // panel is not closing
          }
        })
      } else {
        if (editor.selectedGameOutlineComponent.id !== changingTabId) {
          const activeTab = clonedTabsData.find(
            (clonedTab) => clonedTab.data.id === changingTabId
          )

          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: changingTabId,
              type: activeTab?.type,
              title: activeTab?.data.title as string,
              expanded: true
            }
          })
        }
      }

      activeClonedPanel?.tabs.map((clonedTab, index) => {
        const foundClonedTabData = clonedTabsData.find(
          (clonedTabData) => clonedTab.id === clonedTabData.data.id
        )

        if (foundClonedTabData) foundClonedTabData.position = index
      })

      clonedPanels.map((panel) => {
        clonedTabsData.map((clonedTab) => {
          if (clonedTab.panelId === panel.id) {
            clonedTab.active = panel.activeId === clonedTab.data.id
          }
        })
      })

      setPanels(clonedPanels)
      setTabs({ data: clonedTabsData, updateLayout: true })
    }
  }

  function loadTab({ id }: TabBase): TabData {
    return tabs.data[tabs.data.findIndex((tab) => tab.data.id === id)].data
  }

  useEffect(() => {
    logger.info('editor.selectedGameOutlineComponent')

    if (
      editor.selectedGameOutlineComponent.id &&
      editor.selectedGameOutlineComponent.title
    ) {
      const { id, title, type, expanded } = editor.selectedGameOutlineComponent

      // TODO: passage type -> open scene tab -> select scene tab -> zoom passage node
      if (
        tabs.data.findIndex((tab) => tab.data.id === id) === -1 &&
        activePanelId
      ) {
        const clonedLayout = cloneDeep(layoutData),
          clonedPanels = getPanels(getBoxes(clonedLayout.dockbox)),
          activeClonedPanel = clonedPanels.find(
            (clonedPanel) => clonedPanel.id === activePanelId
          )

        console.log(activeClonedPanel)

        if (activeClonedPanel && activeClonedPanel.tabs) {
          let content

          switch (type) {
            case COMPONENT_TYPE.CHAPTER:
              content = <ChapterTabContent studioId={studioId} chapterId={id} />
              break
            case COMPONENT_TYPE.SCENE:
              content = <SceneTabContent studioId={studioId} sceneId={id} />
              break
            default:
              content = <EditorContent title={title} />
              break
          }

          setTabs({
            data: [
              ...tabs.data,
              createEditorTab({
                panelId: activePanelId,
                active: true,
                type,
                expanded,
                // TODO: this should be after the active tab
                position: activeClonedPanel?.tabs?.length,
                data: {
                  id,
                  title,
                  content
                }
              })
            ],
            updateLayout: true
          })
        }
      } else {
        const clonedTabsData = cloneDeep(tabs.data)
        let newActivePanelId: string | undefined

        clonedTabsData.map((clonedTab) => {
          if (clonedTab.data.id === id) {
            newActivePanelId = clonedTab.panelId
          }
        })

        if (newActivePanelId) {
          clonedTabsData.map((clonedTab) => {
            if (clonedTab.panelId === newActivePanelId) {
              clonedTab.active = clonedTab.data.id === id
            }
          })

          setActivePanelId(newActivePanelId)
        }

        setTabs({ data: clonedTabsData, updateLayout: true })
      }
    }
  }, [editor.selectedGameOutlineComponent])

  useEffect(() => {
    logger.info('tabs effect')
    console.log(tabs)

    if (tabs.updateLayout) {
      if (tabs.data.length > 0) {
        console.log(dockLayout.current?.getLayout())

        const clonedLayoutData = cloneDeep(layoutData),
          panels = getPanels(getBoxes(clonedLayoutData.dockbox)) as PanelData[],
          clonedTabsData = cloneDeep(tabs.data)

        // TODO: when setting activeId, check first if tab still exists
        panels.map((panel) => {
          clonedTabsData.map((clonedTab) => {
            if (clonedTab.panelId === panel.id && clonedTab.active) {
              panel.activeId = clonedTab.data.id
            }
          })

          panel.tabs = clonedTabsData
            .filter((clonedTab) => clonedTab.panelId === panel.id)
            .sort((a, b) => a.position - b.position)
            .map((clonedTab) => clonedTab.data)
        })

        setLayoutData(clonedLayoutData)
      } else {
        setLayoutData(createBaseLayoutData())
      }
    }
  }, [tabs])

  useEffect(() => {
    const clonedTabsData = cloneDeep(tabs.data),
      tabToRename = clonedTabsData.find(
        (clonedTab) => clonedTab.data.id === editor.renamedComponent.id
      )

    if (tabToRename && editor.renamedComponent.newTitle) {
      tabToRename.data.title = editor.renamedComponent.newTitle
    }

    setTabs({ data: clonedTabsData, updateLayout: true })
  }, [editor.renamedComponent])

  useEffect(() => {
    logger.info('ComponentEditor -> editor.removedComponent Effect')
    // TODO: find panel with component to remove -> closest available tab to make active
    // -> remove tab -> set tabs
    // TODO: if the component being removed is a chapter or scene, must also recursively
    // close the children if they are open
    // TODO: consider keeping track of parent-child relationship in EditorContext
    // to avoid hitting the API
    switch (editor.removedComponent.type) {
      case COMPONENT_TYPE.CHAPTER:
        break
      case COMPONENT_TYPE.SCENE:
        break
      case COMPONENT_TYPE.PASSAGE:
        break
      default:
        break
    }

    const clonedLayoutData = cloneDeep(layoutData),
      clonedPanels = getPanels(
        getBoxes(clonedLayoutData.dockbox)
      ) as PanelData[],
      clonedTabsData = cloneDeep(tabs.data),
      tabToRemoveIndex = clonedTabsData.findIndex(
        (clonedTab) => clonedTab.data.id === editor.removedComponent.id
      ),
      tabToRemove = clonedTabsData.find(
        (clonedTab) => clonedTab.data.id === editor.removedComponent.id
      ),
      clonedPanelWithTab = clonedPanels.find(
        (clonedPanel) => clonedPanel.id === tabToRemove?.panelId
      )

    if (clonedPanels.length === 1) {
      // only 1 panel
      if (clonedPanelWithTab?.tabs.length === 1) {
        // only 1 tab
        setTabs({ data: [], updateLayout: true })
      } else {
        // more than 1 tab

        clonedTabsData.splice(tabToRemoveIndex, 1)

        setTabs({ data: clonedTabsData, updateLayout: true })
      }
    } else {
      // more than 1 panel
    }

    console.log(editor.removedComponent)
    console.log(tabToRemove)
    console.log(clonedPanelWithTab)
  }, [editor.removedComponent])

  useEffect(() => {
    logger.info(`Set active panel ID: ${activePanelId}`)
  }, [activePanelId])

  useEffect(() => {
    logger.info('layoutData effect')
    console.log(layoutData)

    const clonedLayoutData = cloneDeep(layoutData),
      clonedPanels = getPanels(
        getBoxes(clonedLayoutData.dockbox)
      ) as PanelData[]

    if (clonedPanels.length === 1) {
      setActivePanelId(clonedPanels[0].id)

      if (clonedPanels[0].tabs.length === 0) {
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {}
        })
      }
    }
  }, [layoutData])

  useEffect(() => {
    setPanels([layoutData.dockbox.children[0] as PanelData])
    setActivePanelId(layoutData.dockbox.children[0].id)
  }, [])

  return (
    <>
      {tabs.data.length > 0 ? (
        <DockLayout
          ref={dockLayout}
          layout={layoutData}
          loadTab={loadTab}
          onLayoutChange={onLayoutChange}
          groups={{
            default: {
              floatable: false,
              animated: false,
              maximizable: true
            }
          }}
          dropMode="edge"
        />
      ) : (
        <div>Select a component to edit...</div>
      )}
    </>
  )
}

export default ComponentEditor
