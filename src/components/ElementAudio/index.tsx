import { ipcRenderer } from 'electron'
import { v4 as uuid } from 'uuid'

import React from 'react'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import { Event, Scene, StudioId, ELEMENT_TYPE } from '../../data/types'

import AudioProfile from '../AudioProfile'

import api from '../../api'

const ElementAudio: React.FC<{
  studioId: StudioId
  elementType: ELEMENT_TYPE
  element: Scene | Event
  className?: string
}> = ({ studioId, elementType, element, className }) => {
  if (!element.id) return null

  let elementSaveEndpoint: (
    studioId: StudioId,
    element: Scene | Event
  ) => Promise<string | Event>

  switch (elementType) {
    case ELEMENT_TYPE.SCENE:
      // @ts-ignore
      elementSaveEndpoint = api().scenes.saveScene
      break
    case ELEMENT_TYPE.EVENT:
      // @ts-ignore
      elementSaveEndpoint = api().events.saveEvent
      break
    default:
      break
  }

  return (
    <>
      <div className={className}>
        <AudioProfile
          profile={element.audio}
          info
          onImport={async (audioData) => {
            const assetId = uuid(),
              promises: Promise<any>[] = []

            try {
              if (element.audio?.[0]) {
                promises.push(
                  ipcRenderer.invoke(WINDOW_EVENT_TYPE.REMOVE_ASSET, {
                    studioId,
                    worldId: element.worldId,
                    id: element.audio[0],
                    ext: 'mp3'
                  })
                )
              }

              promises.push(
                ipcRenderer.invoke(WINDOW_EVENT_TYPE.SAVE_ASSET, {
                  studioId,
                  worldId: element.worldId,
                  id: assetId,
                  data: audioData,
                  ext: 'mp3'
                })
              )

              await Promise.all([...promises])

              await elementSaveEndpoint(studioId, {
                ...element,
                audio: [assetId, element.audio ? element.audio[1] : false]
              })
            } catch (error) {
              throw error
            }
          }}
          onRequestAudioPath={async (assetId) => {
            return await ipcRenderer.invoke(WINDOW_EVENT_TYPE.GET_ASSET, {
              studioId,
              worldId: element.worldId,
              id: assetId,
              ext: 'mp3'
            })
          }}
          onSelect={async (profile) => {
            try {
              await elementSaveEndpoint(studioId, {
                ...element,
                audio: profile
              })
            } catch (error) {
              throw error
            }
          }}
          onRemove={async () => {
            if (!element.audio?.[0]) return

            try {
              await ipcRenderer.invoke(WINDOW_EVENT_TYPE.REMOVE_ASSET, {
                studioId,
                worldId: element.worldId,
                id: element.audio[0],
                ext: 'mp3'
              })

              await Promise.all([
                elementSaveEndpoint(studioId, {
                  ...element,
                  audio: undefined
                })
              ])
            } catch (error) {
              throw error
            }
          }}
        />
      </div>
    </>
  )
}

ElementAudio.displayName = 'ElementAudio'

export default ElementAudio
