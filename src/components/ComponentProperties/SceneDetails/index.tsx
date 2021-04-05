import React, { useContext } from 'react'

import { ComponentId, StudioId } from '../../../data/types'

import { useScene } from '../../../hooks'

import { EditorContext } from '../../../contexts/EditorContext'

import { Collapse } from 'antd'

import PassageDetails from '../PassageDetails'
import ChoiceDetails from '../ChoiceDetails'

const { Panel } = Collapse

import styles from '../styles.module.less'
import { AlignLeftOutlined, BranchesOutlined } from '@ant-design/icons'

const SceneDetails: React.FC<{ studioId: StudioId; sceneId: ComponentId }> = ({
  studioId,
  sceneId
}) => {
  const scene = useScene(studioId, sceneId, [sceneId])

  const { editor } = useContext(EditorContext)

  return (
    <>
      {scene && (
        <>
          <div className={styles.componentDetailViewContent}>
            <div>Title: {scene.title}</div>
            <div>ID: {scene.id}</div>

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
