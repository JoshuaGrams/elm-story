import React from 'react'

import { GameId, StudioId } from '../../../data/types'

import { useGame } from '../../../hooks'

import ComponentTitle from '../ComponentTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const GameDetails: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = ({ studioId, gameId }) => {
  const game = useGame(studioId, gameId, [gameId])

  return (
    <>
      {game && (
        <div className={styles.componentDetailViewContent}>
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
          <div className={styles.componentId}>{game.id}</div>
        </div>
      )}
    </>
  )
}

export default GameDetails
