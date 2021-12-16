import React, { useContext } from 'react'

import { ElementId, ELEMENT_TYPE, StudioId } from '../../../data/types'

import { useScene } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import { Collapse } from 'antd'
import {
  AlignLeftOutlined,
  BranchesOutlined,
  ForwardOutlined,
  NodeIndexOutlined
} from '@ant-design/icons'

import ElementTitle from '../ElementTitle'
import JumpDetails from '../JumpProperties'
import EventProperties from '../EventProperties'
import PathDetails from '../PathProperties'
import ChoiceDetails from '../ChoiceProperties'
import ElementHelpButton from '../../ElementHelpButton'

import styles from '../styles.module.less'

import api from '../../../api'

const SceneDetails: React.FC<{ studioId: StudioId; sceneId: ElementId }> = ({
  studioId,
  sceneId
}) => {
  const scene = useScene(studioId, sceneId, [sceneId])

  const { composer, composerDispatch } = useContext(ComposerContext)

  return (
    <>
      {scene && (
        <>
          <div className={styles.componentDetailViewWrapper}>
            <div className={styles.content}>
              <ElementTitle
                title={scene.title}
                onUpdate={async (title) => {
                  if (scene.id) {
                    await api().scenes.saveScene(studioId, {
                      ...(await api().scenes.getScene(studioId, scene.id)),
                      title
                    })

                    composerDispatch({
                      type: COMPOSER_ACTION_TYPE.ELEMENT_RENAME,
                      renamedElement: {
                        id: scene.id,
                        newTitle: title
                      }
                    })

                    // TODO: Is this necessary?
                    composerDispatch({
                      type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
                      selectedWorldOutlineElement: {
                        ...composer.selectedWorldOutlineElement,
                        title
                      }
                    })
                  }
                }}
              />
              <div className={styles.componentId}>{scene.id}</div>

              {!composer.selectedSceneMapEvent &&
                !composer.selectedSceneMapJump &&
                !composer.selectedSceneMapPath && (
                  <div className={styles.multiSelection}>
                    {composer.totalSceneMapSelectedEvents > 0 && (
                      <div>
                        Selected Events: {composer.totalSceneMapSelectedEvents}
                      </div>
                    )}

                    {composer.totalSceneMapSelectedJumps > 0 && (
                      <div>
                        Selected Jumps: {composer.totalSceneMapSelectedJumps}
                      </div>
                    )}

                    {composer.totalSceneMapSelectedPaths > 0 && (
                      <div>
                        Selected Paths: {composer.totalSceneMapSelectedPaths}
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Jump Panel */}
            {composer.selectedSceneMapJump && (
              <Collapse defaultActiveKey={['jump-details-panel']}>
                <Collapse.Panel
                  header={
                    <>
                      <ForwardOutlined className={styles.headerIcon} /> Selected
                      Jump
                      <ElementHelpButton type={ELEMENT_TYPE.JUMP} />
                    </>
                  }
                  key="jump-details-panel"
                >
                  <JumpDetails
                    studioId={studioId}
                    jumpId={composer.selectedSceneMapJump}
                  />
                </Collapse.Panel>
              </Collapse>
            )}

            {/* Path Panel */}
            {composer.selectedSceneMapPath && (
              <Collapse defaultActiveKey={['path-details-panel']}>
                <Collapse.Panel
                  header={
                    <>
                      <NodeIndexOutlined className={styles.headerIcon} />{' '}
                      Selected Path
                      <ElementHelpButton type={ELEMENT_TYPE.PATH} />
                    </>
                  }
                  key="path-details-panel"
                >
                  <PathDetails
                    studioId={studioId}
                    worldId={scene.worldId}
                    pathId={composer.selectedSceneMapPath}
                  />
                </Collapse.Panel>
              </Collapse>
            )}

            {composer.selectedSceneMapEvent && (
              <Collapse
                defaultActiveKey={[
                  'passage-details-panel',
                  'choice-details-panel'
                ]}
              >
                {/* Event Panel */}
                {composer.selectedSceneMapEvent && (
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
                      eventId={composer.selectedSceneMapEvent}
                    />
                  </Collapse.Panel>
                )}

                {/* Choice Panel */}
                {composer.selectedSceneMapChoice && (
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
                      choiceId={composer.selectedSceneMapChoice}
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
