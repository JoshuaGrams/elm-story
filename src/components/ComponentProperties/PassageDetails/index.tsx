import React from 'react'

import { ComponentId, StudioId } from '../../../data/types'
import { usePassage } from '../../../hooks'

const PassageDetails: React.FC<{ studioId: StudioId; id: ComponentId }> = ({
  studioId,
  id
}) => {
  const passage = usePassage(studioId, id, [id])

  return (
    <>
      {passage ? (
        <>
          <div>Title: {passage.title}</div>
          <div>ID: {passage.id}</div>
        </>
      ) : (
        <>...</>
      )}
    </>
  )
}

export default PassageDetails
