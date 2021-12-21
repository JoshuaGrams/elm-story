import React, { useContext, useState, useEffect } from 'react'

import { StudioId, Event, Jump } from '../../../data/types'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import { Typography } from 'antd'
import { AlignLeftOutlined, SendOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../../api'

const NodeTitle: React.FC<{
  studioId: StudioId
  event?: Event
  jump?: Jump
}> = ({ studioId, event, jump }) => {
  const { composerDispatch } = useContext(ComposerContext)

  const [renamingTitle, setRenamingTitle] = useState(false)

  useEffect(() => {
    setRenamingTitle(false)
  }, [event?.title, jump?.title])

  useEffect(() => {
    // elmstorygames/feedback#152
    if (renamingTitle) {
      const textarea = document.querySelector(
        '.ant-typography-edit-content .ant-input'
      ) as HTMLTextAreaElement | null

      textarea?.select()
    }
  }, [renamingTitle])

  return (
    <>
      {(event?.id || jump?.id) && (
        <h1
          className={`${
            renamingTitle
              ? 'nodrag'
              : event
              ? 'nodeEventHeader'
              : 'nodeJumpHeader'
          }`}
          data-component-id={event?.id || jump?.id}
          onDoubleClick={() => !renamingTitle && setRenamingTitle(true)}
        >
          {/* #395 */}
          {event && (
            <AlignLeftOutlined
              className={`${`${styles.headerIcon} ${styles.event}`} ${
                event.ending ? styles.warning : ''
              }`}
            />
          )}

          {jump && (
            <SendOutlined className={`${styles.headerIcon} ${styles.jump}`} />
          )}

          <Typography.Text
            className={`${!renamingTitle ? styles.disablePointer : ''}`}
            editable={{
              editing: renamingTitle,
              onChange: async (newTitle) => {
                if (
                  !newTitle ||
                  event?.title === newTitle ||
                  jump?.title === newTitle
                ) {
                  setRenamingTitle(false)
                  return
                }

                try {
                  if (event) {
                    await api().events.saveEvent(studioId, {
                      ...event,
                      title: newTitle
                    })
                  }

                  if (jump) {
                    await api().jumps.saveJump(studioId, {
                      ...jump,
                      title: newTitle
                    })
                  }

                  composerDispatch({
                    type: COMPOSER_ACTION_TYPE.ELEMENT_RENAME,
                    renamedElement: {
                      id: event?.id || jump?.id,
                      newTitle
                    }
                  })
                } catch (error) {
                  throw error
                }
              }
            }}
          >
            {event?.title || jump?.title}
          </Typography.Text>
        </h1>
      )}
    </>
  )
}

NodeTitle.displayName = 'NodeTitle'

export default NodeTitle
