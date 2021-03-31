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

  return choices
}

export { useChoicesByPassageRef }

export default useChoices
