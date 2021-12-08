import { cloneDeep, Many, pick } from 'lodash'
// @ts-ignore
import lzwCompress from 'lzwcompress'

import {
  ELEMENT_TYPE,
  WorldDataJSON,
  ESGEngineCollectionData
} from '../transport/types/0.6.0'

function filterCollectionChildProps<T extends object, U extends keyof T>(
  collectionToFilter: { [ElementId: string]: T },
  props: Many<U>
) {
  const filteredCollection: { [ElementId: string]: Pick<T, U> } = {}

  Object.keys(collectionToFilter).map(
    (objectId) =>
      (filteredCollection[objectId] = pick(collectionToFilter[objectId], props))
  )

  return filteredCollection
}

function format(worldData: WorldDataJSON): string {
  const {
    _,
    characters,
    choices,
    conditions,
    effects,
    events,
    inputs,
    jumps,
    paths,
    scenes,
    variables
  }: WorldDataJSON = cloneDeep(worldData)

  // TODO: fix types
  // @ts-ignore
  return lzwCompress.pack({
    _: {
      children: worldData._.children
        .filter((child) => child[0] === ELEMENT_TYPE.SCENE)
        .map((child) => child),
      ...pick(_, [
        'copyright',
        'description',
        'designer',
        'engine',
        'id',
        'jump',
        'schema',
        'studioId',
        'studioTitle',
        'tags',
        'title',
        'updated',
        'version',
        'website'
      ])
    },
    characters: filterCollectionChildProps(characters, [
      'id',
      'masks',
      'refs',
      'title'
    ]),
    choices: filterCollectionChildProps(choices, ['id', 'eventId', 'title']),
    // @ts-ignore
    conditions: filterCollectionChildProps(conditions, [
      'compare',
      'id',
      'pathId',
      'variableId'
    ]),
    // @ts-ignore
    effects: filterCollectionChildProps(effects, [
      'id',
      'pathId',
      'set',
      'variableId'
    ]),
    events: filterCollectionChildProps(events, [
      'choices',
      'content',
      'ending',
      'id',
      'input',
      'persona',
      'sceneId',
      'type'
    ]),
    inputs: filterCollectionChildProps(inputs, ['id', 'eventId', 'variableId']),
    jumps: filterCollectionChildProps(jumps, ['id', 'path', 'sceneId']),
    paths: filterCollectionChildProps(paths, [
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
    ]),
    worlds: {}
  } as ESGEngineCollectionData)
}

export default format
