// upgrades 0.1.3 data to 0.2.0
import { cloneDeep, pick } from 'lodash-es'

import { ELEMENT_TYPE } from '../../../data/types'
import { GameDataJSON as GameDataJSON_013 } from '../types/0.1.3'
import {
  FolderCollection,
  GameDataJSON as GameDataJSON_020,
  SceneCollection
} from '../types/0.2.0'

export default ({
  _,
  chapters,
  choices,
  conditions,
  effects,
  jumps,
  passages,
  routes,
  scenes,
  variables
}: GameDataJSON_013): GameDataJSON_020 => {
  const clonedChapters = cloneDeep(chapters),
    folders: FolderCollection = {}

  Object.keys(clonedChapters).map((chapterId) => {
    folders[chapterId] = {
      children: clonedChapters[chapterId].scenes.map((sceneId) => [
        ELEMENT_TYPE.SCENE,
        sceneId
      ]),
      parent: [ELEMENT_TYPE.GAME, null],
      ...pick(clonedChapters[chapterId], ['id', 'tags', 'title', 'updated'])
    }
  })

  const upgradedJumps = cloneDeep(jumps)

  Object.keys(upgradedJumps).map((jumpId) =>
    upgradedJumps[jumpId].route.shift()
  )

  const clonedScenes = cloneDeep(scenes),
    upgradedScenes: SceneCollection = {}

  Object.keys(clonedScenes).map((sceneId) => {
    const clonedScene = clonedScenes[sceneId]

    upgradedScenes[sceneId] = {
      children: clonedScene.passages.map((passageId) => [
        ELEMENT_TYPE.PASSAGE,
        passageId
      ]),
      parent: [ELEMENT_TYPE.FOLDER, clonedScene.chapterId],
      ...pick(clonedScene, [
        'editor',
        'id',
        'jumps',
        'tags',
        'title',
        'updated'
      ])
    }
  })

  return {
    _: {
      children: _.chapters.map((chapterId) => [ELEMENT_TYPE.FOLDER, chapterId]),
      engine: '0.2.0',
      ...pick(_, [
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
    choices,
    conditions,
    effects,
    folders,
    jumps: upgradedJumps,
    passages,
    routes,
    scenes: upgradedScenes,
    variables
  }
}
