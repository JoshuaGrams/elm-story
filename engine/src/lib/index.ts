import {
  AllowedCharacterDisplayFormatStyles,
  CharacterDisplayFormat,
  CharacterElement,
  CharacterElementStyleTypes,
  CharacterElementTransformType,
  Descendant,
  ELEMENT_FORMATS,
  EventContentElement,
  EventContentLeaf
} from '../types/eventContentTypes'

export const AUTO_ENGINE_BOOKMARK_KEY = '___auto___'
export const INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY = '___initial___'
export const ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE = '___loopback___'
export const ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE = '___passthrough___'
export const ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE = '___storyover___'
export const DEFAULT_ENGINE_SETTINGS_KEY = '__default__'

export const scrollElementToBottom = (element: HTMLElement, smooth?: boolean) =>
  element.scrollIntoView({ block: 'end', behavior: smooth ? 'smooth' : 'auto' })

export const getSvgUrl = (svg: string) =>
  `data:image/svg+xml;base64,${btoa(svg)}`

export const capitalizeString = (text: string) =>
  text.replace(
    /(^\w|\s\w)(\S*)/g,
    (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
  )

export const getCharacterRefDisplayFormat = (
  text: string,
  transform: CharacterElementTransformType,
  styles?: CharacterElementStyleTypes
): CharacterDisplayFormat => {
  let transText: string = `${text}`,
    _styles: AllowedCharacterDisplayFormatStyles | undefined = undefined

  switch (transform) {
    case 'lower':
      transText = transText.toLowerCase()
      break
    case 'upper':
      transText = transText.toUpperCase()
      break
    case 'cap':
    default:
      transText = capitalizeString(transText)
      break
  }

  if (styles) {
    styles.map((style) => {
      if (!_styles) _styles = {}

      switch (style) {
        case 'strong':
          _styles.fontWeight = 'bold'
          break
        case 'em':
          _styles.fontStyle = 'italic'
          break
        case 'u':
          if (!_styles.textDecoration) {
            _styles.textDecoration = 'underline'
            break
          }

          if (_styles.textDecoration === 'line-through') {
            _styles.textDecoration = 'underline line-through'
            break
          }

          break
        case 's':
          if (!_styles.textDecoration) {
            _styles.textDecoration = 'line-through'
          }

          if (_styles.textDecoration === 'underline') {
            _styles.textDecoration = 'underline line-through'
            break
          }

          break
        default:
          break
      }
    })
  }

  return { text: transText, styles: _styles }
}

export const flattenEventContent = (
  content: Descendant[]
): Array<EventContentLeaf | EventContentElement> => {
  const flatEventContent = content.flatMap((element) => {
    // @ts-ignore
    return element.children
      ? // @ts-ignore
        [element, ...flattenEventContent(element.children)]
      : element
  })

  return flatEventContent
}

export const getCharactersIdsFromEventContent = (children: Descendant[]) =>
  flattenEventContent(children)
    .filter(
      (element): element is CharacterElement =>
        // @ts-ignore
        element.type === ELEMENT_FORMATS.CHARACTER &&
        // @ts-ignore
        element.character_id !== undefined
    )
    .map(({ character_id }) => character_id as string)
