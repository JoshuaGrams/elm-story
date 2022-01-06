import { v4 as uuid } from 'uuid'

import React, { useContext, useState } from 'react'

import { Button } from 'antd'
import Icon, { DeleteOutlined } from '@ant-design/icons'

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
  ELEMENT_FORMATS,
  EmbedElement as EmbedElementType,
  EventContentElement,
  ImageElement as ImageElementType
} from '../../../data/eventContentTypes'

import styles from './styles.module.less'
import { ComposerContext } from '../../../contexts/ComposerContext'

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

  const [draggableId] = useState(uuid())

  const { composer } = useContext(ComposerContext)

  return (
    <Draggable
      draggableId={draggableId}
      index={ReactEditor.findPath(editor, element)[0]}
    >
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={styles.DraggableWrapper}
        >
          <div
            contentEditable={false}
            className={styles.dragHandle}
            style={
              composer.draggableEventContentElement
                ? {
                    opacity: 0
                  }
                : {}
            }
            {...provided.dragHandleProps}
          >
            <Icon
              component={() => (
                <svg
                  width="14"
                  height="18"
                  viewBox="0 0 14 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 2C0 0.89543 0.895431 0 2 0H14V18H2C0.89543 18 0 17.1046 0 16V2Z"
                    fill="#8E4CFF"
                  />
                  <circle cx="5" cy="5" r="1" fill="white" />
                  <circle cx="9" cy="5" r="1" fill="white" />
                  <circle cx="5" cy="9" r="1" fill="white" />
                  <circle cx="9" cy="9" r="1" fill="white" />
                  <circle cx="5" cy="13" r="1" fill="white" />
                  <circle cx="9" cy="13" r="1" fill="white" />
                </svg>
              )}
            />
          </div>

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
    case ELEMENT_FORMATS.BLOCKQUOTE:
      content = <blockquote {...attributes}>{children}</blockquote>
      break
    case ELEMENT_FORMATS.UL:
      content = <ul {...attributes}>{children}</ul>
      break
    case ELEMENT_FORMATS.H1:
      content = (
        <h1
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </h1>
      )
      break
    case ELEMENT_FORMATS.H2:
      content = (
        <h2
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </h2>
      )
      break
    case ELEMENT_FORMATS.H3:
      content = (
        <h3
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </h3>
      )
      break
    case ELEMENT_FORMATS.H4:
      content = (
        <h4
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          {...attributes}
        >
          {children}
        </h4>
      )
      break
    case ELEMENT_FORMATS.LI:
      content = <li {...attributes}>{children}</li>
      break
    case ELEMENT_FORMATS.OL:
      content = <ol {...attributes}>{children}</ol>
      break
    case ELEMENT_FORMATS.IMG:
      content = (
        <ImageElement element={element} attributes={attributes}>
          {children}
        </ImageElement>
      )
      break
    case ELEMENT_FORMATS.EMBED:
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

  return element.type === ELEMENT_FORMATS.LI ? (
    content
  ) : (
    <DraggableWrapper element={element}>{content}</DraggableWrapper>
  )
}

export default Element
