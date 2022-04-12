import { Howl } from 'howler'

import { useCallback, useContext, useEffect, useState } from 'react'
import { EngineContext } from '../../contexts/EngineContext'
import {
  AudioProfile,
  ElementId,
  EngineDevToolsLiveEvent,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../../types'

export type AudioMixerProfiles = { scene?: AudioProfile; event?: AudioProfile }
export type AudioTrackType = 'SCENE' | 'EVENT'
export type AudioTrack = [AudioSubTrack, AudioSubTrack]
export type AudioSubTrack = { source?: string; audio?: Howl; primary: boolean }

const useAudioTrack = ({
  type,
  source,
  muted,
  loop,
  paused,
  volume
}: {
  type: AudioTrackType
  source?: string
  muted: boolean
  loop?: boolean
  paused: boolean
  volume?: number
}) => {
  const { engine } = useContext(EngineContext)

  const [track, setTrack] = useState<AudioTrack>([
    { source: undefined, audio: undefined, primary: true },
    { source: undefined, audio: undefined, primary: false }
  ])

  const updateTrack = useCallback(
    (source?: string) => {
      const audio = source
        ? new Howl({ src: source, loop, autoplay: true, html5: false })
        : undefined

      if (!track[0].source) {
        setTrack([{ source, audio, primary: true }, { ...track[1] }])

        return
      }

      // if (!source) return

      // for cross-fading
      const primarySubTrackIndex = track.findIndex(
          (subTrack) => subTrack.primary
        ),
        existingPrimarySubTrack: AudioSubTrack = {
          ...track[primarySubTrackIndex],
          primary: false
        },
        newPrimarySubTrack: AudioSubTrack = {
          source,
          audio,
          primary: true
        }

      setTrack(
        primarySubTrackIndex === 0
          ? [existingPrimarySubTrack, newPrimarySubTrack]
          : [newPrimarySubTrack, existingPrimarySubTrack]
      )
    },
    [track]
  )

  const updateVolume = useCallback(() => {}, [])

  const pause = useCallback(() => {
    track[0].audio?.pause()
    track[1].audio?.pause()
  }, [track])

  const stop = useCallback(() => {
    track[0].audio?.stop()
    track[1].audio?.stop()
  }, [track])

  const play = useCallback(() => {
    // elmstorygames/feedback#268
    track[0].primary && track[0].audio?.play()
    track[1].primary && track[1].audio?.play()
  }, [track])

  useEffect(() => updateTrack(source), [source])

  useEffect(() => {
    let subTrackToFadeOutIndex = -1

    const subTrackToFadeOut = track.find((subTrack, index) => {
        subTrackToFadeOutIndex = index

        return !subTrack.primary
      }),
      subTrackToFadeIn = track.find((subTrack) => subTrack.primary)

    if (subTrackToFadeOut?.audio) {
      subTrackToFadeOut.audio.once('fade', () => {
        subTrackToFadeOut.audio?.stop()

        // const resetSubTrack: AudioSubTrack = {
        //   source: undefined,
        //   audio: undefined,
        //   primary: false
        // }

        // setTrack(
        //   subTrackToFadeOutIndex === 0
        //     ? [{ ...resetSubTrack }, { ...track[1] }]
        //     : [{ ...track[0] }, { ...resetSubTrack }]
        // )
      })

      subTrackToFadeOut.audio.fade(volume || 1, 0, 1000)
    }

    if (subTrackToFadeIn?.audio) {
      subTrackToFadeIn.audio.volume(0)
      subTrackToFadeIn.audio.play()
      subTrackToFadeIn.audio.fade(0, volume || 1, 1000)
    }

    return () => {
      engine.isComposer && stop()
    }
  }, [track])

  useEffect(() => {
    const subTrackVolumeToChange = track.find((subTrack) => subTrack.primary)

    subTrackVolumeToChange?.audio &&
      subTrackVolumeToChange.audio.fade(
        subTrackVolumeToChange.audio.volume(),
        volume || 1,
        1000
      )
  }, [volume])

  // elmstorygames/feedback#268
  useEffect(() => {
    if (paused) {
      pause()
    }

    if (!paused) {
      play()
    }
  }, [paused])

  // elmstorygames/feedback#289
  useEffect(() => {
    if (!engine.playing) {
      stop()
    }

    if (engine.playing) {
      play()
    }
  }, [engine.playing])

  return [
    { source: track[0].source, primary: track[0].primary },
    { source: track[1].source, primary: track[1].primary }
  ]
}

export const useAudioMixer = ({
  profiles,
  muted,
  paused,
  onEnd
}: {
  profiles: AudioMixerProfiles
  muted: boolean
  paused: boolean
  onEnd?: (type: 'SCENE' | 'EVENT', source: string) => void
}) => {
  const { engine } = useContext(EngineContext)

  const [resolvedAudioSceneUrl, setResolvedAudioSceneUrl] = useState<
      string | undefined
    >(undefined),
    [resolvedAudioEventUrl, setResolvedAudioEventUrl] = useState<
      string | undefined
    >(undefined)

  const processEvent = (event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsLiveEvent>

    if (detail.eventType === ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RETURN_ASSET_URL) {
      if (
        detail?.asset?.url &&
        detail?.asset.id &&
        engine.currentLiveEvent === detail.eventId
      ) {
        if (
          detail.asset.for === 'SCENE' &&
          detail.asset.id === profiles.scene?.[0]
        ) {
          // replaceAll('"', "'")
          setResolvedAudioSceneUrl(detail.asset.url.replaceAll('"', ''))
        }

        if (
          detail.asset.for === 'EVENT' &&
          detail.asset.id === profiles.event?.[0]
        ) {
          // replaceAll('"', "'")
          setResolvedAudioEventUrl(detail.asset.url.replaceAll('"', ''))
        }
      } else {
        if (detail?.asset?.for === 'SCENE') {
          setResolvedAudioSceneUrl(undefined)
        }

        if (detail?.asset?.for === 'EVENT') {
          setResolvedAudioEventUrl(undefined)
        }
      }
    }
  }

  useEffect(() => {
    async function getAudioUrls() {
      if (engine.isComposer) {
        if (profiles.scene) {
          window.dispatchEvent(
            new CustomEvent<EngineDevToolsLiveEvent>(
              ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
              {
                detail: {
                  eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.GET_ASSET_URL,
                  eventId: engine.currentLiveEvent,
                  asset: {
                    id: profiles.scene[0],
                    for: 'SCENE',
                    ext: 'mp3'
                  }
                }
              }
            )
          )
        } else {
          setResolvedAudioSceneUrl(undefined)
        }

        if (profiles.event) {
          window.dispatchEvent(
            new CustomEvent<EngineDevToolsLiveEvent>(
              ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
              {
                detail: {
                  eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.GET_ASSET_URL,
                  eventId: engine.currentLiveEvent,
                  asset: {
                    id: profiles.event[0],
                    for: 'EVENT',
                    ext: 'mp3'
                  }
                }
              }
            )
          )
        } else {
          setResolvedAudioEventUrl(undefined)
        }
      }
    }

    getAudioUrls()
  }, [engine.currentLiveEvent, profiles, engine.devTools])

  useEffect(() => {
    if (engine.isComposer) {
      window.addEventListener(
        ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
        processEvent
      )
    }

    return () => {
      if (engine.isComposer) {
        window.removeEventListener(
          ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
          processEvent
        )
      }
    }
  }, [engine.currentLiveEvent, profiles, engine.devTools])

  const sceneTrack = useAudioTrack({
      type: 'SCENE',
      // #DEV
      // source: profiles.scene?.[0]
      //   ? `../../data/0-7-test_0.0.1/assets/${profiles.scene[0]}.mp3`
      //   : undefined,
      // #PWA
      source: !engine.isComposer
        ? profiles.scene?.[0]
          ? `assets/content/${profiles.scene[0]}.mp3`
          : undefined
        : resolvedAudioSceneUrl,
      muted,
      loop: profiles.scene?.[1],
      paused,
      volume: muted ? -1 : profiles.event ? 0.3 : 1
    }),
    eventTrack = useAudioTrack({
      type: 'EVENT',
      // #DEV
      // source: profiles.event?.[0]
      //   ? `../../data/0-7-test_0.0.1/assets/${profiles.event[0]}.mp3`
      //   : undefined,
      // #PWA
      source: !engine.isComposer
        ? profiles.event?.[0]
          ? `assets/content/${profiles.event[0]}.mp3`
          : undefined
        : resolvedAudioEventUrl,
      muted,
      loop: profiles.event?.[1],
      paused,
      volume: muted ? -1 : 1
    })

  return { sceneTrack, eventTrack }
}
