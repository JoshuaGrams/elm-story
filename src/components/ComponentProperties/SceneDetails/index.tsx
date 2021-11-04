import React, { useContext } from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../../data/types'

import { useScene } from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { Collapse } from 'antd'
import {
  AlignLeftOutlined,
  BranchesOutlined,
  ForwardOutlined,
  NodeIndexOutlined
} from '@ant-design/icons'

import ComponentTitle from '../ComponentTitle'
import JumpDetails from '../JumpDetails'
import PassageDetails from '../PassageDetails'
import RouteDetails from '../RouteDetails'
import ChoiceDetails from '../ChoiceDetails'
import ComponentHelpButton from '../../ComponentHelpButton'

import styles from '../styles.module.less'

import api from '../../../api'

const SceneDetails: React.FC<{ studioId: StudioId; sceneId: ComponentId }> = ({
  studioId,
  sceneId
}) => {
  const scene = useScene(studioId, sceneId, [sceneId])

  const { editor, editorDispatch } = useContext(EditorContext)

  return (
    <>
      {scene && (
        <>
          <div className={styles.componentDetailViewWrapper}>
            <div className={styles.content}>
              <ComponentTitle
                title={scene.title}
                onUpdate={async (title) => {
                  if (scene.id) {
                    await api().scenes.saveScene(studioId, {
                      ...(await api().scenes.getScene(studioId, scene.id)),
                      title
                    })

                    editorDispatch({
                      type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
                      renamedComponent: {
                        id: scene.id,
                        newTitle: title
                      }
                    })

                    // TODO: Is this necessary?
                    editorDispatch({
                      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
                      selectedGameOutlineComponent: {
                        ...editor.selectedGameOutlineComponent,
                        title
                      }
                    })
                  }
                }}
              />
              <div className={styles.componentId}>{scene.id}</div>
            </div>

            {!editor.selectedComponentEditorSceneViewJump &&
              editor.totalComponentEditorSceneViewSelectedJumps > 0 && (
                <div>
                  Selected Jumps:{' '}
                  {editor.totalComponentEditorSceneViewSelectedJumps}
                </div>
              )}

            <div className={styles.content}>
              {!editor.selectedComponentEditorSceneViewPassage &&
                editor.totalComponentEditorSceneViewSelectedPassages > 0 && (
                  <div>
                    Selected Passages:{' '}
                    {editor.totalComponentEditorSceneViewSelectedPassages}
                  </div>
                )}
              {!editor.selectedComponentEditorSceneViewRoute &&
                editor.totalComponentEditorSceneViewSelectedRoutes > 0 && (
                  <div>
                    Selected Routes:{' '}
                    {editor.totalComponentEditorSceneViewSelectedRoutes}
                  </div>
                )}
            </div>

            {/* Jump Panel */}
            {editor.selectedComponentEditorSceneViewJump && (
              <Collapse defaultActiveKey={['jump-details-panel']}>
                <Collapse.Panel
                  header={
                    <>
                      <ForwardOutlined className={styles.headerIcon} />
                      Selected Jump
                      <ComponentHelpButton type={COMPONENT_TYPE.JUMP} />
                    </>
                  }
                  key="jump-details-panel"
                >
                  <JumpDetails
                    studioId={studioId}
                    jumpId={editor.selectedComponentEditorSceneViewJump}
                  />
                </Collapse.Panel>
              </Collapse>
            )}

            {/* Route Panel */}
            {editor.selectedComponentEditorSceneViewRoute && (
              <Collapse defaultActiveKey={['route-details-panel']}>
                <Collapse.Panel
                  header={
                    <>
                      <NodeIndexOutlined className={styles.headerIcon} />{' '}
                      Selected Route
                      <ComponentHelpButton type={COMPONENT_TYPE.ROUTE} />
                    </>
                  }
                  key="route-details-panel"
                >
                  <RouteDetails
                    studioId={studioId}
                    gameId={scene.gameId}
                    routeId={editor.selectedComponentEditorSceneViewRoute}
                  />
                </Collapse.Panel>
              </Collapse>
            )}

            {editor.selectedComponentEditorSceneViewPassage && (
              <Collapse
                defaultActiveKey={[
                  'passage-details-panel',
                  'choice-details-panel'
                ]}
              >
                {/* Passage Panel */}
                {editor.selectedComponentEditorSceneViewPassage && (
                  <Collapse.Panel
                    header={
                      <>
                        <AlignLeftOutlined className={styles.headerIcon} />{' '}
                        Selected Passage
                        <ComponentHelpButton type={COMPONENT_TYPE.PASSAGE} />
                      </>
                    }
                    key="passage-details-panel"
                  >
                    <PassageDetails
                      studioId={studioId}
                      passageId={editor.selectedComponentEditorSceneViewPassage}
                    />
                  </Collapse.Panel>
                )}

                {/* Choice Panel */}
                {editor.selectedComponentEditorSceneViewChoice && (
                  <Collapse.Panel
                    header={
                      <>
                        <BranchesOutlined className={styles.headerIcon} />{' '}
                        Selected Choice
                        <ComponentHelpButton type={COMPONENT_TYPE.CHOICE} />
                      </>
                    }
                    key="choice-details-panel"
                  >
                    <ChoiceDetails
                      studioId={studioId}
                      choiceId={editor.selectedComponentEditorSceneViewChoice}
                    />
                  </Collapse.Panel>
                )}
              </Collapse>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default SceneDetails
