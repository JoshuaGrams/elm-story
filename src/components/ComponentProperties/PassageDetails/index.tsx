import React from 'react'

import { ComponentId, StudioId } from '../../../data/types'
import { usePassage } from '../../../hooks'

import styles from '../styles.module.less'

const PassageDetails: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
  const passage = usePassage(studioId, passageId, [passageId])

  return (
    <>
      {passage && (
        <div className={styles.componentDetailViewContent}>
          <div>Title: {passage.title}</div>
          <div>ID: {passage.id}</div>
        </div>
      )}
    </>
  )
}

export default PassageDetails
