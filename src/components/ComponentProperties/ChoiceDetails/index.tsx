import React from 'react'

import { ComponentId, StudioId } from '../../../data/types'

import { useChoice } from '../../../hooks'

const ChoiceDetails: React.FC<{ studioId: StudioId; id: ComponentId }> = ({
  studioId,
  id
}) => {
  const choice = useChoice(studioId, id, [id])

  return (
    <>
      {choice ? (
        <>
          <div>Title: {choice.title}</div>
          <div>ID: {choice.id}</div>
        </>
      ) : (
        <>...</>
      )}
    </>
  )
}

export default ChoiceDetails
