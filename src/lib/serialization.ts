import { Descendant } from 'slate'
import { StudioId } from '../../engine/src/types'
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
                childNode as EventContentNode
              )
          )
        )
      ).join('')}</p>`
    : ''

  switch (node.type) {
    case ELEMENT_FORMATS.CHARACTER:
      const character = node.character_id
        ? await api().characters.getCharacter(studioId, node.character_id)
        : undefined

      return character
        ? getCharacterRefDisplayFormat(
            (await getCharacterAliasOrTitle(character, node.alias_id)) || '',
            node.transform || 'cap'
          ).text || ''
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
  content: string
): Promise<{ asset_id?: string; text?: string }> => {
  const children: EventContentNode[] = JSON.parse(content)

  const text = (
    await Promise.all(
      children
        .filter((childNode) => isTextNode(childNode))
        .map(
          async (childNode) =>
            await serializeDescendantToText(studioId, childNode)
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
