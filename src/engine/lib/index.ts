export const AUTO_ENGINE_BOOKMARK_KEY = '___auto___'
export const INITIAL_ENGINE_EVENT_ORIGIN_KEY = '___initial___'
export const ENGINE_LOOPBACK_RESULT_VALUE = '___loopback___'
export const ENGINE_GAME_OVER_RESULT_VALUE = '___gameover___'
export const DEFAULT_ENGINE_SETTINGS_KEY = '__default__'

export const scrollElementToBottom = (element: HTMLElement, smooth?: boolean) =>
  element.scrollIntoView({ block: 'end', behavior: smooth ? 'smooth' : 'auto' })
