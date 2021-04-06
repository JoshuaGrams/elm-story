import React, { useContext } from 'react'

import { ComponentId, StudioId } from '../../../data/types'

import { useScene } from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { Collapse } from 'antd'
import { AlignLeftOutlined, BranchesOutlined } from '@ant-design/icons'

import ComponentTitle from '../ComponentTitle'
import PassageDetails from '../PassageDetails'
import ChoiceDetails from '../ChoiceDetails'

const { Panel } = Collapse

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
          <div className={styles.componentDetailViewContent}>
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

            {!editor.selectedComponentEditorSceneViewPassage &&
              editor.totalComponentEditorSceneViewSelectedPassages > 0 && (
                <div>
                  Selected Passages:{' '}
                  {editor.totalComponentEditorSceneViewSelectedPassages}
                </div>
              )}
            {editor.totalComponentEditorSceneViewSelectedRoutes > 0 && (
              <div>
                Selected Routes:{' '}
                {editor.totalComponentEditorSceneViewSelectedRoutes}
              </div>
            )}
          </div>

          <div className={styles.componentDetailViewNestedCollapse}>
            {editor.selectedComponentEditorSceneViewPassage && (
              <Collapse
                defaultActiveKey={['passage-details', 'choice-details']}
              >
                {/* Passage Panel */}
                {editor.selectedComponentEditorSceneViewPassage && (
                  <Panel
                    header={
                      <>
                        <AlignLeftOutlined className={styles.headerIcon} />{' '}
                        Selected Passage
                      </>
                    }
                    key="passage-details"
                  >
                    <PassageDetails
                      studioId={studioId}
                      passageId={editor.selectedComponentEditorSceneViewPassage}
                    />
                  </Panel>
                )}
                {/* Choice Panel */}
                {editor.selectedComponentEditorSceneViewChoice && (
                  <Panel
                    header={
                      <>
                        <BranchesOutlined className={styles.headerIcon} />{' '}
                        Selected Choice
                      </>
                    }
                    key="choice-details"
                  >
                    <ChoiceDetails
                      studioId={studioId}
                      choiceId={editor.selectedComponentEditorSceneViewChoice}
                    />
                  </Panel>
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
