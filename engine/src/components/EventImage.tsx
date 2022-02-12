import React, { useContext, useEffect, useState } from 'react'

import {
  ElementId,
  EngineDevToolsLiveEvent,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../types'

import { EngineContext } from '../contexts/EngineContext'

const EventImage: React.FC<{ eventId: ElementId; assetId: string }> = ({
  eventId,
  assetId
}) => {
  const { engine } = useContext(EngineContext)

  const [imageUrl, setImageUrl] = useState<string | undefined>()

  const processEvent = (event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsLiveEvent>

    if (
      detail?.asset?.url &&
      detail.asset.id === assetId &&
      eventId === detail.eventId
    ) {
      setImageUrl(detail.asset.url)
    }
  }

  useEffect(() => {
    async function getImageUrl() {
      if (!engine.isComposer) {
        setImageUrl(`../../data/0-7-test_0.0.1/assets/${assetId}.webp`)
        return
      }

      window.dispatchEvent(
        new CustomEvent<EngineDevToolsLiveEvent>(
          ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
          {
            detail: {
              eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.GET_ASSET_URL,
              eventId,
              asset: {
                id: assetId,
                ext: 'webp'
              }
            }
          }
        )
      )
    }

    getImageUrl()
  }, [eventId, assetId])

  useEffect(() => {
    window.addEventListener(
      ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
      processEvent
    )

    return () => {
      window.removeEventListener(
        ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
        processEvent
      )
    }
  }, [])

  return (
    <div
      className="event-content-image"
      style={{
        backgroundImage: `url(${imageUrl})`
      }}
    />
  )
}

EventImage.displayName = 'EventImage'

export default EventImage
