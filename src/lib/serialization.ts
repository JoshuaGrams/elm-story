import { ipcRenderer } from 'electron'
import { Descendant } from 'slate'
import { StudioId, WorldId } from '../../engine/src/types'
import api from '../api'
import {
  ELEMENT_FORMATS,
  EventContentElement,
  EventContentLeaf,
  EventContentNode,
  SUPPORTED_TEXT_BLOCK_NODE
} from '../data/eventContentTypes'
import {
  getCharacterAliasOrTitle,
  getCharacterRefDisplayFormat
} from './contentEditor'
import { WINDOW_EVENT_TYPE } from './events'

const isTextBlockNode = (node: EventContentNode) =>
  SUPPORTED_TEXT_BLOCK_NODE.includes(node.type)

const isTextNode = (node: EventContentNode) =>
  SUPPORTED_TEXT_BLOCK_NODE.includes(node.type)

const serializeDescendantToHTML = (node: EventContentNode) => {
  if (node.type === ELEMENT_FORMATS.IMG) {
  }

  if (isTextBlockNode(node)) {
  }
}

export const eventContentToHTML = (content: string, assetBasePath: string) => {
  const children: EventContentNode[] = JSON.parse(content)

  return content
}

const serializeDescendantToText = async (
  studioId: StudioId,
  worldId: WorldId,
  node: EventContentNode
): Promise<string> => {
  if (node.text) {
    return node.text
  }

  const text: string = node.children
    ? `<p>${(
        await Promise.all(
          node.children.map(
            async (childNode) =>
              await serializeDescendantToText(
                studioId,
                worldId,
                childNode as EventContentNode
              )
          )
        )
      ).join('')}</p>`
    : ''

  switch (node.type) {
    case ELEMENT_FORMATS.IMG:
      // TODO: show missing pic if doesn't exist
      const [path]: [string, boolean] = await ipcRenderer.invoke(
        WINDOW_EVENT_TYPE.GET_ASSET,
        {
          studioId,
          worldId,
          id: node.asset_id,
          ext: 'webp'
        }
      )

      return (
        '<div class="event-content-preview-image" style="background-image: url(' +
        `${path.replaceAll('"', '')}` +
        ');"></div>'
      )
    case ELEMENT_FORMATS.CHARACTER:
      const character = node.character_id
        ? await api().characters.getCharacter(studioId, node.character_id)
        : undefined

      return character
        ? `<span class="event-content-preview-character" title="Character: ${
            character.title
          }">${
            getCharacterRefDisplayFormat(
              (await getCharacterAliasOrTitle(character, node.alias_id)) || '',
              node.transform || 'cap'
            ).text
          }</span>` || ''
        : ''
    case ELEMENT_FORMATS.OL:
    case ELEMENT_FORMATS.UL:
      return node.children
        ? `<p>${(
            await Promise.all(
              node.children.map(
                async (childNode) =>
                  await serializeDescendantToText(
                    studioId,
                    worldId,
                    childNode as EventContentNode
                  )
              )
            )
          ).join('')}</p>`
        : ''
    default:
      return text
  }
}

export const eventContentToPreview = async (
  studioId: StudioId,
  worldId: WorldId,
  content: string
): Promise<{ asset_id?: string; text?: string }> => {
  const children: EventContentNode[] = JSON.parse(content)

  const text = (
    await Promise.all(
      children
        // .filter((childNode) => isTextNode(childNode))
        .map(
          async (childNode) =>
            await serializeDescendantToText(studioId, worldId, childNode)
        )
    )
  )
    .filter((text) => text)
    .join('')

  return {
    asset_id:
      children[0].type === ELEMENT_FORMATS.IMG
        ? children[0].asset_id || undefined
        : undefined,
    text: text === '<p></p>' ? undefined : text
  }
}
