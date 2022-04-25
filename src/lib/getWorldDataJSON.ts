import { eventContentToHTML } from './serial/html'

import {
  ElementId,
  WorldId,
  StudioId,
  WorldDataJSON,
  WorldChildRefs,
  FolderChildRefs,
  FolderParentRef,
  ELEMENT_TYPE,
  EVENT_TYPE,
  SceneChildRefs,
  SceneParentRef
} from './transport/types/0.7.1'

import api from '../api'

export default async (
  studioId: StudioId,
  worldId: WorldId,
  schemaVersion: string,
  serializeContentToHTML: boolean
): Promise<string> => {
  try {
    const studio = await api().studios.getStudio(studioId),
      world = await api().worlds.getWorld(studioId, worldId)

    const characters = await api().characters.getCharactersByWorldRef(
        studioId,
        worldId
      ),
      choices = await api().choices.getChoicesByWorldRef(studioId, worldId),
      conditions = await api().conditions.getConditionsByWorldRef(
        studioId,
        worldId
      ),
      effects = await api().effects.getEffectsByWorldRef(studioId, worldId),
      events = await api().events.getEventsByWorldRef(studioId, worldId),
      folders = await api().folders.getFoldersByWorldRef(studioId, worldId),
      inputs = await api().inputs.getInputsByWorldRef(studioId, worldId),
      jumps = await api().jumps.getJumpsByWorldRef(studioId, worldId),
      paths = await api().paths.getPathsByWorldRef(studioId, worldId),
      scenes = await api().scenes.getScenesByWorldRef(studioId, worldId),
      variables = await api().variables.getVariablesByWorldRef(
        studioId,
        worldId
      )

    let worldData: WorldDataJSON = {
      _: {
        children: world.children as WorldChildRefs,
        copyright: world.copyright,
        description: world.description,
        designer: world.designer,
        engine: schemaVersion,
        id: world.id as ElementId,
        jump: world.jump,
        schema: `https://elmstory.com/schema/elm-story-${schemaVersion}.json`,
        studioId: studioId,
        studioTitle: studio?.title as string,
        tags: world.tags,
        title: world.title,
        updated: world.updated as number,
        version: world.version,
        website: world.website
      },
      characters: {},
      choices: {},
      conditions: {},
      effects: {},
      events: {},
      folders: {},
      inputs: {},
      jumps: {},
      paths: {},
      scenes: {},
      variables: {}
    }

    characters.map(
      ({ description, id, masks, refs, tags, title, updated }) =>
        (worldData.characters[id as string] = {
          description,
          id: id as string,
          masks,
          refs,
          tags,
          title,
          updated: updated as number
        })
    )

    choices.map(
      ({ id, eventId, tags, title, updated }) =>
        (worldData.choices[id as string] = {
          id: id as string,
          eventId,
          tags,
          title,
          updated: updated as number
        })
    )

    conditions.map(
      ({ compare, id, pathId, tags, title, updated, variableId }) =>
        (worldData.conditions[id as string] = {
          compare,
          id: id as string,
          pathId,
          tags,
          title,
          updated: updated as number,
          variableId
        })
    )

    effects.map(
      ({ id, pathId, set, tags, title, updated, variableId }) =>
        (worldData.effects[id as string] = {
          id: id as string,
          pathId,
          set,
          tags,
          title,
          updated: updated as number,
          variableId
        })
    )

    await Promise.all(
      events.map(
        async ({
          audio,
          characters,
          choices,
          content,
          composer,
          ending,
          id,
          images,
          input,
          persona,
          sceneId,
          tags,
          title,
          type,
          updated
        }) =>
          (worldData.events[id as string] = {
            audio,
            characters,
            choices,
            content: serializeContentToHTML
              ? (
                  await eventContentToHTML(
                    studioId,
                    worldId,
                    JSON.parse(content)
                  )
                ).text
              : content,
            composer,
            ending,
            id: id as string,
            input,
            images,
            persona,
            sceneId,
            tags,
            title,
            type,
            updated: updated as number
          })
      )
    )

    folders.map(
      ({ children, id, parent, tags, title, updated }) =>
        (worldData.folders[id as string] = {
          children: children as FolderChildRefs,
          id: id as string,
          parent: parent as FolderParentRef,
          tags,
          title,
          updated: updated as number
        })
    )

    inputs.map(
      ({ id, eventId, tags, title, updated, variableId }) =>
        (worldData.inputs[id as string] = {
          id: id as string,
          eventId,
          tags,
          title,
          updated: updated as number,
          variableId
        })
    )

    jumps.map(
      ({ composer, id, path, sceneId, tags, title, updated }) =>
        (worldData.jumps[id as string] = {
          composer,
          id: id as string,
          path,
          sceneId,
          tags,
          title,
          updated: updated as number
        })
    )

    paths.map(
      ({
        choiceId,
        conditionsType,
        destinationId,
        destinationType,
        id,
        inputId,
        originId,
        originType,
        sceneId,
        tags,
        title,
        updated
      }) =>
        (worldData.paths[id as string] = {
          choiceId,
          conditionsType,
          destinationId,
          destinationType: destinationType as ELEMENT_TYPE,
          id: id as string,
          inputId,
          originId,
          originType: originType as ELEMENT_TYPE | EVENT_TYPE,
          sceneId,
          tags,
          title,
          updated: updated as number
        })
    )

    scenes.map(
      ({ audio, children, composer, id, parent, tags, title, updated }) =>
        (worldData.scenes[id as string] = {
          audio,
          children: children as SceneChildRefs,
          composer,
          id: id as string,
          parent: parent as SceneParentRef,
          tags,
          title,
          updated: updated as number
        })
    )

    variables.map(
      ({ id, initialValue, tags, title, type, updated }) =>
        (worldData.variables[id as string] = {
          id: id as string,
          initialValue,
          tags,
          title,
          type,
          updated: updated as number
        })
    )

    return JSON.stringify(worldData, null, 2)
  } catch (error) {
    throw error
  }
}
