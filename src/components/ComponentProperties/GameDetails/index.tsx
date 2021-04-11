import React from 'react'

import { GameId, StudioId } from '../../../data/types'

import { useGame } from '../../../hooks'

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
  const game = useGame(studioId, gameId, [studioId, gameId])

  async function onCreateJump() {
    if (game?.id) {
      const { id: jumpId } = await api().jumps.saveJump(studioId, {
        gameId: game.id,
        title: 'On Game Start Jump',
        route: [game.chapters[0]],
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
                <div className={`${parentStyles.content} ${styles.jumpPanel}`}>
                  {game.chapters.length === 0 && (
                    <div>
                      To define a custom jump at start, games require at least 1
                      chapter.
                    </div>
                  )}

                  {game.chapters.length > 0 && (
                    <>
                      {!game.jump && (
                        <>
                          <div>
                            By default, games start on the first chapter, scene
                            and passage.
                          </div>
                          <Button onClick={onCreateJump}>Create Jump</Button>
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
              </Collapse.Panel>
            </Collapse>
          </div>
        </div>
      )}
    </>
  )
}

export default GameDetails
