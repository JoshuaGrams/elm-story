import {
  BaseRange,
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

export const getActiveElementType = (editor: EditorType) => {
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

export const isElementEmpty = (element: EventContentElement) =>
  element.type === ELEMENT_FORMATS.OL || element.type === ELEMENT_FORMATS.UL
    ? false
    : (element.children[0] as { text: string }).text.length === 0

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
