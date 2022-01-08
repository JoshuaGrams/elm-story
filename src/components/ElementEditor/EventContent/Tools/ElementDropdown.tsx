import {
  getActiveElementType,
  isElementActive,
  toggleElement
} from '../../../../lib/contentEditor'

import React, { useCallback, useEffect, useState } from 'react'

import {
  ALIGN_TYPE,
  ELEMENT_FORMATS,
  LIST_TYPES
} from '../../../../data/eventContentTypes'

import { Editor, Transforms, Element as SlateElement } from 'slate'
import { useSlate } from 'slate-react'

import { Dropdown, Menu } from 'antd'
import Icon, {
  AlignLeftOutlined,
  DownOutlined,
  FileImageOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  YoutubeOutlined
} from '@ant-design/icons'

import styles from './styles.module.less'

const HeadingIcon: React.FC<{
  type: 'H1' | 'H2' | 'H3' | 'H4'
  className?: string
}> = ({ type, className }) => {
  const h1 = (
    <>
      <path
        d="M4.02185 9.75V6.19336H1.00401V9.75H0V2.25H1.00401V5.41994H4.02185V2.25H5.02586V9.75H4.02185Z"
        fill="currentColor"
      />
      <path
        d="M12 9.00381V9.75H7.38619V9.00381H9.35359V3.24129L7.51967 4.28704L7.09602 3.63344L9.47546 2.25H10.3286V9.00381H12Z"
        fill="currentColor"
      />
    </>
  )

  const h2 = (
    <>
      <path
        d="M4.11947 9.75V6.24929H1.02838V9.75H0V2.36794H1.02838V5.48803H4.11947V2.36794H5.14785V9.75H4.11947Z"
        fill="currentColor"
      />
      <path
        d="M9.34285 2.25C9.85804 2.25 10.2999 2.34114 10.6685 2.52341C11.037 2.70211 11.3184 2.94693 11.5126 3.25786C11.7107 3.5688 11.8098 3.91905 11.8098 4.30861C11.8098 4.64814 11.7444 4.98052 11.6136 5.30575C11.4828 5.62741 11.2728 5.96694 10.9835 6.32434C10.6982 6.67816 10.3217 7.0713 9.85407 7.50375C9.38645 7.9362 8.81578 8.42941 8.14209 8.98338H12L11.8752 9.75H7.0067V9.01555C7.77948 8.34721 8.40958 7.78252 8.89702 7.32148C9.38843 6.86044 9.76887 6.46372 10.0383 6.13134C10.3078 5.79539 10.4941 5.48803 10.5971 5.20926C10.7041 4.93049 10.7576 4.64099 10.7576 4.34078C10.7576 3.9262 10.6288 3.59918 10.3712 3.35972C10.1136 3.12026 9.755 3.00054 9.2953 3.00054C8.89108 3.00054 8.56017 3.06308 8.30258 3.18817C8.04499 3.31326 7.7874 3.5134 7.52981 3.7886L6.84026 3.30611C7.16522 2.94871 7.52387 2.68424 7.9162 2.51269C8.31249 2.33756 8.78804 2.25 9.34285 2.25Z"
        fill="currentColor"
      />
    </>
  )

  const h3 = (
    <>
      <path
        d="M4.08306 9.62869V6.1846H1.01929V9.62869H0V2.36603H1.01929V5.43565H4.08306V2.36603H5.10235V9.62869H4.08306Z"
        fill="currentColor"
      />
      <path
        d="M9.2485 2.25C9.75913 2.25 10.201 2.33263 10.5742 2.49789C10.9473 2.66315 11.2341 2.88291 11.4344 3.15717C11.6386 3.43143 11.7408 3.73383 11.7408 4.06435C11.7408 4.3597 11.6681 4.62693 11.5228 4.86603C11.3774 5.10162 11.185 5.29676 10.9454 5.45148C10.7058 5.60619 10.4426 5.70816 10.1558 5.75738C10.474 5.77848 10.7725 5.85935 11.0514 6C11.3342 6.13713 11.562 6.33404 11.7349 6.59072C11.9116 6.8474 12 7.1621 12 7.53481C12 7.95323 11.8822 8.33122 11.6465 8.66878C11.4108 9.00281 11.0809 9.26653 10.6567 9.45991C10.2364 9.6533 9.74538 9.75 9.18369 9.75C8.72805 9.75 8.27634 9.67264 7.82856 9.51793C7.38078 9.36322 7.00174 9.11709 6.69143 8.77954L7.35721 8.2943C7.58896 8.53692 7.86391 8.718 8.18207 8.83755C8.50416 8.9571 8.83018 9.01688 9.16012 9.01688C9.72574 9.01688 10.1676 8.88502 10.4858 8.62131C10.804 8.35408 10.963 7.99191 10.963 7.53481C10.963 7.01793 10.802 6.65928 10.4799 6.45886C10.1617 6.25844 9.76306 6.15823 9.28385 6.15823H8.6004L8.72412 5.45675H9.20137C9.46454 5.45675 9.71199 5.41104 9.94374 5.31962C10.1794 5.2282 10.3719 5.08931 10.5211 4.90295C10.6704 4.7166 10.745 4.47925 10.745 4.19093C10.745 3.79008 10.5958 3.48418 10.2973 3.27321C9.99873 3.06224 9.63736 2.95675 9.21315 2.95675C8.85964 2.95675 8.5513 3.01301 8.28813 3.12553C8.02496 3.23453 7.75982 3.40155 7.49272 3.62658L6.94478 3.08333C7.29044 2.79149 7.6577 2.58052 8.04656 2.45042C8.43542 2.31681 8.83607 2.25 9.2485 2.25Z"
        fill="currentColor"
      />
    </>
  )

  const h4 = (
    <>
      <path
        d="M3.9795 9.75V6.24929H0.993441V9.75H0V2.36794H0.993441V5.48803H3.9795V2.36794H4.97295V9.75H3.9795Z"
        fill="currentColor"
      />
      <path
        d="M10.9778 5.13956V7.2357H12V7.95407H10.9778V9.75H10.0476L10.0418 7.95407H6.75716V7.30004L9.0771 2.25L9.88104 2.5663L7.77931 7.2357H10.0476L10.1739 5.13956H10.9778Z"
        fill="currentColor"
      />
    </>
  )

  return (
    <Icon
      className={`${styles.icon} ${className || ''}`}
      component={() => (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {type === 'H1' && h1}
          {type === 'H2' && h2}
          {type === 'H3' && h3}
          {type === 'H4' && h4}
        </svg>
      )}
    />
  )
}

HeadingIcon.displayName = 'HeadingIcon'

const BlockquoteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon
    className={`${styles.icon} ${className || ''}`}
    component={() => (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.875 6.10714H9V4.60714C9 3.7798 9.67266 3.10714 10.5 3.10714H10.6875C10.9992 3.10714 11.25 2.85636 11.25 2.54464V1.41964C11.25 1.10792 10.9992 0.857143 10.6875 0.857143H10.5C8.42813 0.857143 6.75 2.53527 6.75 4.60714V10.2321C6.75 10.8532 7.25391 11.3571 7.875 11.3571H10.875C11.4961 11.3571 12 10.8532 12 10.2321V7.23214C12 6.61105 11.4961 6.10714 10.875 6.10714ZM4.125 6.10714H2.25V4.60714C2.25 3.7798 2.92266 3.10714 3.75 3.10714H3.9375C4.24922 3.10714 4.5 2.85636 4.5 2.54464V1.41964C4.5 1.10792 4.24922 0.857143 3.9375 0.857143H3.75C1.67813 0.857143 0 2.53527 0 4.60714V10.2321C0 10.8532 0.503906 11.3571 1.125 11.3571H4.125C4.74609 11.3571 5.25 10.8532 5.25 10.2321V7.23214C5.25 6.61105 4.74609 6.10714 4.125 6.10714Z"
          fill="currentColor"
        />
      </svg>
    )}
  />
)

const ElementDropdown: React.FC = () => {
  const editor = useSlate()

  const [currentElementType, setCurrentElementType] = useState<ELEMENT_FORMATS>(
    ELEMENT_FORMATS.P
  )

  const changeElement = useCallback(
    (
      event: React.MouseEvent<HTMLElement, MouseEvent>,
      type: ELEMENT_FORMATS
    ) => {
      event.preventDefault()

      if (type === currentElementType) return

      setCurrentElementType(type)

      toggleElement(editor, type, isElementActive(editor, type))
    },
    [currentElementType]
  )

  useEffect(() => setCurrentElementType(getActiveElementType(editor)), [
    editor.selection
  ])

  return (
    <Dropdown
      // @ts-ignore
      autoDestroy
      overlayClassName="event-content-element-dropdown-menu"
      overlay={
        <Menu>
          <Menu.Item
            onMouseDown={(event) => changeElement(event, ELEMENT_FORMATS.P)}
            className={
              currentElementType === ELEMENT_FORMATS.P
                ? styles.activeElement
                : ''
            }
          >
            <AlignLeftOutlined className={styles.icon} /> Text
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeElement(event, ELEMENT_FORMATS.H1)}
            className={
              currentElementType === ELEMENT_FORMATS.H1
                ? styles.activeElement
                : ''
            }
          >
            <HeadingIcon type="H1" /> Heading 1
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeElement(event, ELEMENT_FORMATS.H2)}
            className={
              currentElementType === ELEMENT_FORMATS.H2
                ? styles.activeElement
                : ''
            }
          >
            <HeadingIcon type="H2" /> Heading 2
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeElement(event, ELEMENT_FORMATS.H3)}
            className={
              currentElementType === ELEMENT_FORMATS.H3
                ? styles.activeElement
                : ''
            }
          >
            <HeadingIcon type="H3" /> Heading 3
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeElement(event, ELEMENT_FORMATS.H4)}
            className={
              currentElementType === ELEMENT_FORMATS.H4
                ? styles.activeElement
                : ''
            }
          >
            <HeadingIcon type="H4" /> Heading 4
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) =>
              changeElement(event, ELEMENT_FORMATS.BLOCKQUOTE)
            }
            className={
              currentElementType === ELEMENT_FORMATS.BLOCKQUOTE
                ? styles.activeElement
                : ''
            }
          >
            <BlockquoteIcon /> Quote
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeElement(event, ELEMENT_FORMATS.OL)}
            className={
              currentElementType === ELEMENT_FORMATS.OL
                ? styles.activeElement
                : ''
            }
          >
            <OrderedListOutlined className={styles.icon} /> Numbered List
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeElement(event, ELEMENT_FORMATS.UL)}
            className={
              currentElementType === ELEMENT_FORMATS.UL
                ? styles.activeElement
                : ''
            }
          >
            <UnorderedListOutlined className={styles.icon} /> Bulleted List
          </Menu.Item>
          <Menu.Item>
            <FileImageOutlined className={styles.icon} /> Image
          </Menu.Item>
          <Menu.Item>
            <YoutubeOutlined className={styles.icon} /> Embed
          </Menu.Item>
        </Menu>
      }
    >
      <div
        className={styles.ElementDropdown}
        onMouseDown={(event) => event.preventDefault()}
      >
        {currentElementType === ELEMENT_FORMATS.P && (
          <>
            <AlignLeftOutlined className={styles.iconHighlight} /> Text
          </>
        )}
        {currentElementType === ELEMENT_FORMATS.H1 && (
          <>
            <HeadingIcon type="H1" className={styles.iconHighlight} /> Heading 1
          </>
        )}
        {currentElementType === ELEMENT_FORMATS.H2 && (
          <>
            <HeadingIcon type="H2" className={styles.iconHighlight} /> Heading 2
          </>
        )}
        {currentElementType === ELEMENT_FORMATS.H3 && (
          <>
            <HeadingIcon type="H3" className={styles.iconHighlight} /> Heading 3
          </>
        )}
        {currentElementType === ELEMENT_FORMATS.H4 && (
          <>
            <HeadingIcon type="H4" className={styles.iconHighlight} /> Heading 4
          </>
        )}
        {currentElementType === ELEMENT_FORMATS.BLOCKQUOTE && (
          <>
            <BlockquoteIcon className={styles.iconHighlight} /> Quote
          </>
        )}
        {currentElementType === ELEMENT_FORMATS.OL && (
          <>
            <OrderedListOutlined className={styles.iconHighlight} /> Numbered
            List
          </>
        )}
        {currentElementType === ELEMENT_FORMATS.UL && (
          <>
            <UnorderedListOutlined className={styles.iconHighlight} /> Bulleted
            List
          </>
        )}{' '}
        <DownOutlined />
      </div>
    </Dropdown>
  )
}

ElementDropdown.displayName = 'ElementDropDown'

export default ElementDropdown
