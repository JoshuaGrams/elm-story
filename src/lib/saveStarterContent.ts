import { v4 as uuid } from 'uuid'

import {
  StudioId,
  ElementId,
  World,
  ELEMENT_TYPE,
  Event,
  EVENT_TYPE,
  WORLD_TEMPLATE,
  PATH_CONDITIONS_TYPE
} from '../data/types'

import api from '../api'

export default async ({
  appVersion,
  studioId,
  worldTitle,
  worldDesigner
}: {
  appVersion: string
  studioId: StudioId
  worldTitle: string
  worldDesigner: string
}): Promise<World> => {
  const worldId = uuid(),
    sceneId = uuid(),
    introEventId = uuid(),
    resourcesEventId = uuid(),
    connectingPathId = uuid()

  const promises: [
    Promise<World>, // world data
    Promise<ElementId>, // base scene id
    Promise<Event>, // intro event data
    Promise<Event>, // resources event data
    Promise<ElementId> // connecting path id
  ] = [
    api().worlds.saveWorld(studioId, {
      children: [[ELEMENT_TYPE.SCENE, sceneId]],
      designer: worldDesigner,
      engine: appVersion,
      id: worldId,
      jump: null,
      // TODO: Enable user-defined once more templates are supported.
      template: WORLD_TEMPLATE.ADVENTURE,
      title: worldTitle,
      tags: [],
      // TODO: Move to defines/types.
      version: '0.0.1'
    }),
    api().scenes.saveScene(studioId, {
      id: sceneId,
      children: [
        [ELEMENT_TYPE.EVENT, introEventId],
        [ELEMENT_TYPE.EVENT, resourcesEventId]
      ],
      composer: {
        sceneMapTransformX: -158.6576402321083,
        sceneMapTransformY: -117.9864603481625,
        sceneMapTransformZoom: 1.4622823984526112
      },
      parent: [ELEMENT_TYPE.WORLD, null],
      tags: [],
      title: 'Getting Started with Elm Story',
      worldId
    }),
    api().events.saveEvent(studioId, {
      id: introEventId,
      characters: [],
      choices: [],
      content:
        '[{"type":"h1","children":[{"text":"Welcome to Elm Story"}]},{"type":"p","children":[{"text":"...and your new storyworld!"}]},{"type":"p","children":[{"text":"We\'ve generated this sample content to help you get started."}]},{"type":"p","children":[{"text":"Click the arrow below to view available resources."}]}]',
      composer: {
        sceneMapPosX: 132,
        sceneMapPosY: 192
      },
      ending: false,
      images: [],
      sceneId,
      tags: [],
      title: 'Introduction',
      type: EVENT_TYPE.CHOICE,
      worldId
    }),
    api().events.saveEvent(studioId, {
      id: resourcesEventId,
      characters: [],
      choices: [],
      content:
        '[{"type":"h2","children":[{"text":"Helpful Resources"}]},{"type":"p","children":[{"text":"Throughout the interface are help (❔) buttons that will lead you to specific information within Elm Story\'s online documentation."}]},{"type":"p","children":[{"text":"We also post tutorial videos to our "},{"type":"link","url":"https://elmstory.com/tutorials/","children":[{"text":"YouTube channel"}]},{"text":"."}]},{"type":"blockquote","children":[{"text":"Elm Story is currently in early access. Major features, enhancements and fixes are under active development. If you need additional help, "},{"type":"link","url":"https://elmstory.com/help/","children":[{"text":"join"}]},{"text":" our Discord server."}]},{"type":"p","children":[{"text":"For updates, follow "},{"type":"link","url":"https://elmstory.com/twitter/","children":[{"text":"@elmstorygames"}]},{"text":" on Twitter."}]},{"type":"p","children":[{"text":""},{"type":"link","url":"https://elmstory.com/community/","children":[{"text":"Join our community"}]},{"text":" to submit feedback, get help and share your work!"}]},{"type":"h2","children":[{"text":"Support Elm Story"}]},{"type":"p","children":[{"text":"If you find Elm Story useful, consider supporting development by donating via "},{"type":"link","url":"https://elmstory.com/donate/","children":[{"text":"Itch"}]},{"text":" and becoming a "},{"type":"link","url":"https://elmstory.com/subscribe/","children":[{"text":"monthly patron"}]},{"text":". 🙌"}]}]',
      composer: {
        sceneMapPosX: 400,
        sceneMapPosY: 192
      },
      ending: true,
      images: [],
      sceneId,
      tags: [],
      title: 'Resources',
      type: EVENT_TYPE.CHOICE,
      worldId
    }),
    api().paths.savePath(studioId, {
      conditionsType: PATH_CONDITIONS_TYPE.ALL,
      destinationId: resourcesEventId,
      destinationType: ELEMENT_TYPE.EVENT,
      id: connectingPathId,
      originId: introEventId,
      originType: EVENT_TYPE.CHOICE,
      sceneId,
      tags: [],
      title: 'Connecting Path',
      worldId
    })
  ]

  try {
    const [savedWorld] = await Promise.all(promises)

    return savedWorld
  } catch (error) {
    throw error
  }
}
