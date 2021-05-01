import { Validator, Schema, ValidationError } from 'jsonschema'

import {
  ChapterCollection,
  ChoiceCollection,
  ConditionCollection,
  EffectCollection,
  JumpCollection,
  PassageCollection,
  RootData,
  RouteCollection,
  SceneCollection,
  VariableCollection
} from './getGameDataJSON'

function isValidData(data: any, schema: Schema): [boolean, ValidationError[]] {
  const { errors } = new Validator().validate(data, schema)

  return errors.length === 0 ? [true, []] : [false, errors]
}

export const isRootDataValid = (
  rootData: RootData
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !rootData
    ? [false, [{ message: 'Missing root data' }]]
    : isValidData(rootData, {
        type: 'object',
        properties: {
          chapters: {
            type: 'array',
            items: { type: 'string' }
          },
          designer: { type: 'string' },
          id: { type: 'string' },
          engine: { type: 'string' },
          jump: { type: ['string', 'null'] },
          schema: { type: 'string' },
          studioId: { type: 'string' },
          studioTitle: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          title: { type: 'string' },
          updated: { type: 'number' },
          version: { type: 'string' }
        },
        required: [
          'chapters',
          'designer',
          'id',
          'engine',
          'jump',
          'schema',
          'studioId',
          'studioTitle',
          'tags',
          'title',
          'updated',
          'version'
        ],
        additionalProperties: false
      })

export const isChapterCollectionValid = (
  chapterCollection: ChapterCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !chapterCollection
    ? [false, [{ message: 'Missing chapter collection' }]]
    : isValidData(chapterCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            scenes: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            updated: { type: 'number' }
          },
          minLength: 1,
          required: ['id', 'scenes', 'tags', 'title', 'updated'],
          additionalProperties: false
        }
      })

export const isChoiceCollectionValid = (
  choiceCollection: ChoiceCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !choiceCollection
    ? [false, [{ message: 'Missing choice collection' }]]
    : isValidData(choiceCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            passageId: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            updated: { type: 'number' }
          },
          required: ['id', 'passageId', 'tags', 'title', 'updated'],
          additionalProperties: false
        }
      })

export const isConditionCollectionValid = (
  conditionCollection: ConditionCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !conditionCollection
    ? [false, [{ message: 'Missing condition collection' }]]
    : isValidData(conditionCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            compare: {
              type: 'array',
              items: [
                { type: 'string' },
                { type: 'string' },
                { type: 'string' }
              ],
              minItems: 3,
              additionalItems: false
            },
            id: { type: 'string' },
            routeId: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            updated: { type: 'number' },
            variableId: { type: 'string' }
          },
          required: [
            'compare',
            'id',
            'routeId',
            'tags',
            'title',
            'updated',
            'variableId'
          ],
          additionalProperties: false
        }
      })

export const isEffectCollectionValid = (
  effectCollection: EffectCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !effectCollection
    ? [false, [{ message: 'Missing effect collection' }]]
    : isValidData(effectCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            routeId: { type: 'string' },
            set: {
              type: 'array',
              items: [
                { type: 'string' },
                { type: 'string' },
                { type: 'string' }
              ],
              minItems: 3,
              additionalItems: false
            },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            updated: { type: 'number' },
            variableId: { type: 'string' }
          },
          required: [
            'id',
            'routeId',
            'set',
            'tags',
            'title',
            'updated',
            'variableId'
          ],
          additionalProperties: false
        }
      })

export const isJumpCollectionValid = (
  jumpCollection: JumpCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !jumpCollection
    ? [false, [{ message: 'Missing jump collection' }]]
    : isValidData(jumpCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            editor: {
              type: 'object',
              properties: {
                componentEditorPosX: { type: 'number' },
                componentEditorPosY: { type: 'number' }
              },
              additionalProperties: false
            },
            id: { type: 'string' },
            route: {
              type: 'array',
              items: [
                { type: 'string' },
                { type: 'string' },
                { type: 'string' }
              ],
              additionalItems: false
            },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            updated: { type: 'number' }
          },
          required: ['id', 'route', 'tags', 'title', 'updated'],
          additionalProperties: false
        }
      })

export const isPassageCollectionValid = (
  passageCollection: PassageCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !passageCollection
    ? [false, [{ message: 'Missing passage collection' }]]
    : isValidData(passageCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            choices: { type: 'array', items: { type: 'string' } },
            content: { type: 'string' },
            editor: {
              type: 'object',
              properties: {
                componentEditorPosX: { type: 'number' },
                componentEditorPosY: { type: 'number' }
              },
              additionalProperties: false
            },
            id: { type: 'string' },
            sceneId: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            updated: { type: 'number' }
          },
          required: [
            'choices',
            'content',
            'id',
            'sceneId',
            'tags',
            'title',
            'updated'
          ],
          additionalProperties: false
        }
      })

export const isRouteCollectionValid = (
  routeCollection: RouteCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !routeCollection
    ? [false, [{ message: 'Missing route collection' }]]
    : isValidData(routeCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            choiceId: { type: 'string' },
            destinationId: { type: 'string' },
            destinationType: { type: 'string' },
            id: { type: 'string' },
            originId: { type: 'string' },
            originType: { type: 'string' },
            sceneId: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            updated: { type: 'number' }
          },
          required: [
            'destinationId',
            'destinationType',
            'id',
            'originId',
            'originType',
            'sceneId',
            'tags',
            'title',
            'updated'
          ],
          additionalProperties: false
        }
      })

export const isSceneCollectionValid = (
  sceneCollection: SceneCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !sceneCollection
    ? [false, [{ message: 'Missing scene collection' }]]
    : isValidData(sceneCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            chapterId: { type: 'string' },
            editor: {
              type: 'object',
              properties: {
                componentEditorTransformX: { type: 'number' },
                componentEditorTransformY: { type: 'number' },
                componentEditorTransformZoom: { type: 'number' }
              },
              additionalProperties: false
            },
            id: { type: 'string' },
            jumps: { type: 'array', items: { type: 'string' } },
            passages: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            updated: { type: 'number' }
          },
          required: [
            'chapterId',
            'id',
            'jumps',
            'passages',
            'tags',
            'title',
            'updated'
          ],
          additionalProperties: false
        }
      })

export const isVariableCollectionValid = (
  variableCollection: VariableCollection
): [boolean, ValidationError[] | { path?: string; message: string }[]] =>
  !variableCollection
    ? [false, [{ message: 'Missing variable collection' }]]
    : isValidData(variableCollection, {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            initialValue: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
            type: { type: 'string' },
            updated: { type: 'number' }
          },
          required: ['initialValue', 'id', 'tags', 'title', 'type', 'updated'],
          additionalProperties: false
        }
      })
