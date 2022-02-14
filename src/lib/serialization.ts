// #UPDATE
import { ipcRenderer } from 'electron'
import { getSvgUrl } from '.'

import { ImageSelectPlaceholder } from '../components/ElementEditor/EventContent/Tools/ImageElementSelect'

import { StudioId, WorldId } from '../../engine/src/types'
import { ELEMENT_FORMATS, EventContentNode } from '../data/eventContentTypes'
import {
  getCharacterAliasOrTitle,
  getCharacterRefDisplayFormat
} from './contentEditor'
import { WINDOW_EVENT_TYPE } from './events'

import api from '../api'

const serializeDescendantToText = async (
  studioId: StudioId,
  worldId: WorldId,
  node: EventContentNode
): Promise<string> => {
  if (node.text) {
    return node.text
  }

  const text: string = node.children
    ? `<div>${(
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
      ).join('')}</div>`
    : ''

  switch (node.type) {
    case ELEMENT_FORMATS.IMG:
      // TODO: show missing pic if doesn't exist
      const [path, exists]: [string, boolean] = await ipcRenderer.invoke(
        WINDOW_EVENT_TYPE.GET_ASSET,
        {
          studioId,
          worldId,
          id: node.asset_id,
          ext: 'webp'
        }
      )

      return `<div class="event-content-preview-image" style="background-image: url(${
        exists ? path.replaceAll('"', '') : getSvgUrl(ImageSelectPlaceholder)
      });"></div>`
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
        : `<span data-type="missing-character" data-character-id="${node.character_id}"></span>`
    case ELEMENT_FORMATS.OL:
    case ELEMENT_FORMATS.UL:
      return node.children
        ? `<div>${(
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
          ).join('')}</div>`
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
    text: text === '<div></div>' ? undefined : text
  }
}
