import React, { useCallback, useContext } from 'react'

import { EVENT_TYPE, Event, Jump, StudioId } from '../../data/types'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../contexts/ComposerContext'

import { Select } from 'antd'

import styles from './styles.module.less'

import api from '../../api'

const EventTypeSelect: React.FC<{
  studioId: StudioId
  event?: Event
  jump?: Jump
}> = React.memo(({ studioId, event, jump }) => {
  const { composer, composerDispatch } = useContext(ComposerContext)

  const changeType = useCallback(
    async (type: EVENT_TYPE) => {
      // Change from choice to input
      if (event?.type === EVENT_TYPE.CHOICE && type === EVENT_TYPE.INPUT) {
        composer.selectedWorldOutlineElement.id === event.sceneId &&
          composerDispatch({
            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CHOICE,
            selectedSceneMapChoice: null
          })

        await api().events.switchEventFromChoiceToInputType(studioId, event)
      }

      // Change from choice to jump
      if (event?.type === EVENT_TYPE.CHOICE && type === EVENT_TYPE.JUMP) {
        console.log('change from choice to jump')
      }

      // Change from jump to choice
      if (jump?.id && type === EVENT_TYPE.CHOICE) {
        console.log('change from jump to choice')
      }

      // Change from input to choice
      if (event?.type === EVENT_TYPE.INPUT && type === EVENT_TYPE.CHOICE) {
        // It will be necessary to remove input and associated paths
        if (event.input)
          await api().events.switchEventFromInputToChoiceType(studioId, event)
      }

      // Change from input to jump
      if (event?.type === EVENT_TYPE.INPUT && type === EVENT_TYPE.JUMP) {
        console.log('change from input to jump')
      }

      // Change from jump to input
      if (jump?.id && type === EVENT_TYPE.INPUT) {
        console.log('change from jump to input')
      }
    },
    [studioId, event?.type, event?.choices]
  )

  return (
    <div className={styles.EventType}>
      <div className={styles.header}>Type</div>
      <Select
        value={event?.type || EVENT_TYPE.JUMP}
        onChange={changeType}
        className={styles.select}
      >
        <Select.Option value={EVENT_TYPE.CHOICE} key="choice">
          Choice
        </Select.Option>
        <Select.Option value={EVENT_TYPE.INPUT} key="input">
          Input
        </Select.Option>
        <Select.Option value={EVENT_TYPE.JUMP} key="jump">
          Jump
        </Select.Option>
      </Select>
    </div>
  )
})

EventTypeSelect.displayName = 'EventType'

export default EventTypeSelect
