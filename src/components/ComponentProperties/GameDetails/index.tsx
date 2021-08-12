import React from 'react'

import { GameId, StudioId } from '../../../data/types'

import { useGame, useScenes } from '../../../hooks'

import { Button, Collapse } from 'antd'

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
              <Collapse.Panel header="Jump on Game Start" key="jump-panel">
                {scenes && (
                  <div
                    className={`${parentStyles.content} ${styles.jumpPanel}`}
                  >
                    {scenes.length === 0 && (
                      <div>
                        To define jump on game start, games require at least
                        1 scene.
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
        </div>
      )}
    </>
  )
}

export default GameDetails
