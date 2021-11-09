import semver from 'semver'

import React, { useEffect, useState } from 'react'

import { GameId, StudioId } from '../../../data/types'

import { useGame, useScenes } from '../../../hooks'

import { Button, Collapse, Form, Input } from 'antd'

import ComponentTitle from '../ComponentTitle'
import JumpTo from '../../JumpTo'

import parentStyles from '../styles.module.less'
import styles from './styles.module.less'

import api from '../../../api'

const GameDetails: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = ({ studioId, gameId }) => {
  const game = useGame(studioId, gameId, [studioId, gameId]),
    scenes = useScenes(studioId, gameId, [studioId, gameId])

  const [metadataForm] = Form.useForm()

  const [unsavedMetadataChanges, setUnsavedMetadataChanges] = useState(false)

  async function onCreateJump() {
    if (game?.id && scenes && scenes[0].id) {
      const { id: jumpId } = await api().jumps.saveJump(studioId, {
        gameId: game.id,
        title: 'On Game Start Jump',
        route: [scenes[0].id],
        tags: []
      })

      jumpId && (await api().games.saveJumpRefToGame(studioId, gameId, jumpId))
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
    if (game?.id) {
      setUnsavedMetadataChanges(false)

      try {
        await api().games.saveGame(studioId, {
          ...(await api().games.getGame(studioId, game.id)),
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
  }, [game])

  return (
    <>
      {game && (
        <div
          className={`${parentStyles.componentDetailViewWrapper} ${styles.GameDetails}`}
        >
          <div className={parentStyles.content}>
            <ComponentTitle
              title={game.title}
              onUpdate={async (title) => {
                if (game.id) {
                  await api().games.saveGame(studioId, {
                    ...(await api().games.getGame(studioId, game.id)),
                    title
                  })
                }
              }}
            />

            <div className={parentStyles.componentId}>{game.id}</div>
          </div>

          <div className={parentStyles.componentDetailViewNestedCollapse}>
            <Collapse defaultActiveKey={['jump-panel']}>
              <Collapse.Panel
                header="Jump on Game Start"
                key="jump-panel"
                style={{ borderBottom: 'none' }}
              >
                {scenes && (
                  <div
                    className={`${parentStyles.content} ${styles.jumpPanel}`}
                  >
                    {scenes.length === 0 && (
                      <div className="warningMessage">
                        To define jump on game start, games require at least 1
                        scene.
                      </div>
                    )}

                    {scenes.length > 0 && (
                      <>
                        {!game.jump && (
                          <>
                            <Button type="primary" onClick={onCreateJump}>
                              Create Jump
                            </Button>
                          </>
                        )}

                        {game.jump && (
                          <>
                            <JumpTo
                              studioId={studioId}
                              jumpId={game.jump}
                              onRemove={async () => {
                                game.id &&
                                  api().games.saveJumpRefToGame(
                                    studioId,
                                    game.id,
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

          <div className={parentStyles.componentDetailViewNestedCollapse}>
            <Collapse defaultActiveKey={['metadata-panel']}>
              <Collapse.Panel header="Metadata" key="metadata-panel">
                <div className={parentStyles.content}>
                  <Form
                    id="save-game-metadata-form"
                    form={metadataForm}
                    initialValues={{
                      copyright: game.copyright,
                      description: game.description,
                      designer: game.designer,
                      version: game.version,
                      website: game.website
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
                          validator: (rule, value) =>
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

export default GameDetails
