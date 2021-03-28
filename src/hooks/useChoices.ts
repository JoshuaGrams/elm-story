import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { Choice, ComponentId, GameId, StudioId } from '../data/types'

const useChoices = (
  studioId: StudioId,
  gameId: GameId,
  deps?: any[]
): Choice[] | undefined => {
  const choices = useLiveQuery(
    () => new LibraryDatabase(studioId).choices.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (choices) choices.sort((a, b) => (a.title > b.title ? 1 : -1))

  return choices
}

const useChoicesByPassageRef = (
  studioId: StudioId,
  passageId: ComponentId,
  deps?: any[]
): Choice[] | undefined => {
  const choices = useLiveQuery(
    () =>
      new LibraryDatabase(studioId).choices
        .where({ passageId: passageId })
        .toArray(),
    deps || [],
    undefined
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (choices) choices.sort((a, b) => (a.title > b.title ? 1 : -1))

  return choices
}

export { useChoicesByPassageRef }

export default useChoices
