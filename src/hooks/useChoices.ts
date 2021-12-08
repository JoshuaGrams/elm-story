import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { Choice, ElementId, WorldId, StudioId } from '../data/types'

const useChoices = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Choice[] | undefined => {
  const choices = useLiveQuery(
    () => new LibraryDatabase(studioId).choices.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  return choices
}

const useChoice = (
  studioId: StudioId,
  choiceId: ElementId,
  deps?: any[]
): Choice | undefined => {
  const choice = useLiveQuery(
    () => new LibraryDatabase(studioId).choices.where({ id: choiceId }).first(),
    deps || [],
    undefined
  )

  return choice
}

const useChoicesByEventRef = (
  studioId: StudioId,
  eventId?: ElementId,
  deps?: any[]
): Choice[] | undefined => {
  const choices = useLiveQuery(
    () => new LibraryDatabase(studioId).choices.where({ eventId }).toArray(),
    deps || [],
    undefined
  )

  return choices
}

export { useChoice, useChoicesByEventRef }

export default useChoices
