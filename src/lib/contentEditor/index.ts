import logger from '../logger'

import { isEqual, uniq } from 'lodash'
import { ipcRenderer } from 'electron'

import { Character, ElementId, Event, StudioId } from '../../data/types'
import { WINDOW_EVENT_TYPE } from '../events'

import {
  BaseRange,
  Descendant,
  Editor,
  Element,
  Element as SlateElement,
  Node,
  Path,
  Range,
  Transforms
} from 'slate'

import {
  ALIGN_TYPE,
  CharacterElement,
  CharacterElementFormatType,
  EditorType,
  ELEMENT_FORMATS,
  EventContentElement,
  EventContentLeaf,
  ImageElement,
  LEAF_FORMATS,
  LIST_TYPES
} from '../../data/eventContentTypes'

import api from '../../api'

export const isElementActive = (
  editor: EditorType,
  format: ELEMENT_FORMATS
) => {
  const { selection } = editor

  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format
    })
  )

  return !!match
}

export const toggleElement = (
  editor: EditorType,
  format: ELEMENT_FORMATS,
  isActive: boolean
) => {
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (node) =>
      !Editor.isEditor(node) &&
      SlateElement.isElement(node) &&
      LIST_TYPES.includes(node.type),
    split: true
  })

  const newProperties: Partial<SlateElement> = {
    type: isActive ? ELEMENT_FORMATS.P : isList ? ELEMENT_FORMATS.LI : format,
    align: undefined
  }

  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = {
      type: format,
      align: undefined,
      children: []
    }

    Transforms.wrapNodes(editor, block)
  }
}

export const isLeafActive = (editor: EditorType, format: LEAF_FORMATS) =>
  Editor.marks(editor)?.[format] ? true : false

export const toggleLeaf = (
  editor: EditorType,
  format: LEAF_FORMATS,
  isActive: boolean
) =>
  isActive
    ? Editor.removeMark(editor, format)
    : Editor.addMark(editor, format, true)

export const isAlignActive = (editor: EditorType, type: ALIGN_TYPE) => {
  const { selection } = editor

  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (node) => {
        const isSupportedAlignType =
          SlateElement.isElement(node) &&
          (node.type === ELEMENT_FORMATS.H1 ||
            node.type === ELEMENT_FORMATS.H2 ||
            node.type === ELEMENT_FORMATS.H3 ||
            node.type === ELEMENT_FORMATS.H4 ||
            node.type === ELEMENT_FORMATS.P)

        return (
          !Editor.isEditor(node) &&
          SlateElement.isElement(node) &&
          isSupportedAlignType &&
          (node.align === type || (!node.align && type === ALIGN_TYPE.LEFT))
        )
      }
    })
  )

  return !!match
}

export const getActiveAlignType = (editor: EditorType) => {
  // TODO: dupe code (isAlignActive)
  const { selection } = editor

  if (!selection) return ALIGN_TYPE.LEFT

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (node) => {
        const isSupportedAlignType =
          SlateElement.isElement(node) &&
          (node.type === ELEMENT_FORMATS.H1 ||
            node.type === ELEMENT_FORMATS.H2 ||
            node.type === ELEMENT_FORMATS.H3 ||
            node.type === ELEMENT_FORMATS.H4 ||
            node.type === ELEMENT_FORMATS.P)

        return (
          !Editor.isEditor(node) &&
          isSupportedAlignType &&
          node.align !== undefined
        )
      }
    })
  )

  if (match) {
    // @ts-ignore
    return match[0].align
  }

  return ALIGN_TYPE.LEFT
}

export const getActiveElementType = (editor: EditorType): ELEMENT_FORMATS => {
  const { selection } = editor

  if (!selection) return ELEMENT_FORMATS.P

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (node) =>
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        node.type !== undefined
    })
  )

  if (match) {
    // @ts-ignore
    return match[0].type
  }

  return ELEMENT_FORMATS.P
}

export const isElementEmpty = (element: EventContentElement) => {
  return element.type === ELEMENT_FORMATS.OL ||
    element.type === ELEMENT_FORMATS.UL
    ? false
    : Element.isElement(element) &&
        !(element.children[0] as { text: string }).text &&
        element.children.length === 1
}

export const isElementEmptyAndSelected = (
  editor: EditorType,
  element: EventContentElement,
  selected: boolean
) => {
  return selected &&
    editor.selection &&
    Range.isCollapsed(editor.selection) &&
    isElementEmpty(element)
    ? true
    : false
}

export const resetElementToParagraph = (
  editor: EditorType,
  selection?: BaseRange
) => {
  if (!editor.selection) return

  Transforms.setNodes(
    editor,
    { type: ELEMENT_FORMATS.P, text: '' },
    {
      at: {
        anchor: selection?.anchor || editor.selection.anchor,
        focus: selection?.focus || editor.selection.focus
      }
    }
  )
}

export const isList = (format: ELEMENT_FORMATS) => LIST_TYPES.includes(format)

// https://github.com/ianstormtaylor/slate/issues/2500
export const deleteAll = (editor: EditorType) => {
  if (!editor.selection) return

  const elementPath = Path.parent(editor.selection?.anchor.path),
    element = Node.get(editor, elementPath)

  if (Element.isElement(element) && element.type === ELEMENT_FORMATS.LI)
    Transforms.unwrapNodes(editor)

  Transforms.delete(editor)
  Transforms.setNodes(editor, {
    type: ELEMENT_FORMATS.P,
    children: [{ text: '' }]
  })
}

const isSupportedAlignType = (element: EventContentElement) =>
  element.type === ELEMENT_FORMATS.H1 ||
  element.type === ELEMENT_FORMATS.H2 ||
  element.type === ELEMENT_FORMATS.H3 ||
  element.type === ELEMENT_FORMATS.H4 ||
  element.type === ELEMENT_FORMATS.P

// similar to getActiveElementType, but not the entire block
export const getElement = (
  editor: EditorType
): {
  element: EventContentElement | undefined
  path: Path | undefined
  alignSupported: boolean
} => {
  const emptyValue = {
    element: undefined,
    path: undefined,
    alignSupported: false
  }

  if (!editor.selection) return emptyValue

  const path = Path.parent(editor.selection.anchor.path),
    element = Node.get(editor, path)

  if (!Element.isElement(element)) return emptyValue

  return { element, path, alignSupported: isSupportedAlignType(element) }
}

// show, filter, target
// https://github.com/usmansbk/slate/blob/755d52453f3fc1f76df9fb3c31ff72f8e5c2cb90/site/examples/mentions-with-space.tsx
export const showCommandMenu = (
  editor: EditorType
): [boolean, string | undefined, BaseRange | undefined] => {
  const { selection } = editor
  // TODO: this should return true with / is types
  // TODO: reuse match code for other symbols like @ and #
  if (!selection || (selection && !Range.isCollapsed(selection)))
    return [false, undefined, undefined]

  const [start] = Range.edges(selection)
  const end =
    start &&
    Editor.before(editor, start, {
      unit: 'offset',
      distance: start.offset
    })
  const textRange = end && Editor.range(editor, end, start)
  const text = textRange && Editor.string(editor, textRange)
  const match = text?.match(/\/(\s?\w*)$/)
  const after = Editor.after(editor, start)
  const afterRange = Editor.range(editor, start, after)
  const afterText = Editor.string(editor, afterRange)
  const afterMatch = afterText.match(/^(\s|$)/)

  if (match && afterMatch) {
    const [targetText, matchText] = match
    const entity = Editor.before(editor, start, {
      unit: 'offset',
      distance: targetText.length
    })

    const targetRange = entity && Editor.range(editor, entity, start)

    // return boolean and filter string
    if (targetRange) return [true, matchText.trim(), targetRange]
  }

  return [false, undefined, undefined]
}

export const getCaretPosition = (element: HTMLElement) => {
  let position = 0

  const selection = window.getSelection()

  if (selection?.rangeCount !== 0) {
    const range = window.getSelection()?.getRangeAt(0),
      preCaretRange = range?.cloneRange()

    preCaretRange?.selectNodeContents(element)
    range?.endContainer &&
      preCaretRange?.setEnd(range.endContainer, range?.endOffset)

    if (preCaretRange) {
      position = preCaretRange.toString().length
    }
  }

  return position
}

export const setCaretToEnd = (element: HTMLElement) => {
  const range = document.createRange()
  const selection = window.getSelection()

  range.selectNodeContents(element)
  range.collapse(false)

  if (!selection) return

  selection.removeAllRanges()
  selection.addRange(range)
  element.focus()
  range.detach() // optimization

  // set scroll to the end if multiline
  element.scrollTop = element.scrollHeight
}

export const flattenEventContent = (
  content: Descendant[],
  elementsOnly?: boolean
): Array<EventContentLeaf | EventContentElement> => {
  const flatEventContent = content.flatMap((element) => {
    return Element.isElement(element) && element.children
      ? [element, ...flattenEventContent(element.children)]
      : element
  })

  return elementsOnly
    ? flatEventContent.filter((element) => Element.isElement(element))
    : flatEventContent
}

export const getCharacterDetailsFromEventContent = (content: Descendant[]) =>
  flattenEventContent(content, true)
    .filter(
      (element): element is CharacterElement =>
        Element.isElement(element) && element.type === ELEMENT_FORMATS.CHARACTER
    )
    .map(({ character_id, alias_id }) => ({
      character_id,
      alias_id
    }))

export const getCharactersIdsFromEventContent = (editor: EditorType) =>
  flattenEventContent(editor.children, true)
    .filter(
      (element): element is CharacterElement =>
        Element.isElement(element) &&
        element.type === ELEMENT_FORMATS.CHARACTER &&
        element.character_id !== undefined
    )
    .map(({ character_id }) => character_id as string)

export const syncCharactersFromEventContentToEventData = async (
  studioId: StudioId,
  event: Event,
  editorCharacterIds: Array<ElementId | undefined>
) => {
  // character is being selected by designer; skip
  if (editorCharacterIds.includes('')) return

  // remove duplicates
  let syncedCharacterIds = uniq(
    editorCharacterIds.filter((id): id is ElementId => id !== undefined)
  )

  !isEqual(syncedCharacterIds, event.characters) &&
    (await api().events.saveEvent(studioId, {
      ...event,
      characters: syncedCharacterIds
    }))
}

export const getCharacterAliasOrTitle = (
  character: Character,
  aliasId?: string
): string | null =>
  aliasId
    ? character.refs.find((ref) => ref[0] === aliasId)?.[1] || null
    : character.title

export const isEndOfLine = (editor: EditorType) => {
  if (!editor.selection) return false

  const afterLocation =
    editor.selection &&
    Editor.after(editor, editor.selection, { unit: 'offset' })

  return afterLocation?.offset === 0 || !afterLocation
}

export const formatCharacterRefDisplay = (
  text: string,
  type?: CharacterElementFormatType
) => {
  switch (type) {
    case 'lower':
      return text.toLowerCase()
    case 'upper':
      return text.toUpperCase()
    case 'cap':
    default:
      return text.replace(
        /(^\w|\s\w)(\S*)/g,
        (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
      )
  }
}

// TODO: dupe code; breakout filtering
export const getImageIdsFromEventContent = (editor: EditorType) =>
  flattenEventContent(editor.children, true)
    .filter(
      (element): element is ImageElement =>
        Element.isElement(element) &&
        element.type === ELEMENT_FORMATS.IMG &&
        element.asset_id !== undefined
    )
    .map(({ asset_id }) => asset_id as string)

export const syncImagesFromEventContentToEventData = async (
  studioId: StudioId,
  event: Event,
  imagesToRemainById: Array<string>,
  imagesToRemoveById: Array<string>
) => {
  if (!event.id) return

  const cachedEventImagesById = [...event.images]

  // syncs images array
  // this must come first
  await api().events.saveEvent(studioId, {
    ...event,
    images: imagesToRemainById
  })

  // If there aren't any images to remove, we can assume that
  // we need to check for images in the trash and move them back
  // i.e. designer performed undo operation
  // we can avoid this when an image is inserted by checking if the image id
  // exists in the cached event.images array before we mutate after
  if (imagesToRemainById.length > 0 && imagesToRemoveById.length === 0) {
    const imagesToRestoreById = imagesToRemainById.filter(
      (imageId) => !cachedEventImagesById.includes(imageId)
    )

    if (imagesToRestoreById.length === 0) return

    await Promise.all(
      imagesToRestoreById.map(async (imageId) => {
        console.log(`RESTORE IMAGE ${imageId}`)

        ipcRenderer.invoke(WINDOW_EVENT_TYPE.RESTORE_ASSET, {
          studioId,
          worldId: event.worldId,
          id: imageId,
          ext: 'webp'
        })
      })
    )

    return
  }

  // next, we need to look at every event to see if any of these images are being used
  // if not, send to .trash or move back to primary
  // record with imageId as key and length of events as value
  await api().events.removeDeadImageAssets(
    studioId,
    event.worldId,
    imagesToRemoveById
  )
}
