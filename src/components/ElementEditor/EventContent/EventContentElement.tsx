import { v4 as uuid } from 'uuid'

import React from 'react'

import { DeleteOutlined } from '@ant-design/icons'
import { Button } from 'antd'

import { Draggable } from 'react-beautiful-dnd'
import { Transforms } from 'slate'
import {
  ReactEditor,
  useFocused,
  useSelected,
  useSlate,
  useSlateStatic
} from 'slate-react'

import {
  ALIGN_TYPE,
  BLOCK_FORMATS,
  EmbedElement as EmbedElementType,
  EventContentElement,
  ImageElement as ImageElementType
} from '../../../data/eventContentTypes'

const ImageElement: React.FC<{ element: ImageElementType; attributes: {} }> = ({
  element,
  attributes,
  children
}) => {
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, element)
  const focused = useFocused()
  const selected = useSelected()

  return element.url ? (
    <div {...attributes}>
      {children}

      <div
        className={`content-image ${selected ? 'selected' : ''}`}
        style={{
          boxShadow: `${
            selected && focused ? '0 0 0 3px var(--highlight-color)' : 'none'
          }`
        }}
        contentEditable={false}
      >
        <img
          draggable="false"
          src={element.url}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '30em'
          }}
        />
        <Button
          className="remove-image-button"
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '10px'
          }}
        >
          <DeleteOutlined
            onClick={() => Transforms.removeNodes(editor, { at: path })}
          />
        </Button>
      </div>
    </div>
  ) : (
    <div>missing image</div>
  )
}

const EmbedElement: React.FC<{ element: EmbedElementType; attributes: {} }> = ({
  element,
  attributes,
  children
}) => {
  return element.url ? (
    <div {...attributes}>
      <div contentEditable={false}>
        <div
          style={{
            padding: '62.5% 0 0 0',
            position: 'relative'
          }}
        >
          <iframe
            src={`${element.url}?title=0&byline=0&portrait=0`}
            frameBorder="0"
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      </div>
      {children}
    </div>
  ) : (
    <div>missing embed</div>
  )
}

const DraggableWrapper: React.FC<{ element: EventContentElement }> = ({
  element,
  children
}) => {
  const editor = useSlate()

  return (
    <Draggable
      draggableId={uuid()}
      index={ReactEditor.findPath(editor, element)[0]}
    >
      {(provided) => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          <div
            contentEditable={false}
            style={{
              position: 'absolute',
              left: '-15px',
              width: '10px',
              height: '20px',
              background: 'var(--highlight-color)',
              borderRadius: '2px'
            }}
            {...provided.dragHandleProps}
          />
          {children}
        </div>
      )}
    </Draggable>
  )
}

export const Element: React.FC<{
  element: EventContentElement
  attributes: {}
}> = ({ element, attributes, children }) => {
  let content: JSX.Element | undefined = undefined

  switch (element.type) {
    case BLOCK_FORMATS.BLOCKQUOTE:
      content = <blockquote {...attributes}>{children}</blockquote>
      break
    case BLOCK_FORMATS.UL:
      content = <ul {...attributes}>{children}</ul>
      break
    case BLOCK_FORMATS.H1:
      content = (
        <h1
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </h1>
      )
      break
    case BLOCK_FORMATS.H2:
      content = (
        <h2
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </h2>
      )
      break
    case BLOCK_FORMATS.H3:
      content = (
        <h3
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </h3>
      )
      break
    case BLOCK_FORMATS.H4:
      content = (
        <h4
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </h4>
      )
      break
    case BLOCK_FORMATS.LI:
      content = <li {...attributes}>{children}</li>
      break
    case BLOCK_FORMATS.OL:
      content = <ol {...attributes}>{children}</ol>
      break
    case BLOCK_FORMATS.IMG:
      content = (
        <ImageElement element={element} attributes={attributes}>
          {children}
        </ImageElement>
      )
      break
    case BLOCK_FORMATS.EMBED:
      content = (
        <EmbedElement element={element} attributes={attributes}>
          {children}
        </EmbedElement>
      )
      break
    default:
      content = (
        <p
          draggable="false"
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </p>
      )
      break
  }

  return element.type === BLOCK_FORMATS.LI ? (
    content
  ) : (
    <DraggableWrapper element={element}>{content}</DraggableWrapper>
  )
}

export default Element
