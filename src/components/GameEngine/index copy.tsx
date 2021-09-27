import logger from '../../lib/logger'

import React, { useContext, useEffect, useRef } from 'react'

import {
  ComponentId,
  COMPONENT_TYPE,
  GameId,
  GameState,
  StudioId
} from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import { useGame, useJumps, useScenes, useVariables } from '../../hooks'

import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import GameStateView from './GameStateView'
import GameStylesView from './GameStylesView'
import SceneRenderer from './SceneRenderer'

import styles from './styles.module.less'

import api from '../../api'

const gameEngineDevTools: LayoutData = {
  dockbox: {
    mode: 'horizontal',
    children: [
      {
        tabs: [
          {
            id: 'gameStateTab',
            title: 'State',
            content: <GameStateView />,
            group: 'default'
          },
          {
            id: 'gameStylesTab',
            title: 'Styles',
            content: <GameStylesView />,
            group: 'default'
          }
        ]
      }
    ]
  }
}

const GameEngine: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
  const engineRef = useRef<HTMLDivElement>(null)

  const game = useGame(studioId, gameId, [studioId, gameId]),
    variables = useVariables(studioId, gameId, [studioId, gameId]),
    jumps = useJumps(studioId, gameId, [studioId, gameId]),
    scenes = useScenes(studioId, gameId, [studioId, gameId])

  const { engine, engineDispatch } = useContext(EngineContext)

  useEffect(() => {
    logger.info(`GameEngine->game,jumps->useEffect`)

    async function setup() {
      if (game && variables && jumps && scenes) {
        if (game.jump) {
          const foundJump = jumps?.find((jump) => jump.id === game.jump)

          if (foundJump) {
            if (foundJump.route[0] && !foundJump.route[1]) {
              const scene = await api().scenes.getScene(
                studioId,
                foundJump.route[0]
              )

              engineDispatch({
                type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
                currentPassage:
                  scene && scene.children[0] ? scene.children[0][1] : null
              })

              engineDispatch({
                type: ENGINE_ACTION_TYPE.PASSAGE_START,
                startingPassage:
                  scene && scene.children[0] ? scene.children[0][1] : null
              })
            }

            if (foundJump.route[1]) {
              engineDispatch({
                type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
                currentPassage: foundJump.route[1]
              })

              engineDispatch({
                type: ENGINE_ACTION_TYPE.PASSAGE_START,
                startingPassage: foundJump.route[1]
              })
            }

            engineDispatch({
              type: ENGINE_ACTION_TYPE.SCENE_START,
              startingScene: foundJump?.route[0] || null
            })

            engineDispatch({
              type: ENGINE_ACTION_TYPE.SCENE_CURRENT,
              currentScene: foundJump?.route[0] || null
            })
          }
        }

        if (!game.jump) {
          const rootScenes = game.children.filter(
            (child) => child[0] === COMPONENT_TYPE.SCENE
          )
          let defaultSceneId: ComponentId | null = null

          if (rootScenes.length > 0) {
            defaultSceneId = rootScenes[0][1]
          }

          if (rootScenes.length === 0 && scenes.length > 0) {
            defaultSceneId = scenes[0].id || null
          }

          if (defaultSceneId) {
            const scene = await api().scenes.getScene(studioId, defaultSceneId)

            engineDispatch({
              type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
              currentPassage:
                scene && scene.children[0] ? scene.children[0][1] : null
            })

            engineDispatch({
              type: ENGINE_ACTION_TYPE.PASSAGE_START,
              startingPassage:
                scene && scene.children[0] ? scene.children[0][1] : null
            })
          }

          if (!defaultSceneId) {
            engineDispatch({
              type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
              currentPassage: null
            })

            engineDispatch({
              type: ENGINE_ACTION_TYPE.PASSAGE_START,
              startingPassage: null
            })
          }

          engineDispatch({
            type: ENGINE_ACTION_TYPE.SCENE_CURRENT,
            currentScene: defaultSceneId
          })

          engineDispatch({
            type: ENGINE_ACTION_TYPE.SCENE_START,
            startingScene: defaultSceneId
          })
        }
      }
    }

    setup()
  }, [game, variables, jumps, scenes])

  useEffect(() => {
    logger.info(`GameEngine->variables->useEffect`)

    if (variables) {
      const newGameState: GameState = {}

      variables.map((variable) => {
        if (variable.id) {
          newGameState[variable.id] = {
            title: variable.title,
            type: variable.type,
            initialValue: `${variable.initialValue}`,
            currentValue: `${
              newGameState[variable.id]?.currentValue || variable.initialValue
            }`
          }
        }
      })

      engineDispatch({
        type: ENGINE_ACTION_TYPE.GAME_STATE,
        gameState: newGameState
      })
    }
  }, [variables])

  useEffect(() => {
    logger.info(
      `GameEngine->engine.scrollTo->useEffect->${engine.scrollTo.top},${engine.scrollTo.left}`
    )

    engineRef.current && engineRef.current.scrollIntoView(true)
  }, [engine.scrollTo])

  useEffect(() => {
    logger.info(`GameEngine->engine.gameState->useEffect`)
  }, [variables, engine.gameState])

  return (
    <>
      {game && variables && jumps && (
        <>
          <DividerBox mode="vertical" className={styles.GameEngine}>
            <div className={styles.rendererContainer}>
              <div className="es-engine" ref={engineRef}>
                {(engine.currentScene || engine.startingScene) && (
                  <SceneRenderer
                    studioId={studioId}
                    // @ts-ignore
                    sceneId={engine.currentScene || engine.startingScene}
                  />
                )}

                {!engine.startingScene && (
                  <div className="es-engine-passage-no-content">
                    Game requires at least 1 scene and passage to play.
                  </div>
                )}
              </div>
            </div>

            <DockLayout
              defaultLayout={gameEngineDevTools}
              groups={{
                default: {
                  floatable: false,
                  animated: false,
                  maximizable: false,
                  tabLocked: true
                }
              }}
              dropMode="edge"
            />
          </DividerBox>
        </>
      )}
    </>
  )
}

export default GameEngine
