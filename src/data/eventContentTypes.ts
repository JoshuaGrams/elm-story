import { BaseEditor, Descendant, Range } from 'slate'
import { ReactEditor } from 'slate-react'

declare module 'slate' {
  interface CustomTypes {
    Editor: EditorType
    Element: EventContentElement
    Text: EventContentLeaf
  }
}

export interface CustomRange extends Range {
  expression?: boolean
  expressionStart?: boolean
  expressionEnd?: boolean
}

export type EditorType = BaseEditor & ReactEditor

export type EmptyText = {
  text: ''
}

export type ParagraphElement = {
  type: ELEMENT_FORMATS.P
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type HeadingOneElement = {
  type: ELEMENT_FORMATS.H1
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type HeadingTwoElement = {
  type: ELEMENT_FORMATS.H2
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type HeadingThreeElement = {
  type: ELEMENT_FORMATS.H3
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type HeadingFourElement = {
  type: ELEMENT_FORMATS.H4
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type BlockquoteElement = {
  type: ELEMENT_FORMATS.BLOCKQUOTE
  children: Descendant[]
}

export type OrderedListElement = {
  type: ELEMENT_FORMATS.OL
  children: Descendant[]
}

export type UnorderedListElement = {
  type: ELEMENT_FORMATS.UL
  children: Descendant[]
}

export type ListItemElement = {
  type: ELEMENT_FORMATS.LI
  children: Descendant[]
}

export type ImageElement = {
  type: ELEMENT_FORMATS.IMG
  url?: string
  children: EmptyText[]
}

export type EmbedElement = {
  type: ELEMENT_FORMATS.EMBED
  url?: string
  children: EmptyText[]
}

export type EventContentElement =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | HeadingFourElement
  | BlockquoteElement
  | OrderedListElement
  | UnorderedListElement
  | ListItemElement
  | ImageElement
  | EmbedElement

export type EventContentLeaf = {
  text: string
  strong?: boolean
  em?: boolean
  u?: boolean
  s?: boolean
  code?: boolean
  character?: boolean
  expression?: boolean
  expressionStart?: boolean
  expressionEnd?: boolean
}

export enum LEAF_FORMATS {
  STRONG = 'strong',
  CODE = 'code',
  EM = 'em',
  S = 's',
  U = 'u',
  CHARACTER = 'character',
  EXPRESSION = 'expression'
}

export enum ELEMENT_FORMATS {
  BLOCKQUOTE = 'blockquote',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  IMG = 'img',
  OL = 'ol',
  UL = 'ul',
  LI = 'li',
  P = 'p',
  EMBED = 'embed'
}

export enum ALIGN_TYPE {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export const SUPPORTED_ALIGN_TYPES = [
  ELEMENT_FORMATS.H1,
  ELEMENT_FORMATS.H1,
  ELEMENT_FORMATS.H3,
  ELEMENT_FORMATS.H4,
  ELEMENT_FORMATS.P
]

export enum HOTKEY_BASIC {
  BACKSPACE = 'BACKSPACE',
  DELETE = 'DELETE'
}

export enum HOTKEY_EXPRESSION {
  OPEN_BRACKET = 'OPEN_BRACKET',
  CLOSE_BRACKET = 'CLOSE_BRACKET',
  EXIT = 'EXIT'
}

export enum HOTKEY_SELECTION {
  ALL = 'SELECT_ALL'
}

export const LIST_TYPES = [ELEMENT_FORMATS.OL, ELEMENT_FORMATS.UL]

export const HOTKEYS: { [hotkey: string]: string } = {
  'mod+b': LEAF_FORMATS.STRONG,
  'mod+i': LEAF_FORMATS.EM,
  'mod+u': LEAF_FORMATS.U,
  'mod+s': LEAF_FORMATS.S,
  'mod+`': LEAF_FORMATS.CODE,
  'mod+a': HOTKEY_SELECTION.ALL,
  backspace: HOTKEY_BASIC.BACKSPACE,
  delete: HOTKEY_BASIC.DELETE,
  'shift+[': HOTKEY_EXPRESSION.OPEN_BRACKET,
  'shift+]': HOTKEY_EXPRESSION.CLOSE_BRACKET,
  tab: HOTKEY_EXPRESSION.EXIT
}

export const DEFAULT_EVENT_CONTENT: Descendant[] = [
  {
    type: ELEMENT_FORMATS.P,
    children: [{ text: '' }]
  }
]
