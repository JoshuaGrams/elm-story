import { Editor, Element as SlateElement, Transforms } from 'slate'

import {
  ALIGN_TYPE,
  ELEMENT_FORMATS,
  LEAF_FORMATS,
  LIST_TYPES
} from '../../data/eventContentTypes'

export const isElementActive = (editor: Editor, format: ELEMENT_FORMATS) => {
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
  editor: Editor,
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

export const isLeafActive = (editor: Editor, format: LEAF_FORMATS) =>
  Editor.marks(editor)?.[format] ? true : false

export const toggleLeaf = (
  editor: Editor,
  format: LEAF_FORMATS,
  isActive: boolean
) =>
  isActive
    ? Editor.removeMark(editor, format)
    : Editor.addMark(editor, format, true)

export const isAlignActive = (editor: Editor, type: ALIGN_TYPE) => {
  const { selection } = editor

  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        const isSupportedAlignType =
          SlateElement.isElement(n) &&
          (n.type === ELEMENT_FORMATS.H1 ||
            n.type === ELEMENT_FORMATS.H2 ||
            n.type === ELEMENT_FORMATS.H3 ||
            n.type === ELEMENT_FORMATS.H4 ||
            n.type === ELEMENT_FORMATS.P)

        return (
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          isSupportedAlignType &&
          (n.align === type || (!n.align && type === ALIGN_TYPE.LEFT))
        )
      }
    })
  )

  return !!match
}

export const getActiveAlign = (editor: Editor) => {
  // TODO: dupe code (isAlignActive)
  const { selection } = editor

  if (!selection) return ALIGN_TYPE.LEFT

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        const isSupportedAlignType =
          SlateElement.isElement(n) &&
          (n.type === ELEMENT_FORMATS.H1 ||
            n.type === ELEMENT_FORMATS.H2 ||
            n.type === ELEMENT_FORMATS.H3 ||
            n.type === ELEMENT_FORMATS.H4 ||
            n.type === ELEMENT_FORMATS.P)

        return (
          !Editor.isEditor(n) && isSupportedAlignType && n.align !== undefined
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
