import { cloneDeep, Many, pick } from 'lodash'
// @ts-ignore
import lzwCompress from 'lzwcompress'

import {
  COMPONENT_TYPE,
  GameDataJSON,
  ESGEngineCollectionData
} from '../transport/types/0.5.0'

function filterCollectionChildProps<T extends object, U extends keyof T>(
  collectionToFilter: { [ComponentId: string]: T },
  props: Many<U>
) {
  const filteredCollection: { [ComponentId: string]: Pick<T, U> } = {}

  Object.keys(collectionToFilter).map(
    (objectId) =>
      (filteredCollection[objectId] = pick(collectionToFilter[objectId], props))
  )

  return filteredCollection
}

function format(gameData: GameDataJSON): string {
  const {
    _,
    choices,
    conditions,
    effects,
    inputs,
    jumps,
    passages,
    routes,
    scenes,
    variables
  }: GameDataJSON = cloneDeep(gameData)

  return lzwCompress.pack({
    _: {
      children: gameData._.children
        .filter((child) => child[0] === COMPONENT_TYPE.SCENE)
        .map((child) => child),
      ...pick(_, [
        'engine',
        'designer',
        'id',
        'jump',
        'schema',
        'studioId',
        'studioTitle',
        'tags',
        'title',
        'updated',
        'version'
      ])
    },
    choices: filterCollectionChildProps(choices, ['id', 'passageId', 'title']),
    conditions: filterCollectionChildProps(conditions, [
      'compare',
      'id',
      'routeId',
      'variableId'
    ]),
    effects: filterCollectionChildProps(effects, [
      'id',
      'routeId',
      'set',
      'variableId'
    ]),
    games: {},
    inputs: filterCollectionChildProps(inputs, [
      'id',
      'passageId',
      'variableId'
    ]),
    jumps: filterCollectionChildProps(jumps, ['id', 'route', 'sceneId']),
    passages: filterCollectionChildProps(passages, [
      'choices',
      'content',
      'gameOver',
      'id',
      'input',
      'sceneId',
      'type'
    ]),
    routes: filterCollectionChildProps(routes, [
      'choiceId',
      'destinationId',
      'destinationType',
      'id',
      'inputId',
      'originId',
      'originType',
      'sceneId'
    ]),
    scenes: filterCollectionChildProps(scenes, ['children', 'id', 'jumps']),
    variables: filterCollectionChildProps(variables, [
      'id',
      'initialValue',
      'title',
      'type'
    ])
  } as ESGEngineCollectionData)
}

export default format
