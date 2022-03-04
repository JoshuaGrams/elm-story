import { v4 as uuid } from 'uuid'

import { isElementEmptyAndSelected } from '../../../lib/contentEditor'

import React, { useContext, useState } from 'react'

import { StudioId, WorldId } from '../../../data/types'

import { ComposerContext } from '../../../contexts/ComposerContext'

import Icon from '@ant-design/icons'

import { Draggable } from 'react-beautiful-dnd'
import { Transforms, Editor } from 'slate'
import { ReactEditor, useSelected, useSlate } from 'slate-react'

import {
  ALIGN_TYPE,
  CharacterElement as CharacterElementType,
  ELEMENT_FORMATS,
  EmbedElement as EmbedElementType,
  EventContentElement,
  ImageElement as ImageElementType,
  LinkElement as LinkElementType
} from '../../../data/eventContentTypes'

import CharacterElementSelect, {
  OnCharacterSelect
} from './Tools/CharacterElementSelect'
import ImageElementSelect, { OnImageSelect } from './Tools/ImageElementSelect'

import styles from './styles.module.less'
import LinkElementEditor from './Tools/LinkElementEditor'

const CharacterElement: React.FC<{
  studioId: StudioId
  worldId: WorldId
  onCharacterSelect: OnCharacterSelect
  element: CharacterElementType
  attributes: {}
}> = ({
  studioId,
  worldId,
  onCharacterSelect,
  element,
  attributes,
  children
}) => {
  const selected = useSelected()

  const { character_id, alias_id, transform, styles: _styles } = element

  return (
    <span
      {...attributes}
      style={{
        display: 'inline-block'
      }}
      className={`${styles.character} ${selected ? styles.selected : ''}`}
      data-slate-editor
    >
      <CharacterElementSelect
        studioId={studioId}
        worldId={worldId}
        element={element}
        selectedCharacter={
          character_id
            ? { character_id, alias_id, transform, styles: _styles }
            : undefined
        }
        onCharacterSelect={onCharacterSelect}
      />

      {children}
    </span>
  )
}

const ImageElement: React.FC<{
  studioId: StudioId
  worldId: WorldId
  element: ImageElementType
  attributes: {}
  onImageSelect: OnImageSelect
}> = ({ studioId, worldId, element, attributes, onImageSelect, children }) => {
  return (
    <div {...attributes} className={`${styles.img}`}>
      {children}

      <ImageElementSelect
        studioId={studioId}
        worldId={worldId}
        element={element}
        onImageSelect={onImageSelect}
      />
    </div>
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

// TODO: necessary?
const InlineChromiumBugfix = () => (
  <span contentEditable={false} style={{ fontSize: 0 }}>
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
)

const LinkElement: React.FC<{ element: LinkElementType; attributes: {} }> = ({
  element,
  attributes,
  children
}) => {
  return (
    <LinkElementEditor element={element}>
      <span
        {...attributes}
        className={`${styles.link} ${!element.url ? styles.error : ''}`}
      >
        {/* <InlineChromiumBugfix /> */}
        {children}
        {/* <InlineChromiumBugfix /> */}
      </span>
    </LinkElementEditor>
  )
}

const DraggableWrapper: React.FC<{ element: EventContentElement }> = ({
  element,
  children
}) => {
  const editor = useSlate()

  const [draggableId] = useState(uuid())

  const { composer } = useContext(ComposerContext)

  const selectElement = () => {
    const elementPosition = ReactEditor.findPath(editor, element)[0]

    Transforms.select(editor, {
      anchor: Editor.start(editor, [elementPosition]),
      focus: Editor.end(editor, [elementPosition])
    })
  }

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
            onClick={selectElement}
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
                  <rect width="14" height="18" rx="2" fill="#8E4CFF" />
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
  studioId?: StudioId
  worldId?: WorldId
  onCharacterSelect?: OnCharacterSelect
  onImageSelect?: OnImageSelect
  element: EventContentElement
  attributes: {}
}> = ({
  studioId,
  worldId,
  onCharacterSelect,
  onImageSelect,
  element,
  attributes,
  children
}) => {
  const editor = useSlate(),
    selected = useSelected()

  let content: JSX.Element | undefined = undefined

  const _isElementEmptyAndSelected = isElementEmptyAndSelected(
    editor,
    element,
    selected
  )

  switch (element.type) {
    case ELEMENT_FORMATS.BLOCKQUOTE:
      content = (
        <div className={styles.blockquoteWrapper}>
          <blockquote
            className={_isElementEmptyAndSelected ? styles.empty : ''}
            {...attributes}
          >
            {children}
          </blockquote>
        </div>
      )
      break
    case ELEMENT_FORMATS.UL:
      content = <ul {...attributes}>{children}</ul>
      break
    case ELEMENT_FORMATS.H1:
      content = (
        <h1
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          className={_isElementEmptyAndSelected ? styles.empty : ''}
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
          className={_isElementEmptyAndSelected ? styles.empty : ''}
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
          className={_isElementEmptyAndSelected ? styles.empty : ''}
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
          className={_isElementEmptyAndSelected ? styles.empty : ''}
          {...attributes}
        >
          {children}
        </h4>
      )
      break
    case ELEMENT_FORMATS.LI:
      content = (
        <li
          className={_isElementEmptyAndSelected ? styles.empty : ''}
          {...attributes}
        >
          {children}
        </li>
      )
      break
    case ELEMENT_FORMATS.OL:
      content = <ol {...attributes}>{children}</ol>
      break
    case ELEMENT_FORMATS.IMG:
      if (!studioId || !worldId || !onImageSelect)
        throw 'Unable to render image element.'

      content = (
        <ImageElement
          studioId={studioId}
          worldId={worldId}
          element={element}
          attributes={attributes}
          onImageSelect={onImageSelect}
        >
          {children}
        </ImageElement>
      )
      break
    case ELEMENT_FORMATS.CHARACTER:
      if (!studioId || !worldId || !onCharacterSelect)
        throw 'Unable to render character element.'

      content = (
        <CharacterElement
          studioId={studioId}
          worldId={worldId}
          onCharacterSelect={onCharacterSelect}
          element={element}
          attributes={attributes}
        >
          {children}
        </CharacterElement>
      )
      break
    case ELEMENT_FORMATS.EMBED:
      content = (
        <EmbedElement element={element} attributes={attributes}>
          {children}
        </EmbedElement>
      )
      break
    case ELEMENT_FORMATS.LINK:
      content = (
        <LinkElement element={element} attributes={attributes}>
          {children}
        </LinkElement>
      )
      break
    default:
      content = (
        <p
          draggable="false"
          style={{ textAlign: element.align || ALIGN_TYPE.LEFT }}
          className={_isElementEmptyAndSelected ? styles.empty : ''}
          {...attributes}
        >
          {children}
        </p>
      )
      break
  }

  return element.type === ELEMENT_FORMATS.LI ||
    element.type === ELEMENT_FORMATS.CHARACTER ||
    element.type === ELEMENT_FORMATS.LINK ? (
    content
  ) : (
    <DraggableWrapper element={element}>{content}</DraggableWrapper>
  )
}

export default Element
