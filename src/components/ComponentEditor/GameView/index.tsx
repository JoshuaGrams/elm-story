import React, { useEffect } from 'react'
import logger from '../../../lib/logger'

import { GameId, StudioId } from '../../../data/types'

import { useGame } from '../../../hooks'

import EngineProvider from '../../../contexts/EngineContext'

import { Table } from 'antd'

import GameEngine from '../../GameEngine'

export const GameViewTools: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = () => {
  return <div>Game View Tools</div>
}

const GameView: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = ({ studioId, gameId }) => {
  const game = useGame(studioId, gameId)

  useEffect(() => {
    logger.info('GameView mount effect')
  }, [])

  return (
    <>
      {game && (
        <>
          <Table
            columns={[
              { title: 'ID', key: 'id', dataIndex: 'id' },
              { title: 'Title', key: 'title', dataIndex: 'title' },
              {
                title: 'Chapters',
                key: 'chapterTotal',
                dataIndex: 'chapterTotal'
              }
            ]}
            dataSource={[
              {
                key: game.id,
                id: game.id,
                title: game.title,
                chapterTotal: game.chapters.length
              }
            ]}
            pagination={false}
          />

          <EngineProvider>
            <GameEngine studioId={studioId} gameId={gameId} />
          </EngineProvider>
        </>
      )}
    </>
  )
}

export default GameView
