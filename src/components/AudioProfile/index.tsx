import React, { useEffect, useRef, useState } from 'react'

import { AudioProfile as AudioProfileType } from '../../data/types'

import { Button, Collapse, Slider, Spin } from 'antd'
import {
  DeleteOutlined,
  ImportOutlined,
  LoadingOutlined,
  PauseOutlined,
  PlayCircleFilled,
  RetweetOutlined,
  SoundOutlined
} from '@ant-design/icons'

import Clock from '../Clock'
import Metadata from './Metadata'

import styles from './styles.module.less'

// used when doing something with the audio file
// that would otherwise be locked as in-use
const dummyAudio =
  'data:audio/mp3;base64,/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'

const initialPlayerState = {
  currentTime: 0,
  duration: 0,
  playing: false,
  muted: false,
  ready: false,
  loops: false
}

const AudioProfile: React.FC<{
  profile?: AudioProfileType
  info?: boolean // display extra track info
  onImport: (audioData: ArrayBuffer) => Promise<void>
  onSelect: (profile: AudioProfileType) => Promise<void>
  onRequestAudioPath: (assetId: string) => Promise<[string, boolean]>
  onRemove?: () => void
}> = ({ profile, info, onImport, onSelect, onRequestAudioPath, onRemove }) => {
  const importAudioInputRef = useRef<HTMLInputElement>(null),
    playerRef = useRef<HTMLMediaElement>(null)

  const [loading, setLoading] = useState(false),
    [importedAudioData, setImportedAudioData] = useState<ArrayBuffer | null>(
      null
    ),
    // null doesn't exist
    [audioPath, setAudioPath] = useState<string | undefined | null>(undefined),
    [removeProfile, setRemoveProfile] = useState(false) // to avoid resource being in use

  const [player, setPlayer] = useState({
    ...initialPlayerState,
    loops: profile?.[1] !== undefined && profile[1]
  })

  const processAudioImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      if (profile?.[0] && playerRef.current) playerRef.current.src = dummyAudio

      setLoading(true)

      const audioFile = event.target.files[0]

      const reader = new FileReader()

      reader.addEventListener(
        'load',
        () => {
          setImportedAudioData(reader.result as ArrayBuffer | null)
        },
        false
      )

      reader.readAsArrayBuffer(audioFile)
    }
  }

  const reset = () => {
    if (importAudioInputRef.current) importAudioInputRef.current.value = ''

    setLoading(false)
    setAudioPath(undefined)
    setImportedAudioData(null)

    setPlayer({
      ...initialPlayerState,
      loops: player.loops
    })

    setRemoveProfile(false)
  }

  useEffect(() => {
    async function saveAudioProfile() {
      if (!importedAudioData) return

      await onImport(importedAudioData)

      reset()
    }

    saveAudioProfile()
  }, [importedAudioData, profile])

  useEffect(() => {
    async function getAudioPath() {
      if (!profile?.[0]) return

      // elmstorygames/feedback#232
      setPlayer({ ...initialPlayerState, ready: false, loops: player.loops })

      try {
        const [path, exists] = await onRequestAudioPath(profile[0])

        setAudioPath(exists ? path.replaceAll('"', '') : null)
      } catch (error) {
        throw error
      }
    }

    profile?.[0] && getAudioPath()
  }, [profile?.[0]])

  useEffect(() => {
    async function removeAudioProfile() {
      if (removeProfile && playerRef.current) {
        setAudioPath(dummyAudio)
      }
    }

    removeAudioProfile()
  }, [removeProfile, playerRef.current])

  useEffect(() => {
    async function updateProfile() {
      profile?.[0] && onSelect([profile[0], player.loops])
    }

    updateProfile()
  }, [player.loops])

  useEffect(() => {
    async function removeAudioProfile() {
      if (removeProfile && playerRef.current?.src === dummyAudio) {
        if (onRemove) await onRemove()

        // elmstorygames/feedback#233
        reset()
      }
    }

    removeAudioProfile()
  }, [removeProfile, player.duration])

  return (
    <div className={styles.AudioProfile}>
      <input
        ref={importAudioInputRef}
        type="file"
        accept="audio/mp3"
        style={{ display: 'none' }}
        onChange={processAudioImport}
      />

      {!profile && (
        <div className={styles.createProfileButton}>
          <Button
            onClick={() => importAudioInputRef.current?.click()}
            disabled={loading}
            size="small"
          >
            {loading ? (
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ color: 'var(--highlight-color)' }}
                    spin
                  />
                }
              />
            ) : (
              'Import MP3'
            )}
          </Button>
        </div>
      )}

      {profile && (
        <>
          <div
            className={`${styles.player} ${
              !player.ready || loading ? styles.disabled : ''
            }`}
          >
            <div className={styles.bar}>
              <div
                className={`${styles.button} ${styles.play}`}
                title={player.playing ? 'Pause track' : 'Play track'}
                onClick={() =>
                  player.playing
                    ? playerRef.current?.pause()
                    : playerRef.current?.play()
                }
              >
                {!player.playing ? <PlayCircleFilled /> : <PauseOutlined />}
              </div>
              <Slider
                value={player.currentTime}
                max={player.duration}
                tooltipVisible={false}
                onChange={(value) => {
                  if (playerRef.current) {
                    playerRef.current.currentTime = value
                  }
                }}
                className={styles.slider}
              />

              {audioPath && (
                <audio
                  ref={playerRef}
                  src={audioPath}
                  onCanPlay={() => setPlayer({ ...player, ready: true })}
                  onPlay={() => setPlayer({ ...player, playing: true })}
                  onPause={() => setPlayer({ ...player, playing: false })}
                  loop={player.loops}
                  onTimeUpdate={() =>
                    setPlayer({
                      ...player,
                      currentTime: Math.round(
                        playerRef.current?.currentTime || 0
                      )
                    })
                  }
                  onDurationChange={() =>
                    setPlayer({
                      ...player,
                      duration: Math.round(playerRef.current?.duration || 0)
                    })
                  }
                  onVolumeChange={() =>
                    setPlayer({
                      ...player,
                      muted: playerRef.current?.muted || false
                    })
                  }
                />
              )}

              <div
                className={`${styles.button} ${styles.mute} ${
                  player.muted ? styles.muted : ''
                } `}
                title={player.muted ? 'Unmute' : 'Mute'}
              >
                <SoundOutlined
                  onClick={() => {
                    if (playerRef.current)
                      playerRef.current.muted = !player.muted
                  }}
                />
              </div>
            </div>

            <div className={styles.time}>
              <div className={styles.current} title="Current time">
                {player.ready && !loading && (
                  <Clock seconds={player.currentTime} />
                )}
              </div>

              <Button
                size="small"
                className={`${styles.button} ${styles.loop} ${
                  profile[1] ? styles.loops : ''
                }`}
                onClick={() => setPlayer({ ...player, loops: !player.loops })}
                disabled={!player.ready || loading}
                title={player.loops ? 'Disable looping' : 'Enable looping'}
              >
                <RetweetOutlined />
              </Button>
              <Button
                size="small"
                className={`${styles.button} ${styles.import}`}
                onClick={() => importAudioInputRef.current?.click()}
                disabled={!player.ready || loading}
                title="Replace MP3"
              >
                {loading ? (
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{ color: 'var(--highlight-color)' }}
                        spin
                      />
                    }
                  />
                ) : (
                  <ImportOutlined />
                )}
              </Button>
              <Button
                size="small"
                className={`${styles.button} ${styles.delete}`}
                disabled={!player.ready || loading}
                onClick={() => setRemoveProfile(true)}
                title="Remove Profile"
              >
                <DeleteOutlined />
              </Button>

              <div
                className={styles.duration}
                style={{ textAlign: 'right' }}
                title="Duration"
              >
                {player.ready && !loading && (
                  <Clock seconds={player.duration} />
                )}
              </div>
            </div>
          </div>

          {info && (
            <Collapse destroyInactivePanel>
              <Collapse.Panel header="Track Info" key="track-info">
                <Metadata
                  audioPath={
                    removeProfile
                      ? null
                      : !removeProfile &&
                        player.ready &&
                        !loading &&
                        playerRef.current?.src !== dummyAudio
                      ? audioPath
                      : undefined
                  }
                  time={[player.currentTime, player.duration]}
                  onSeek={(time) => {
                    if (playerRef.current) playerRef.current.currentTime = time
                  }}
                />
              </Collapse.Panel>
            </Collapse>
          )}

          {/* <div>{profile[0]}</div> */}
        </>
      )}
    </div>
  )
}

AudioProfile.displayName = 'AudioProfile'

export default AudioProfile
