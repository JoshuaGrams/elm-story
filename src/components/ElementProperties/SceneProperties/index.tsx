import React, { useContext } from 'react'

import {
  ElementId,
  ELEMENT_TYPE,
  EVENT_TYPE,
  StudioId
} from '../../../data/types'

import { useEvent, useScene } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import { Collapse } from 'antd'
import {
  AlignLeftOutlined,
  BranchesOutlined,
  ArrowRightOutlined,
  NodeIndexOutlined
} from '@ant-design/icons'

import ElementTitle from '../ElementTitle'
import ElementAudio from '../../ElementAudio'

import JumpProperties from '../JumpProperties'
import EventProperties from '../EventProperties'
import PathProperties from '../PathProperties'
import ChoiceProperties from '../ChoiceProperties'

import ElementHelpButton from '../../ElementHelpButton'

import rootStyles from '../styles.module.less'
import styles from './styles.module.less'

import api from '../../../api'

const getEventTypeString = (eventType: EVENT_TYPE) => {
  switch (eventType) {
    case EVENT_TYPE.CHOICE:
      return 'Choice'
    case EVENT_TYPE.INPUT:
      return 'Input'
    case EVENT_TYPE.JUMP:
      return 'Jump'
    default:
      return undefined
  }
}

const SceneDetails: React.FC<{ studioId: StudioId; sceneId: ElementId }> = ({
  studioId,
  sceneId
}) => {
  const scene = useScene(studioId, sceneId, [sceneId])

  const { composer, composerDispatch } = useContext(ComposerContext)

  const event = useEvent(studioId, composer.selectedSceneMapEvent, [
    composer.selectedSceneMapEvent
  ])

  return (
    <>
      {scene && (
        <>
          <div className={rootStyles.componentDetailViewWrapper}>
            <div className={rootStyles.content}>
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

              <div className={rootStyles.componentId}>{scene.id}</div>

              <div className={styles.sceneAudioWrapper}>
                <div className={styles.header}>Audio Profile</div>

                <ElementAudio
                  studioId={studioId}
                  elementType={ELEMENT_TYPE.SCENE}
                  element={scene}
                />
              </div>

              {!composer.selectedSceneMapEvent &&
                !composer.selectedSceneMapJump &&
                !composer.selectedSceneMapPath && (
                  <div className={rootStyles.multiSelection}>
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
                      <ArrowRightOutlined className={rootStyles.headerIcon} />{' '}
                      Selected Jump Event
                      <ElementHelpButton type={ELEMENT_TYPE.JUMP} />
                    </>
                  }
                  key="jump-details-panel"
                >
                  <JumpProperties
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
                      <NodeIndexOutlined className={rootStyles.headerIcon} />{' '}
                      Selected Path
                      <ElementHelpButton type={ELEMENT_TYPE.PATH} />
                    </>
                  }
                  key="path-details-panel"
                >
                  <PathProperties
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
                {composer.selectedSceneMapEvent && event?.id && (
                  <Collapse.Panel
                    header={
                      <>
                        <AlignLeftOutlined className={rootStyles.headerIcon} />{' '}
                        Selected {getEventTypeString(event.type)} Event
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
                        <BranchesOutlined className={rootStyles.headerIcon} />{' '}
                        Selected Choice
                        <ElementHelpButton type={ELEMENT_TYPE.CHOICE} />
                      </>
                    }
                    key="choice-details-panel"
                  >
                    <ChoiceProperties
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
