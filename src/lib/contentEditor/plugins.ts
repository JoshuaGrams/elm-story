import { Editor, Node, Path, Range, Transforms } from 'slate'

import {
  ELEMENT_FORMATS,
  EditorType,
  EventContentElement,
  ImageElement
} from '../../data/eventContentTypes'

export const withCorrectVoidBehavior = (editor: EditorType) => {
  const { deleteBackward, insertBreak } = editor

  // if current selection is void node, insert a default node below
  editor.insertBreak = () => {
    if (!editor.selection || !Range.isCollapsed(editor.selection)) {
      return insertBreak()
    }

    const selectedNodePath = Path.parent(editor.selection.anchor.path)
    const selectedNode = Node.get(editor, selectedNodePath)

    if (Editor.isVoid(editor, selectedNode)) {
      Editor.insertNode(editor, {
        type: ELEMENT_FORMATS.P,
        children: [{ text: '' }]
      })
      return
    }

    insertBreak()
  }

  // if prev node is a void node, remove the current node and select the void node
  editor.deleteBackward = (unit) => {
    if (
      !editor.selection ||
      !Range.isCollapsed(editor.selection) ||
      editor.selection.anchor.offset !== 0
    ) {
      return deleteBackward(unit)
    }

    const parentPath = Path.parent(editor.selection.anchor.path)
    const parentNode = Node.get(editor, parentPath)
    const parentIsEmpty = Node.string(parentNode).length === 0

    if (parentIsEmpty && Path.hasPrevious(parentPath)) {
      const prevNodePath = Path.previous(parentPath)
      const prevNode = Node.get(editor, prevNodePath)
      if (Editor.isVoid(editor, prevNode)) {
        return Transforms.removeNodes(editor)
      }
    }

    deleteBackward(unit)
  }

  return editor
}

export const insertImage = (editor: EditorType, url?: string) => {
  const image: ImageElement = {
    type: ELEMENT_FORMATS.IMG,
    url,
    children: [{ text: '' }]
  }

  Transforms.insertNodes(editor, image)
}

export const withImages = (editor: Editor) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element: EventContentElement) => {
    return element.type === ELEMENT_FORMATS.IMG ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      // @ts-ignore
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            url && insertImage(editor, url as string)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (text) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

export const withEmbeds = (editor: EditorType) => {
  const { isVoid } = editor

  editor.isVoid = (element) =>
    element.type === ELEMENT_FORMATS.EMBED ? true : isVoid(element)

  return editor
}
