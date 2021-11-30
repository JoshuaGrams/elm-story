import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { Choice, ElementId, WorldId, StudioId } from '../data/types'

const useChoices = (
  studioId: StudioId,
  gameId: WorldId,
  deps?: any[]
): Choice[] | undefined => {
  const choices = useLiveQuery(
    () => new LibraryDatabase(studioId).choices.where({ gameId }).toArray(),
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

const useChoicesByPassageRef = (
  studioId: StudioId,
  passageId?: ElementId,
  deps?: any[]
): Choice[] | undefined => {
  const choices = useLiveQuery(
    () => new LibraryDatabase(studioId).choices.where({ passageId }).toArray(),
    deps || [],
    undefined
  )

  return choices
}

export { useChoice, useChoicesByPassageRef }

export default useChoices
