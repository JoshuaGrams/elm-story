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
  node: EventContentNode
): Promise<string> => {
  if (node.text) {
    if (node.u) {
      return `<u>${node.text}</u>`
    }

    if (node.em) {
      return `<em>${node.text}</em>`
    }

    if (node.strong) {
      return `<strong>${node.text}</strong>`
    }

    if (node.s) {
      return `<s>${node.text}</s>`
    }

    return node.text
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
                  childNode as EventContentNode
                )
            )
          )
        ).join('')
      )}`
    : ''

  switch (node.type) {
    case ELEMENT_FORMATS.IMG:
      return `<div class="event-content-image" style="background-image: url(../../data/0-7-test_0.0.1/assets/${node.asset_id}.webp);"></div>`
    case ELEMENT_FORMATS.CHARACTER:
      const displayFormat = node.character_id
        ? getCharacterRefDisplayFormat(
            (await getCharacterReference(
              studioId,
              node.character_id,
              node.alias_id
            )) || '',
            node.transform || 'cap',
            node.styles
          )
        : null

      return `<span class="event-content-character" style="fontWeight:${
        displayFormat?.styles?.fontWeight || ''
      }; fontStyle:${displayFormat?.styles?.fontStyle || ''}; textDecoration:${
        displayFormat?.styles?.textDecoration || ''
      };">${displayFormat?.text || ''}</span>`
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
                    childNode as EventContentNode
                  )
              )
            )
          ).join('')}</ol>`
        : ''
    default:
      return text
  }
}

export const eventContentToEventStreamContent = async (
  studioId: StudioId,
  worldId: WorldId,
  content: string
) => {
  const children: EventContentNode[] = JSON.parse(content),
    startingElement =
      children[0].type === ELEMENT_FORMATS.IMG
        ? await serializeDescendantToText(studioId, worldId, children[0])
        : undefined

  const text = (
    await Promise.all(
      children
        // .filter((childNode) => isTextNode(childNode))
        .map(async (childNode, index) => {
          if (startingElement && index === 0) return ''

          return await serializeDescendantToText(studioId, worldId, childNode)
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
