import { Editor, Element as SlateElement, Range, Transforms } from 'slate'

import {
  ALIGN_TYPE,
  EditorType,
  ELEMENT_FORMATS,
  EventContentElement,
  LEAF_FORMATS,
  LIST_TYPES
} from '../../data/eventContentTypes'

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
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true
  })

  const newProperties: Partial<SlateElement> = {
    type: isActive ? ELEMENT_FORMATS.P : isList ? ELEMENT_FORMATS.LI : format
  }

  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, align: ALIGN_TYPE.LEFT, children: [] }
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

export const getActiveAlign = (editor: EditorType) => {
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
          !Editor.isEditor(node) && isSupportedAlignType && node.align !== undefined
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

export const isElementEmpty = (element: EventContentElement) =>
  (element.children[0] as { text: string }).text.length === 0

export const isElementEmptyAndSelected = (
  editor: EditorType,
  element: EventContentElement,
  selected: boolean
) =>
  selected &&
  editor.selection &&
  Range.isCollapsed(editor.selection) &&
  isElementEmpty(element)
    ? true
    : false
