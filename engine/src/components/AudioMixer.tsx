import React, { useContext, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery } from 'react-query'
import { AudioMixerProfiles, useAudioMixer } from '../lib/hooks/useAudioMixer'

import { LibraryDatabase } from '../lib/db'

import { AudioProfile } from '../types'

import { EngineContext } from '../contexts/EngineContext'
import { SettingsContext } from '../contexts/SettingsContext'

import { getEvent, getScene } from '../lib/api'

const AudioMixer: React.FC = React.memo(() => {
  const { engine } = useContext(EngineContext),
    { settings } = useContext(SettingsContext)

  const [audio, setAudio] = useState<{
    scene: AudioProfile | undefined
    event: AudioProfile | undefined
  }>({ scene: undefined, event: undefined })

  if (!engine.worldInfo) return null

  const { studioId } = engine.worldInfo

  const [profiles, setProfiles] = useState<AudioMixerProfiles>({
    scene: undefined,
    event: undefined
  })

  const audioMixer = useAudioMixer({
    profiles,
    paused: !engine.visible,
    muted: engine.isComposer ? engine.devTools.muted : settings.muted
  })

  const currentLiveEventData = useLiveQuery(
    async () => {
      const currentLiveEventData = await new LibraryDatabase(
        studioId
      ).live_events.get(engine.currentLiveEvent || '')

      if (!currentLiveEventData) return null

      return currentLiveEventData
    },
    [studioId, engine.currentLiveEvent],
    undefined
  )

  const { data: profilesData, isLoading: isProfilesLoading } = useQuery<
    AudioMixerProfiles | null | undefined
  >(['currentMix', studioId, currentLiveEventData, audio], async () => {
    if (!currentLiveEventData === null) return null

    const eventData = await getEvent(
      studioId,
      currentLiveEventData?.destination || ''
    )

    if (!eventData) return null

    const sceneData = await getScene(studioId, eventData.sceneId)

    if (!sceneData) return null

    return { scene: sceneData.audio, event: eventData.audio }
  })

  useEffect(() => {
    if (profilesData && !isProfilesLoading) {
      setProfiles(profilesData)
    }
  }, [profilesData])

  return null
})

AudioMixer.displayName = 'AudioMixer'

export default AudioMixer
