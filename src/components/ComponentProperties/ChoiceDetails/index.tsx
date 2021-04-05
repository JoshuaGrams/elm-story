import React from 'react'

import { ComponentId, StudioId } from '../../../data/types'

import { useChoice } from '../../../hooks'

import styles from '../styles.module.less'

const ChoiceDetails: React.FC<{
  studioId: StudioId
  choiceId: ComponentId
}> = ({ studioId, choiceId }) => {
  const choice = useChoice(studioId, choiceId, [choiceId])

  return (
    <>
      {choice && (
        <div className={styles.componentDetailViewContent}>
          <div>Title: {choice.title}</div>
          <div>ID: {choice.id}</div>
        </div>
      )}
    </>
  )
}

export default ChoiceDetails
