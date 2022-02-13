// #UPDATE
import { getCharacterRefDisplayFormat } from '.'
import { StudioId, WorldId } from '../types'
import { ELEMENT_FORMATS, EventContentNode } from '../types/eventContentTypes'

import { getCharacterReference } from './api'

const wrapNodeContent = (node: EventContentNode, text: string) => {
  switch (node.type) {
    case ELEMENT_FORMATS.P:
      return `<p style="text-align:${node.align || ''}">${text}</p>`
    case ELEMENT_FORMATS.H1:
      return `<h1 style="text-align:${node.align || ''}">${text}</h1>`
    case ELEMENT_FORMATS.H2:
      return `<h2 style="text-align:${node.align || ''}">${text}</h2>`
    case ELEMENT_FORMATS.H3:
      return `<h3 style="text-align:${node.align || ''}">${text}</h3>`
    case ELEMENT_FORMATS.H4:
      return `<h4 style="text-align:${node.align || ''}">${text}</h4>`
    case ELEMENT_FORMATS.LI:
      return `<li>${text}</li>`
    case ELEMENT_FORMATS.BLOCKQUOTE:
      return `<blockquote>${text}</blockquote>`
    default:
      return `<div>${text}</div>`
  }
}

const serializeDescendantToText = async (
  studioId: StudioId,
  worldId: WorldId,
  node: EventContentNode,
  isComposer?: boolean
): Promise<string> => {
  let formattedNode: string = node.text

  if (node.text) {
    if (node.u) {
      formattedNode = `<u>${formattedNode}</u>`
    }

    if (node.em) {
      formattedNode = `<em>${formattedNode}</em>`
    }

    if (node.strong) {
      formattedNode = `<strong>${formattedNode}</strong>`
    }

    if (node.s) {
      formattedNode = `<s>${formattedNode}</s>`
    }

    return formattedNode
  }

  const text: string = node.children
    ? `${wrapNodeContent(
        node,
        (
          await Promise.all(
            node.children.map(
              async (childNode) =>
                await serializeDescendantToText(
                  studioId,
                  worldId,
                  childNode as EventContentNode,
                  isComposer
                )
            )
          )
        ).join('')
      )}`
    : ''

  switch (node.type) {
    case ELEMENT_FORMATS.IMG:
      // replaced with instance of ElementImage
      return `<div data-type="img" data-asset-id="${node.asset_id}"></div>`
    case ELEMENT_FORMATS.CHARACTER:
      if (!node.character_id) return ''

      return `<span data-type="character" data-character-id="${node.character_id}" data-character-alias-id="${node.alias_id}" data-character-ref-transform="${node.transform}" data-character-ref-styles="${node.styles}"></span>`
    case ELEMENT_FORMATS.OL:
    case ELEMENT_FORMATS.UL:
      return node.children
        ? `${node.type === ELEMENT_FORMATS.OL ? '<ol>' : '<ul>'}${(
            await Promise.all(
              node.children.map(
                async (childNode) =>
                  await serializeDescendantToText(
                    studioId,
                    worldId,
                    childNode as EventContentNode,
                    isComposer
                  )
              )
            )
          ).join('')}${node.type === ELEMENT_FORMATS.OL ? '</ol>' : '</ul>'}`
        : ''
    default:
      return text
  }
}

export const eventContentToEventStreamContent = async (
  studioId: StudioId,
  worldId: WorldId,
  content: EventContentNode[],
  isComposer?: boolean
) => {
  const children: EventContentNode[] = content,
    startingElement =
      children[0].type === ELEMENT_FORMATS.IMG
        ? await serializeDescendantToText(
            studioId,
            worldId,
            children[0],
            isComposer
          )
        : undefined

  const text = (
    await Promise.all(
      children
        // .filter((childNode) => isTextNode(childNode))
        .map(async (childNode, index) => {
          // if (startingElement && index === 0) return ''

          return await serializeDescendantToText(
            studioId,
            worldId,
            childNode,
            isComposer
          )
        })
    )
  )
    .filter((text) => text)
    .join('')

  return {
    startingElement,
    text:
      text === '<div></div>'
        ? `<div class="engine-warning-message">Event content required.</div>`
        : text
  }
}
