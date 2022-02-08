import React, { useEffect, useRef, useState } from 'react'

import { AudioProfile as AudioProfileType } from '../../data/types'

import { Button, Slider, Spin } from 'antd'
import {
  DeleteOutlined,
  ImportOutlined,
  LoadingOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  PlaySquareOutlined,
  RetweetOutlined,
  SoundOutlined
} from '@ant-design/icons'

import Clock from '../Clock'

import styles from './styles.module.less'

const AudioProfile: React.FC<{
  profile?: AudioProfileType
  onImport: (audioData: ArrayBuffer) => Promise<void>
  onSelect: (profile: AudioProfileType) => Promise<void>
  onRequestAudioPath: (assetId: string) => Promise<[string, boolean]>
  onRemove?: () => void
}> = ({ profile, onImport, onSelect, onRequestAudioPath, onRemove }) => {
  const importAudioInputRef = useRef<HTMLInputElement>(null),
    playerRef = useRef<HTMLMediaElement>(null)

  const [importing, setImporting] = useState(false),
    [loading, setLoading] = useState(false),
    [importedAudioData, setImportedAudioData] = useState<ArrayBuffer | null>(
      null
    ),
    // null doesn't exist
    [audioPath, setAudioPath] = useState<string | undefined | null>(undefined)

  const [player, setPlayer] = useState({
    currentTime: 0,
    duration: 0,
    playing: false,
    muted: false
  })

  const processAudioImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
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

    setImporting(false)
    setLoading(false)
    setImportedAudioData(null)
  }

  useEffect(() => {
    async function saveAudioProfile() {
      if (!importing || !importedAudioData) return

      await onImport(importedAudioData)

      reset()
    }

    saveAudioProfile()
  }, [importing, importedAudioData, profile])

  useEffect(() => {
    importing && importAudioInputRef.current?.click()
  }, [importing, importAudioInputRef.current])

  useEffect(() => {
    async function getAudioPath() {
      if (!profile?.[0]) return

      const [path, exists] = await onRequestAudioPath(profile[0])

      setAudioPath(exists ? path : null)
    }

    profile?.[0] && getAudioPath()
  }, [profile?.[0]])

  useEffect(() => {
    console.log(audioPath)
  }, [audioPath])

  useEffect(() => {
    console.log(player)
  }, [player])

  return (
    <div className={styles.AudioProfile}>
      {!profile && (
        <div className={styles.createProfileButton}>
          <input
            ref={importAudioInputRef}
            type="file"
            accept="audio/mp3"
            style={{ display: 'none' }}
            onChange={processAudioImport}
          />

          <Button
            type="primary"
            onClick={() => setImporting(true)}
            disabled={loading}
          >
            {loading ? (
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ color: 'var(--highlight-color)', fontSize: 14 }}
                    spin
                  />
                }
              />
            ) : (
              'Create Profile'
            )}
          </Button>
        </div>
      )}

      {profile && audioPath && (
        <>
          <div className={styles.player}>
            <div className={styles.bar}>
              <div
                className={`${styles.button} ${styles.play}`}
                onClick={() =>
                  player.playing
                    ? playerRef.current?.pause()
                    : playerRef.current?.play()
                }
              >
                {!player.playing ? <PlayCircleOutlined /> : <PauseOutlined />}
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
              />

              <audio
                ref={playerRef}
                src={audioPath.replaceAll('"', '')}
                onPlay={() => setPlayer({ ...player, playing: true })}
                onPause={() => setPlayer({ ...player, playing: false })}
                onTimeUpdate={() =>
                  setPlayer({
                    ...player,
                    currentTime: Math.round(playerRef.current?.currentTime || 0)
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

              <div
                className={`${styles.button} ${styles.mute} ${
                  player.muted ? styles.muted : ''
                }`}
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
              <div className={styles.current}>
                <Clock seconds={player.currentTime} />
              </div>

              <Button
                size="small"
                className={`${styles.button} ${styles.loop}`}
              >
                <RetweetOutlined />
              </Button>
              <Button
                size="small"
                className={`${styles.button} ${styles.import}`}
              >
                <ImportOutlined />
              </Button>
              <Button
                size="small"
                className={`${styles.button} ${styles.delete}`}
              >
                <DeleteOutlined />
              </Button>

              <div className={styles.duration} style={{ textAlign: 'right' }}>
                <Clock seconds={player.duration} />
              </div>
            </div>
          </div>

          {/* <div>{profile[0]}</div> */}
        </>
      )}
    </div>
  )
}

AudioProfile.displayName = 'AudioProfile'

export default AudioProfile
