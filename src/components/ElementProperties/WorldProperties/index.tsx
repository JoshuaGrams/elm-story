import semver from 'semver'

import React, { useEffect, useState } from 'react'

import { WorldId, StudioId } from '../../../data/types'

import { useWorld, useScenes } from '../../../hooks'

import { Button, Collapse, Form, Input } from 'antd'

import ElementTitle from '../ElementTitle'
import JumpTo from '../../JumpTo'

import parentStyles from '../styles.module.less'
import styles from './styles.module.less'

import api from '../../../api'

const WorldProperties: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = ({ studioId, worldId }) => {
  const world = useWorld(studioId, worldId, [studioId, worldId]),
    scenes = useScenes(studioId, worldId, [studioId, worldId])

  const [metadataForm] = Form.useForm()

  const [unsavedMetadataChanges, setUnsavedMetadataChanges] = useState(false)

  async function onCreateJump() {
    if (world?.id && scenes && scenes[0].id) {
      const { id: jumpId } = await api().jumps.saveJump(studioId, {
        worldId: world.id,
        title: 'On World Start Jump',
        path: [scenes[0].id],
        tags: []
      })

      jumpId &&
        (await api().worlds.saveJumpRefToWorld(studioId, worldId, jumpId))
    }
  }

  async function saveGameMetadata({
    copyright,
    description,
    designer,
    version,
    website
  }: {
    copyright: string
    description: string
    designer: string
    version: string
    website: string
  }) {
    if (world?.id) {
      setUnsavedMetadataChanges(false)

      try {
        await api().worlds.saveWorld(studioId, {
          ...(await api().worlds.getWorld(studioId, world.id)),
          copyright,
          description,
          designer,
          version,
          website
        })
      } catch (error) {
        throw error
      }
    }
  }

  useEffect(() => {
    metadataForm.resetFields()
    setUnsavedMetadataChanges(false)
  }, [world])

  return (
    <>
      {world && (
        <div
          className={`${parentStyles.componentDetailViewWrapper} ${styles.WorldProperties}`}
        >
          <div className={parentStyles.content}>
            <ElementTitle
              title={world.title}
              onUpdate={async (title) => {
                if (world.id) {
                  await api().worlds.saveWorld(studioId, {
                    ...(await api().worlds.getWorld(studioId, world.id)),
                    title
                  })

                  // composerDispatch({
                  //   type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
                  //   renamedElement: {
                  //     id: game.id,
                  //     newTitle: title
                  //   }
                  // })
                }
              }}
            />

            <div className={parentStyles.componentId}>{world.id}</div>
          </div>

          <div className={parentStyles.elementPropertiesNestedCollapse}>
            <Collapse defaultActiveKey={['jump-panel']}>
              <Collapse.Panel
                header="Jump on Start"
                key="jump-panel"
                style={{ borderBottom: 'none' }}
              >
                {scenes && (
                  <div
                    className={`${parentStyles.content} ${styles.jumpPanel}`}
                  >
                    {scenes.length === 0 && (
                      <div className="warningMessage">
                        To modify jump on world start, define at least 1 scene.
                      </div>
                    )}

                    {scenes.length > 0 && (
                      <>
                        {!world.jump && (
                          <>
                            <Button type="primary" onClick={onCreateJump}>
                              Create Jump
                            </Button>
                          </>
                        )}

                        {world.jump && (
                          <>
                            <JumpTo
                              studioId={studioId}
                              jumpId={world.jump}
                              onRemove={async () => {
                                world.id &&
                                  api().worlds.saveJumpRefToWorld(
                                    studioId,
                                    world.id,
                                    null
                                  )
                              }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </Collapse.Panel>
            </Collapse>
          </div>

          <div className={parentStyles.elementPropertiesNestedCollapse}>
            <Collapse defaultActiveKey={['metadata-panel']}>
              <Collapse.Panel header="Metadata" key="metadata-panel">
                <div className={parentStyles.content}>
                  <Form
                    id="save-world-metadata-form"
                    form={metadataForm}
                    initialValues={{
                      copyright: world.copyright,
                      description: world.description,
                      designer: world.designer,
                      version: world.version,
                      website: world.website
                    }}
                    onChange={() => setUnsavedMetadataChanges(true)}
                    onFinish={saveGameMetadata}
                  >
                    <Form.Item
                      label="Designer"
                      name="designer"
                      rules={[
                        { required: true, message: 'Designer is required.' }
                      ]}
                      labelCol={{ span: 10 }}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Version"
                      name="version"
                      rules={[
                        {
                          required: true,
                          message: 'Version is required.'
                        },
                        {
                          message: 'Semantic version required.',
                          validator: (_, value) =>
                            new Promise((resolve, reject) =>
                              semver.valid(value)
                                ? resolve('Valid version.')
                                : reject('Semantic version required.')
                            )
                        }
                      ]}
                      labelCol={{ span: 10 }}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Description"
                      name="description"
                      labelCol={{ span: 10 }}
                    >
                      <Input.TextArea autoSize />
                    </Form.Item>
                    <Form.Item
                      label="Copyright"
                      name="copyright"
                      labelCol={{ span: 10 }}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Website"
                      name="website"
                      labelCol={{ span: 10 }}
                      style={{ marginBottom: unsavedMetadataChanges ? 15 : 0 }}
                    >
                      <Input />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        display: unsavedMetadataChanges ? 'unset' : 'none',
                        width: '100%'
                      }}
                    >
                      Save
                    </Button>
                  </Form>
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>
        </div>
      )}
    </>
  )
}

WorldProperties.displayName = 'WorldProperties'

export default WorldProperties
