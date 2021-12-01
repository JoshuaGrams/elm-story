import React, { useContext } from 'react'

import { ElementId, ELEMENT_TYPE, StudioId } from '../../../data/types'

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

import ComponentTitle from '../ElementTitle'
import JumpDetails from '../JumpProperties'
import EventProperties from '../EventProperties'
import RouteDetails from '../PathProperties'
import ChoiceDetails from '../ChoiceProperties'
import ElementHelpButton from '../../ElementHelpButton'

import styles from '../styles.module.less'

import api from '../../../api'

const SceneDetails: React.FC<{ studioId: StudioId; sceneId: ElementId }> = ({
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
                      type: EDITOR_ACTION_TYPE.WORLD_OUTLINE_SELECT,
                      selectedWorldOutlineElement: {
                        ...editor.selectedWorldOutlineElement,
                        title
                      }
                    })
                  }
                }}
              />
              <div className={styles.componentId}>{scene.id}</div>

              {!editor.selectedComponentEditorSceneViewEvent &&
                !editor.selectedComponentEditorSceneViewJump &&
                !editor.selectedComponentEditorSceneViewRoute && (
                  <div className={styles.multiSelection}>
                    {editor.totalComponentEditorSceneViewSelectedPassages >
                      0 && (
                      <div>
                        Selected Events:{' '}
                        {editor.totalComponentEditorSceneViewSelectedPassages}
                      </div>
                    )}

                    {editor.totalComponentEditorSceneViewSelectedJumps > 0 && (
                      <div>
                        Selected Jumps:{' '}
                        {editor.totalComponentEditorSceneViewSelectedJumps}
                      </div>
                    )}

                    {editor.totalComponentEditorSceneViewSelectedRoutes > 0 && (
                      <div>
                        Selected Paths:{' '}
                        {editor.totalComponentEditorSceneViewSelectedRoutes}
                      </div>
                    )}
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
                      <ElementHelpButton type={ELEMENT_TYPE.JUMP} />
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
                      Selected Path
                      <ElementHelpButton type={ELEMENT_TYPE.ROUTE} />
                    </>
                  }
                  key="route-details-panel"
                >
                  <RouteDetails
                    studioId={studioId}
                    worldId={scene.worldId}
                    routeId={editor.selectedComponentEditorSceneViewRoute}
                  />
                </Collapse.Panel>
              </Collapse>
            )}

            {editor.selectedComponentEditorSceneViewEvent && (
              <Collapse
                defaultActiveKey={[
                  'passage-details-panel',
                  'choice-details-panel'
                ]}
              >
                {/* Passage Panel */}
                {editor.selectedComponentEditorSceneViewEvent && (
                  <Collapse.Panel
                    header={
                      <>
                        <AlignLeftOutlined className={styles.headerIcon} />{' '}
                        Selected Event
                        <ElementHelpButton type={ELEMENT_TYPE.EVENT} />
                      </>
                    }
                    key="passage-details-panel"
                  >
                    <EventProperties
                      studioId={studioId}
                      passageId={editor.selectedComponentEditorSceneViewEvent}
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
                        <ElementHelpButton type={ELEMENT_TYPE.CHOICE} />
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
