import * as mm from 'music-metadata-browser'

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

import Marquee from 'react-fast-marquee'

import Clock from '../Clock'

import styles from './styles.module.less'

const playerInitialState = {
  currentTime: 0,
  duration: 0,
  playing: false,
  muted: false,
  ready: false
}

const metadataInitialState = {
  artist: undefined,
  album: undefined,
  title: undefined,
  cover: undefined,
  bitrate: undefined,
  sampleRate: undefined,
  codecProfile: undefined
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

  const [importing, setImporting] = useState(false),
    [loading, setLoading] = useState(false),
    [importedAudioData, setImportedAudioData] = useState<ArrayBuffer | null>(
      null
    ),
    // null doesn't exist
    [audioPath, setAudioPath] = useState<string | undefined | null>(undefined),
    [metadata, setMetadata] = useState<{
      artist?: string
      album?: string
      title?: string
      cover?: string
      bitrate?: number
      sampleRate?: number
      codecProfile?: string
    }>({ ...metadataInitialState })

  const [player, setPlayer] = useState({
    ...playerInitialState
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

      // elmstorygames/feedback#232
      setPlayer({ ...playerInitialState, ready: false })

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
    async function fetchMetadata() {
      if (!audioPath) return

      console.log(audioPath)

      try {
        const { format, common } = await mm.fetchFromUrl(audioPath),
          cover = mm.selectCover(common.picture)

        setMetadata({
          album: common.album,
          artist: common.artist,
          bitrate: format.bitrate,
          codecProfile: format.codecProfile,
          cover: cover
            ? `data:${cover.format};base64,${cover.data.toString('base64')}`
            : undefined,
          sampleRate: format.sampleRate,
          title: common.title
        })
      } catch (error) {
        throw error
      }
    }

    fetchMetadata()
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

      {profile && audioPath && (
        <>
          <div
            className={`${styles.player} ${
              !player.ready ? styles.disabled : ''
            }`}
          >
            <div className={styles.bar}>
              <div
                className={`${styles.button} ${styles.play}`}
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

              <audio
                ref={playerRef}
                src={audioPath}
                onCanPlay={() => setPlayer({ ...player, ready: true })}
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
                } `}
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
                {player.ready && <Clock seconds={player.currentTime} />}
              </div>

              <Button
                size="small"
                className={`${styles.button} ${styles.loop}`}
                disabled={!player.ready}
              >
                <RetweetOutlined />
              </Button>
              <Button
                size="small"
                className={`${styles.button} ${styles.import}`}
                disabled={!player.ready}
              >
                <ImportOutlined />
              </Button>
              <Button
                size="small"
                className={`${styles.button} ${styles.delete}`}
                disabled={!player.ready}
              >
                <DeleteOutlined />
              </Button>

              <div className={styles.duration} style={{ textAlign: 'right' }}>
                {player.ready && <Clock seconds={player.duration} />}
              </div>
            </div>
          </div>

          {info && (
            <Collapse destroyInactivePanel>
              <Collapse.Panel header="Track Info" key="track-info">
                <div className={styles.info}>
                  <div
                    className={styles.cover}
                    style={{
                      backgroundImage: `url(${metadata.cover || ''})`
                    }}
                  />
                  <div className={styles.data}>
                    <ul>
                      <li
                        className={styles.trackHeader}
                        title={`${metadata.artist} - ${metadata.title}`}
                      >
                        {player.ready && (
                          <Marquee
                            speed={10}
                            delay={2}
                            gradient={false}
                            // gradientColor={[10, 10, 10]}
                            // gradientWidth={20}
                            pauseOnClick
                          >
                            <div style={{ paddingRight: 20 }}>
                              {metadata.artist} &mdash; {metadata.title}
                            </div>
                          </Marquee>
                        )}
                      </li>

                      {metadata.album && (
                        <li title={metadata.album}>
                          <>
                            <span>Album</span> {player.ready && metadata.album}
                          </>
                        </li>
                      )}

                      {metadata.bitrate && (
                        <li title={`${metadata.bitrate / 1000}k`}>
                          <>
                            <span>Bitrate</span>{' '}
                            {player.ready && (
                              <>
                                {metadata.bitrate / 1000}k
                                {metadata.codecProfile
                                  ? ` ${metadata.codecProfile}`
                                  : ''}
                              </>
                            )}
                          </>
                        </li>
                      )}

                      {metadata.sampleRate && (
                        <li title={`${metadata.sampleRate}`}>
                          <>
                            <span>Sample Rate</span>{' '}
                            {player.ready && (
                              <>{metadata.sampleRate / 1000} kHz</>
                            )}
                          </>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
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
