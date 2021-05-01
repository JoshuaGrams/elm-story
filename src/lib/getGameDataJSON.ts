import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  COMPONENT_TYPE,
  GameId,
  SET_OPERATOR_TYPE,
  StudioId,
  VARIABLE_TYPE
} from '../data/types'

import api from '../api'

export interface RootData {
  chapters: ComponentId[]
  designer: string
  id: string
  engine: string
  jump: string | null
  schema: string
  studioId: StudioId
  studioTitle: string
  tags: string[]
  title: string
  updated: number
  version: string
}

export interface ChapterData {
  id: ComponentId
  scenes: ComponentId[]
  tags: string[]
  title: string
  updated: number
}

export interface ChapterCollection {
  [chapterId: string]: ChapterData
}

export interface ChoiceData {
  id: ComponentId
  passageId: ComponentId
  tags: string[]
  title: string
  updated: number
}

export interface ChoiceCollection {
  [choiceId: string]: ChoiceData
}

export interface ConditionData {
  compare: [ComponentId, COMPARE_OPERATOR_TYPE, string]
  id: ComponentId
  routeId: ComponentId
  tags: string[]
  title: string
  updated: number
  variableId: ComponentId
}

export interface ConditionCollection {
  [conditionId: string]: ConditionData
}

export interface EffectData {
  id: ComponentId
  routeId: ComponentId
  set: [ComponentId, SET_OPERATOR_TYPE, string]
  tags: string[]
  title: string
  updated: number
  variableId: string
}

export interface EffectCollection {
  [effectId: string]: EffectData
}

export interface JumpData {
  editor?: {
    componentEditorPosX?: number
    componentEditorPosY?: number
  }
  id: ComponentId
  route: [ComponentId?, ComponentId?, ComponentId?]
  tags: string[]
  title: string
  updated: number
}

export interface JumpCollection {
  [jumpId: string]: JumpData
}

export interface PassageData {
  choices: ComponentId[]
  content: string
  editor?: {
    componentEditorPosX?: number
    componentEditorPosY?: number
  }
  id: ComponentId
  sceneId: ComponentId
  tags: string[]
  title: string
  updated: number
}

export interface PassageCollection {
  [passageId: string]: PassageData
}

export interface RouteData {
  choiceId?: ComponentId
  destinationId: ComponentId
  destinationType: COMPONENT_TYPE
  id: ComponentId
  originId: ComponentId
  originType: COMPONENT_TYPE
  sceneId: ComponentId
  tags: string[]
  title: string
  updated: number
}

export interface RouteCollection {
  [routeId: string]: RouteData
}

export interface SceneData {
  chapterId: ComponentId
  editor?: {
    componentEditorTransformX?: number
    componentEditorTransformY?: number
    componentEditorTransformZoom?: number
  }
  id: ComponentId
  jumps: ComponentId[]
  passages: ComponentId[]
  tags: string[]
  title: string
  updated: number
}

export interface SceneCollection {
  [sceneId: string]: SceneData
}

export interface VariableData {
  id: ComponentId
  initialValue: string
  tags: string[]
  title: string
  type: VARIABLE_TYPE
  updated: number
}

export interface VariableCollection {
  [variableId: string]: VariableData
}

export interface GameDataJSON {
  _: RootData
  chapters: ChapterCollection
  choices: ChoiceCollection
  conditions: ConditionCollection
  effects: EffectCollection
  jumps: JumpCollection
  passages: PassageCollection
  routes: RouteCollection
  scenes: SceneCollection
  variables: VariableCollection
}

export default async (
  studioId: StudioId,
  gameId: GameId,
  schemaVersion: string
): Promise<string> => {
  try {
    const studio = await api().studios.getStudio(studioId),
      game = await api().games.getGame(studioId, gameId)

    const chapters = await api().chapters.getChaptersByGameRef(
        studioId,
        gameId
      ),
      choices = await api().choices.getChoicesByGameRef(studioId, gameId),
      conditions = await api().conditions.getConditionsByGameRef(
        studioId,
        gameId
      ),
      effects = await api().effects.getEffectsByGameRef(studioId, gameId),
      jumps = await api().jumps.getJumpsByGameRef(studioId, gameId),
      routes = await api().routes.getRoutesByGameRef(studioId, gameId),
      passages = await api().passages.getPassagesByGameRef(studioId, gameId),
      scenes = await api().scenes.getScenesByGameRef(studioId, gameId),
      variables = await api().variables.getVariablesByGameRef(studioId, gameId)

    let gameData: GameDataJSON = {
      _: {
        chapters: game.chapters,
        designer: game.designer,
        id: game.id as ComponentId,
        engine: game.engine,
        jump: game.jump,
        schema: `https://elmstory.com/schema/elm-story-${schemaVersion}.json`,
        studioId: studioId,
        studioTitle: studio?.title as string,
        tags: game.tags,
        title: game.title,
        updated: game.updated as number,
        version: game.version
      },
      chapters: {},
      choices: {},
      conditions: {},
      effects: {},
      jumps: {},
      passages: {},
      routes: {},
      scenes: {},
      variables: {}
    }

    chapters.map(
      ({ id, scenes, tags, title, updated }) =>
        (gameData.chapters[id as string] = {
          id: id as string,
          scenes,
          tags,
          title,
          updated: updated as number
        })
    )

    choices.map(
      ({ id, passageId, tags, title, updated }) =>
        (gameData.choices[id as string] = {
          id: id as string,
          passageId,
          tags,
          title,
          updated: updated as number
        })
    )

    conditions.map(
      ({ compare, id, routeId, tags, title, updated, variableId }) =>
        (gameData.conditions[id as string] = {
          compare: [compare[0], compare[1], compare[2]],
          id: id as string,
          routeId,
          tags,
          title,
          updated: updated as number,
          variableId
        })
    )

    effects.map(
      ({ id, routeId, set, tags, title, updated, variableId }) =>
        (gameData.effects[id as string] = {
          id: id as string,
          routeId,
          set,
          tags,
          title,
          updated: updated as number,
          variableId
        })
    )

    jumps.map(
      ({ editor, id, route, tags, title, updated }) =>
        (gameData.jumps[id as string] = {
          editor,
          id: id as string,
          route,
          tags,
          title,
          updated: updated as number
        })
    )

    passages.map(
      ({ choices, content, editor, id, sceneId, tags, title, updated }) =>
        (gameData.passages[id as string] = {
          choices,
          content,
          editor,
          id: id as string,
          sceneId,
          tags,
          title,
          updated: updated as number
        })
    )

    routes.map(
      ({
        choiceId,
        destinationId,
        destinationType,
        id,
        originId,
        originType,
        sceneId,
        tags,
        title,
        updated
      }) =>
        (gameData.routes[id as string] = {
          choiceId,
          destinationId,
          destinationType,
          id: id as string,
          originId,
          originType,
          sceneId,
          tags,
          title,
          updated: updated as number
        })
    )

    scenes.map(
      ({ chapterId, editor, id, jumps, passages, tags, title, updated }) =>
        (gameData.scenes[id as string] = {
          chapterId,
          editor,
          id: id as string,
          jumps,
          passages,
          tags,
          title,
          updated: updated as number
        })
    )

    variables.map(
      ({ id, initialValue, tags, title, type, updated }) =>
        (gameData.variables[id as string] = {
          id: id as string,
          initialValue,
          tags,
          title,
          type,
          updated: updated as number
        })
    )

    return JSON.stringify(gameData, null, 2)
  } catch (error) {
    throw error
  }
}
