import { Howl } from 'howler'

import { useCallback, useEffect, useState } from 'react'
import { AudioProfile } from '../../types'

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
      track[0].audio?.pause()
      track[1].audio?.pause()
    }

    if (!paused) {
      track[0].audio?.play()
      track[1].audio?.play()
    }
  }, [paused])

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
  const sceneTrack = useAudioTrack({
      type: 'SCENE',
      // #DEV
      // source: profiles.scene?.[0]
      //   ? `../../data/0-7-test_0.0.1/assets/${profiles.scene[0]}.mp3`
      //   : undefined,
      // #PWA
      source: profiles.scene?.[0]
        ? `assets/content/${profiles.scene[0]}.mp3`
        : undefined,
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
      source: profiles.event?.[0]
        ? `assets/content/${profiles.event[0]}.mp3`
        : undefined,
      muted,
      loop: profiles.event?.[1],
      paused,
      volume: muted ? -1 : 1
    })

  return { sceneTrack, eventTrack }
}
