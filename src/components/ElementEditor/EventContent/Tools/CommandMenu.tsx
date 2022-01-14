import React, { useEffect, useRef, useState } from 'react'

import { BaseRange } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'

import { ELEMENT_FORMATS } from '../../../../data/eventContentTypes'
import { getActiveElementType } from '../../../../lib/contentEditor'

import Portal from '../../../Portal'

import styles from './styles.module.less'

interface MenuItem {
  type: string
  title: string
  additionalMatches?: string[]
}

enum TOP_OFFSET {
  h1 = 0,
  h2 = 6,
  h3 = 14,
  h4 = 20,
  blockquote = 18,
  ol = 16,
  ul = 16,
  p = 16
}

const FORMAT_MENU_ITEMS: MenuItem[] = [
  { type: ELEMENT_FORMATS.P, title: 'Text', additionalMatches: ['paragraph'] },
  {
    type: ELEMENT_FORMATS.H1,
    title: 'Heading 1',
    additionalMatches: ['h1', 'header', '1']
  },
  {
    type: ELEMENT_FORMATS.H2,
    title: 'Heading 2',
    additionalMatches: ['h2', 'header', '2']
  },
  {
    type: ELEMENT_FORMATS.H3,
    title: 'Heading 3',
    additionalMatches: ['h3', 'header', '3']
  },
  {
    type: ELEMENT_FORMATS.H4,
    title: 'Heading 4',
    additionalMatches: ['h4', 'header', '4']
  },
  {
    type: ELEMENT_FORMATS.BLOCKQUOTE,
    title: 'Quote',
    additionalMatches: ['blockquote']
  },
  {
    type: ELEMENT_FORMATS.OL,
    title: 'Numbered List',
    additionalMatches: ['ordered']
  },
  {
    type: ELEMENT_FORMATS.UL,
    title: 'Bulleted List',
    additionalMatches: ['unordered']
  }
]

const ELEMENT_MENU_ITEMS: MenuItem[] = [
  {
    type: ELEMENT_FORMATS.CHARACTER,
    title: 'Character Reference',
    additionalMatches: ['reference']
  }
]

const MEDIA_MENU_ITEMS: MenuItem[] = [
  { type: 'IMAGE', title: 'Image', additionalMatches: ['photo', 'picture'] },
  { type: 'EMBED', title: 'Embed', additionalMatches: ['video'] }
]

const getFilteredItems = (items: MenuItem[], filter: string | undefined) =>
  items.filter((item) => {
    if (!filter) return true

    const itemTitleLowercased = item.title.toLowerCase(),
      filterLowercased = filter.toLowerCase()

    if (itemTitleLowercased.includes(filterLowercased)) return true

    let foundItem = false

    item.additionalMatches?.map((match) => {
      if (match.toLowerCase().includes(filterLowercased)) {
        foundItem = true
        return
      }
    })

    return foundItem
  })

const getItemType = (items: { type: string }[], index: number): string | null =>
  items[index] ? items[index].type : null

const CommandMenu: React.FC<{
  show: boolean
  filter: string | undefined
  target: BaseRange | undefined
  index: number
  onItemTotal: (total: number) => void
  onItemSelect: (item: string) => void
  onItemClick: (item: string) => void
}> = ({
  show,
  filter,
  target,
  index,
  onItemTotal,
  onItemSelect,
  onItemClick
}) => {
  const commandMenuRef = useRef<HTMLDivElement | null>(null),
    selectedItemRef = useRef<HTMLHRElement | null>(null)

  const editor = useSlate()

  const [formatItems, setFormatItems] = useState<MenuItem[]>([]),
    [elementItems, setElementItems] = useState<MenuItem[]>([]),
    [mediaItems, setMediaItems] = useState<MenuItem[]>([])

  const processClick = (clickedIndex: number) => {
    const item = getItemType(
      [...formatItems, ...elementItems, ...mediaItems],
      clickedIndex
    )

    item && onItemClick(item)
  }

  useEffect(() => {
    setFormatItems(
      filter
        ? getFilteredItems(FORMAT_MENU_ITEMS, filter)
        : [...FORMAT_MENU_ITEMS]
    )
    setElementItems(
      filter
        ? getFilteredItems(ELEMENT_MENU_ITEMS, filter)
        : [...ELEMENT_MENU_ITEMS]
    )
    setMediaItems(
      filter
        ? getFilteredItems(MEDIA_MENU_ITEMS, filter)
        : [...MEDIA_MENU_ITEMS]
    )
  }, [filter])

  useEffect(
    () =>
      onItemTotal(formatItems.length + elementItems.length + mediaItems.length),
    [formatItems, elementItems, mediaItems]
  )

  useEffect(() => {
    const item = getItemType(
      [...formatItems, ...elementItems, ...mediaItems],
      index
    )

    if (item) {
      const elements = document.getElementsByClassName('command-menu-item')

      elements[index] && elements[index].scrollIntoView({ block: 'end' })

      onItemSelect(item)
    }
  })

  useEffect(() => {
    const { selection } = editor

    if (!selection || !target) return

    const domRange = ReactEditor.toDOMRange(editor, target),
      rect = domRange?.getBoundingClientRect(),
      activeElement: ELEMENT_FORMATS = getActiveElementType(editor)

    if (commandMenuRef.current) {
      if (rect) {
        commandMenuRef.current.style.top = `${Math.round(
          // TODO: lazy
          // @ts-ignore
          rect.top - TOP_OFFSET[activeElement]
        )}px`
        commandMenuRef.current.style.left = `${Math.round(rect.x)}px`
        commandMenuRef.current.style.opacity = '1'

        return
      }

      commandMenuRef.current.style.opacity = '0'
    }
  })

  return (
    <>
      {show && (
        <Portal>
          <div ref={commandMenuRef} className="event-content-command-menu">
            <div className={styles.container}>
              {formatItems.length > 0 && (
                <section>
                  <h1>Format</h1>
                  {formatItems.map((item, _index) => {
                    const selected = _index === index

                    return (
                      <div
                        ref={selected ? selectedItemRef : null}
                        key={_index}
                        className={`${styles.item} ${
                          selected ? styles.selected : ''
                        } command-menu-item`}
                        onClick={() => processClick(_index)}
                      >
                        {item.title}
                      </div>
                    )
                  })}
                </section>
              )}

              {elementItems.length > 0 && (
                <section>
                  <h1>Elements</h1>
                  {elementItems.map((item, _index) => {
                    const offsetIndex = _index + formatItems.length,
                      selected = offsetIndex === index

                    return (
                      <div
                        ref={selected ? selectedItemRef : null}
                        key={offsetIndex}
                        className={`${styles.item} ${
                          selected ? styles.selected : ''
                        } command-menu-item`}
                        onClick={() => processClick(offsetIndex)}
                      >
                        {item.title}
                      </div>
                    )
                  })}
                </section>
              )}

              {mediaItems.length > 0 && (
                <section>
                  <h1>Media</h1>
                  {mediaItems.map((item, _index) => {
                    const offsetIndex =
                        _index + formatItems.length + elementItems.length,
                      selected = offsetIndex === index

                    return (
                      <div
                        ref={selected ? selectedItemRef : null}
                        key={offsetIndex}
                        className={`${styles.item} ${
                          selected ? styles.selected : ''
                        } command-menu-item`}
                        onClick={() => processClick(offsetIndex)}
                      >
                        {item.title}
                      </div>
                    )
                  })}
                </section>
              )}

              {formatItems.length === 0 &&
                elementItems.length === 0 &&
                mediaItems.length === 0 && (
                  <section>
                    <div className={`${styles.item} ${styles.noMatch}`}>
                      No matches...
                    </div>
                  </section>
                )}
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

CommandMenu.displayName = 'CommandMenu'

export default CommandMenu
