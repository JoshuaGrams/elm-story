import React from 'react'

import { ElementId, StudioId } from '../../../data/types'

import { useChoice } from '../../../hooks'

import ElementTitle from '../ElementTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const ChoiceDetails: React.FC<{
  studioId: StudioId
  choiceId: ElementId
}> = ({ studioId, choiceId }) => {
  const choice = useChoice(studioId, choiceId, [choiceId])

  return (
    <>
      {choice && (
        <div className={styles.componentDetailViewWrapper}>
          <div className={styles.content}>
            <ElementTitle
              title={choice.title}
              onUpdate={async (title) =>
                choice.id &&
                (await api().choices.saveChoice(studioId, {
                  ...(await api().choices.getChoice(studioId, choice.id)),
                  title
                }))
              }
            />
            <div className={styles.componentId}>{choice.id}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChoiceDetails
