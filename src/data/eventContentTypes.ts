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
  type: BLOCK_FORMATS.P
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type HeadingOneElement = {
  type: BLOCK_FORMATS.H1
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type HeadingTwoElement = {
  type: BLOCK_FORMATS.H2
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type HeadingThreeElement = {
  type: BLOCK_FORMATS.H3
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type HeadingFourElement = {
  type: BLOCK_FORMATS.H4
  align?: ALIGN_TYPE
  children: Descendant[]
}

export type BlockquoteElement = {
  type: BLOCK_FORMATS.BLOCKQUOTE
  children: Descendant[]
}

export type OrderedListElement = {
  type: BLOCK_FORMATS.OL
  children: Descendant[]
}

export type UnorderedListElement = {
  type: BLOCK_FORMATS.UL
  children: Descendant[]
}

export type ListItemElement = {
  type: BLOCK_FORMATS.LI
  children: Descendant[]
}

export type ImageElement = {
  type: BLOCK_FORMATS.IMG
  url?: string
  children: EmptyText[]
}

export type EmbedElement = {
  type: BLOCK_FORMATS.EMBED
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
  char_ref?: boolean
  expression?: boolean
  expressionStart?: boolean
  expressionEnd?: boolean
}

export enum INLINE_FORMATS {
  STRONG = 'strong',
  CODE = 'code',
  EM = 'em',
  S = 's',
  U = 'u',
  CHAR_REF = 'char_ref',
  EXP = 'exp'
}

export enum BLOCK_FORMATS {
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
  BLOCK_FORMATS.H1,
  BLOCK_FORMATS.H1,
  BLOCK_FORMATS.H3,
  BLOCK_FORMATS.H4,
  BLOCK_FORMATS.P
]

export enum HOTKEY_EXPRESSION {
  OPEN_BRACKET = 'OPEN_BRACKET',
  CLOSE_BRACKET = 'CLOSE_BRACKET',
  EXIT = 'EXIT'
}

export enum HOTKEY_SELECTION {
  ALL = 'select_all'
}

export const LIST_TYPES = [BLOCK_FORMATS.OL, BLOCK_FORMATS.UL]

export const HOTKEYS: { [hotkey: string]: string } = {
  'mod+b': INLINE_FORMATS.STRONG,
  'mod+i': INLINE_FORMATS.EM,
  'mod+u': INLINE_FORMATS.U,
  'mod+`': INLINE_FORMATS.CODE,
  'shift+[': HOTKEY_EXPRESSION.OPEN_BRACKET,
  'shift+]': HOTKEY_EXPRESSION.CLOSE_BRACKET,
  tab: HOTKEY_EXPRESSION.EXIT
}

export const DEFAULT_EVENT_CONTENT: Descendant[] = [
  {
    type: BLOCK_FORMATS.P,
    children: [{ text: '' }]
  }
]
