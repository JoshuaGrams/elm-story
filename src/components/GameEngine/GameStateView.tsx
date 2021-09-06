import React, { useContext, useEffect, useState } from 'react'

import {
  ComponentId,
  COMPONENT_TYPE,
  StudioId,
  VARIABLE_TYPE
} from '../../data/types'

import { usePassage, useScene } from '../../hooks'

import { AppContext } from '../../contexts/AppContext'
import { EngineContext } from '../../contexts/EngineContext'
import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { Table } from 'antd'

import styles from './styles.module.less'

const navigationDataColumns = [
  {
    title: 'Component ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'title'
  },
  {
    title: 'Position',
    dataIndex: 'position',
    key: 'position'
  }
]

interface NavigationData {
  id: ComponentId
  key: string
  position: 'STARTING' | 'CURRENT'
  title: string | JSX.Element
  type: COMPONENT_TYPE
}

const variableDataColumns = [
  {
    title: 'Component ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: 'Title / ID',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: 'Initial',
    dataIndex: 'initial',
    key: 'initial'
  },
  {
    title: 'Current',
    dataIndex: 'current',
    key: 'current'
  }
]

interface VariableData {
  id: ComponentId
  key: string
  title: string
  type: VARIABLE_TYPE
  initial: string
  current: string
}

const NavigationTable: React.FC<{ studioId: StudioId }> = ({ studioId }) => {
  const { engine } = useContext(EngineContext),
    { editorDispatch } = useContext(EditorContext)

  const startingScene = useScene(studioId, engine.startingScene, [
      studioId,
      engine.startingScene
    ]),
    currentScene = useScene(studioId, engine.currentScene, [
      studioId,
      engine.currentScene
    ]),
    startingPassage = usePassage(studioId, engine.startingPassage, [
      studioId,
      engine.startingPassage
    ]),
    currentPassage = usePassage(studioId, engine.currentPassage, [
      studioId,
      engine.currentPassage
    ])

  const [navigationData, setNavigationData] = useState<NavigationData[]>([])

  function openNavLink({
    id,
    parentId, // scene
    parentTitle, // scene
    title,
    type
  }: {
    id: ComponentId
    parentId?: ComponentId
    parentTitle?: string
    title: string
    type: COMPONENT_TYPE
  }) {
    editorDispatch({
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
      selectedGameOutlineComponent: {
        expanded: true,
        id: parentId || id,
        title: parentTitle || title,
        type: COMPONENT_TYPE.SCENE
      }
    })

    if (type === COMPONENT_TYPE.PASSAGE)
      // #313: stack hack
      setTimeout(
        () =>
          editorDispatch({
            type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
            selectedComponentEditorSceneViewPassage: id
          }),
        1
      )
  }

  useEffect(() => {
    const newNavigationData: NavigationData[] = []

    if (currentScene?.id)
      newNavigationData.push({
        id: currentScene.id,
        key: `current-scene-${currentScene.id}`,
        position: 'CURRENT',
        title: (
          <span
            className={styles.navLink}
            onClick={() =>
              currentScene.id &&
              openNavLink({
                id: currentScene.id,
                title: currentScene.title,
                type: COMPONENT_TYPE.SCENE
              })
            }
          >
            {currentScene.title}
          </span>
        ),
        type: COMPONENT_TYPE.SCENE
      })

    if (!currentScene?.id)
      newNavigationData.push({
        id: 'N/A',
        key: 'current-scene-na',
        position: 'CURRENT',
        title: 'N/A',
        type: COMPONENT_TYPE.SCENE
      })

    if (currentScene?.id && currentPassage?.id)
      newNavigationData.push({
        id: currentPassage.id,
        key: `current-passage-${currentPassage.id}`,
        position: 'CURRENT',
        title: (
          <span
            className={styles.navLink}
            onClick={() =>
              currentScene.id &&
              currentPassage.id &&
              openNavLink({
                id: currentPassage.id,
                parentId: currentScene.id,
                parentTitle: currentScene.title,
                title: currentPassage.title,
                type: COMPONENT_TYPE.PASSAGE
              })
            }
          >
            {currentPassage.title}
          </span>
        ),
        type: COMPONENT_TYPE.PASSAGE
      })

    if (!currentPassage?.id)
      newNavigationData.push({
        id: 'N/A',
        key: 'current-passage-na',
        position: 'CURRENT',
        title: 'N/A',
        type: COMPONENT_TYPE.PASSAGE
      })

    if (startingScene?.id)
      newNavigationData.push({
        id: startingScene.id,
        key: `starting-scene-${startingScene.id}`,
        position: 'STARTING',
        title: (
          <span
            className={styles.navLink}
            onClick={() =>
              startingScene.id &&
              openNavLink({
                id: startingScene.id,
                title: startingScene.title,
                type: COMPONENT_TYPE.SCENE
              })
            }
          >
            {startingScene.title}
          </span>
        ),
        type: COMPONENT_TYPE.SCENE
      })

    if (!startingScene?.id)
      newNavigationData.push({
        id: 'N/A',
        key: 'starting-scene-na',
        position: 'STARTING',
        title: 'N/A',
        type: COMPONENT_TYPE.SCENE
      })

    if (startingScene?.id && startingPassage?.id)
      newNavigationData.push({
        id: startingPassage.id,
        key: `starting-passage-${startingPassage.id}`,
        position: 'STARTING',
        title: (
          <span
            className={styles.navLink}
            onClick={() =>
              startingScene.id &&
              startingPassage.id &&
              openNavLink({
                id: startingPassage.id,
                parentId: startingScene.id,
                parentTitle: startingScene.title,
                title: startingPassage.title,
                type: COMPONENT_TYPE.PASSAGE
              })
            }
          >
            {startingPassage.title}
          </span>
        ),
        type: COMPONENT_TYPE.PASSAGE
      })

    if (!startingPassage?.id)
      newNavigationData.push({
        id: 'N/A',
        key: 'starting-passage-na',
        position: 'STARTING',
        title: 'N/A',
        type: COMPONENT_TYPE.PASSAGE
      })

    setNavigationData(newNavigationData)
  }, [startingScene, currentScene, startingPassage, currentPassage])

  return (
    <div>
      <div className={styles.dataHeader}>Navigation</div>
      {navigationData.length > 0 && (
        <Table
          dataSource={navigationData}
          columns={navigationDataColumns}
          pagination={false}
        />
      )}
    </div>
  )
}

const VariablesTable: React.FC = () => {
  const { engine } = useContext(EngineContext)

  const [variableData, setVariableData] = useState<VariableData[]>([])

  useEffect(() => {
    const newVariableData: VariableData[] = []

    Object.keys(engine.gameState).map((key) =>
      newVariableData.push({
        key,
        id: key,
        title: engine.gameState[key].title,
        type: engine.gameState[key].type,
        initial: `${engine.gameState[key].initialValue || 'undefined'}`,
        current: `${engine.gameState[key].currentValue || 'undefined'}`
      })
    )

    setVariableData(newVariableData)
  }, [engine.gameState])

  return (
    <div>
      <div className={styles.dataHeader}>Variables</div>
      {variableData.length === 0 && (
        <div className={styles.noData}>
          Add global variables to see game state.
        </div>
      )}
      {variableData.length > 0 && (
        <Table
          dataSource={variableData}
          columns={variableDataColumns}
          pagination={false}
        />
      )}
    </div>
  )
}

const GameStateView: React.FC = () => {
  const { app } = useContext(AppContext)

  return (
    <div className={styles.GameStateView}>
      {app.selectedStudioId && (
        <NavigationTable studioId={app.selectedStudioId} />
      )}

      <VariablesTable />
    </div>
  )
}

export default GameStateView
