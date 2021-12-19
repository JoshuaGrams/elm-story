import React, { useCallback, useContext } from 'react'

import {
  EVENT_TYPE,
  Event,
  Jump,
  StudioId,
  ELEMENT_TYPE
} from '../../data/types'

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

      // Change from choice or input to jump
      if (
        (event?.type === EVENT_TYPE.CHOICE ||
          event?.type === EVENT_TYPE.INPUT) &&
        type === EVENT_TYPE.JUMP
      ) {
        const jumpId = await api().events.switchEventFromChoiceOrInputToJumpType(
          studioId,
          event
        )

        if (jumpId) {
          composerDispatch({
            type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
            removedElement: { id: event.id, type: ELEMENT_TYPE.EVENT }
          })

          composerDispatch({
            type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
            savedElement: { id: jumpId, type: ELEMENT_TYPE.JUMP }
          })
        }
      }

      // Change from jump to choice or input
      if (
        jump?.id &&
        (type === EVENT_TYPE.CHOICE || type === EVENT_TYPE.INPUT)
      ) {
        const eventId = await api().jumps.switchJumpToChoiceOrInputEventType(
          studioId,
          jump,
          type
        )

        if (eventId) {
          composerDispatch({
            type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
            removedElement: { id: jump.id, type: ELEMENT_TYPE.JUMP }
          })

          composerDispatch({
            type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
            savedElement: { id: eventId, type: ELEMENT_TYPE.EVENT }
          })
        }
      }

      // Change from input to choice
      if (event?.type === EVENT_TYPE.INPUT && type === EVENT_TYPE.CHOICE) {
        // It will be necessary to remove input and associated paths
        if (event.input)
          await api().events.switchEventFromInputToChoiceType(studioId, event)
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
