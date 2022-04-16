import { useCallback, useContext, useEffect, useState } from 'react'

import { EngineContext } from '../../contexts/EngineContext'
import {
  EngineDevToolsLiveEvent,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../../types'

const getRemoteImageAsDataURL = async (
  src: string
): Promise<string | ArrayBuffer | null> => {
  const response = await fetch(src),
    blob = await response.blob()

  return new Promise((resolve, reject) => {
    let reader = new FileReader()

    reader.onload = () => {
      resolve(reader.result === 'data:' ? null : reader.result)
    }

    reader.onerror = reject

    reader.readAsDataURL(blob)
  })
}

const useImageLoader = ({
  eventId,
  assetId,
  placeholder,
  ext
}: {
  eventId: string
  assetId?: string
  placeholder: string
  ext: 'jpeg' | 'webp'
}) => {
  const { engine } = useContext(EngineContext)

  const [imageData, setImageData] = useState<string | undefined | null>(
    undefined
  )

  const processDevToolsEvent = useCallback(
    async (event: Event) => {
      const { detail } = event as CustomEvent<EngineDevToolsLiveEvent>

      if (
        detail.eventType === ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RETURN_ASSET_URL
      ) {
        if (
          detail?.asset?.url &&
          detail.asset.id === assetId &&
          eventId === detail.eventId
        ) {
          setImageData(
            (await getRemoteImageAsDataURL(
              detail.asset.url.replaceAll('"', '')
            )) as string | null
          )

          return
        }

        if (!assetId) {
          setImageData(placeholder)

          return
        }

        setImageData(null)
      }
    },
    [eventId, assetId, placeholder, ext]
  )

  useEffect(() => {
    async function getImageUrl() {
      if (!assetId) {
        setImageData(placeholder)

        return
      }

      if (!engine.isComposer && assetId) {
        let imageSrc

        // local development
        // imageSrc = `../../data/0-7-test/assets/${assetId}.${ext}`
        // #PWA
        imageSrc = `./assets/content/${assetId}.${ext}`

        try {
          setImageData(
            (await getRemoteImageAsDataURL(imageSrc)) as string | null
          )
        } catch (error) {
          setImageData(null)
        }

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
                ext
              }
            }
          }
        )
      )
    }

    getImageUrl()
  }, [eventId, assetId, placeholder, ext, engine.devTools])

  useEffect(() => {
    if (engine.isComposer) {
      window.addEventListener(
        ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
        processDevToolsEvent
      )
    }

    return () => {
      if (engine.isComposer) {
        window.removeEventListener(
          ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
          processDevToolsEvent
        )
      }
    }
  }, [eventId, assetId, placeholder, ext])

  return imageData
}

export default useImageLoader
