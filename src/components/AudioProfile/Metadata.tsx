import logger from '../../lib/logger'

import { values } from 'lodash'
import * as mm from 'music-metadata-browser'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Marquee from 'react-fast-marquee'

import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

const positionProgressBar = (
  waveformElement: HTMLCanvasElement,
  progressBarElement: HTMLDivElement,
  time: [number, number]
) => {
  const waveformWidth = waveformElement.offsetWidth

  progressBarElement.style.left = `${Math.round(
    (time[0] * waveformWidth) / time[1] - (time[0] === time[1] ? 1 : 0)
  )}px`
}

const Metadata: React.FC<{
  audioPath?: string | null
  time: [number, number] // current time, duration
  onSeek: (time: number) => void
}> = ({ audioPath, time, onSeek }) => {
  const progressBarRef = useRef<HTMLDivElement>(null),
    seekBarRef = useRef<HTMLDivElement>(null),
    waveformRef = useRef<HTMLCanvasElement>(null)

  const [metadata, setMetadata] = useState<{
      artist?: string
      album?: string
      title?: string
      cover?: string
      bitrate?: number
      sampleRate?: number
      codecProfile?: string
    } | null>(null),
    [audioArrayBuffer, setAudioArrayBuffer] = useState<ArrayBuffer | null>(
      null
    ),
    [waveformLoading, setWaveformLoading] = useState(false)

  const seekByClickPosition = useCallback(
    (clickPosition: number) => {
      if (waveformRef.current) {
        const {
            left: waveformLeft,
            width: waveformWidth
          } = waveformRef.current.getBoundingClientRect(),
          relativeClickPosition = clickPosition - waveformLeft

        onSeek((relativeClickPosition * time[1]) / waveformWidth)
      }
    },
    [time, onSeek, waveformRef.current]
  )

  useEffect(() => {
    async function fetchMetadata() {
      if (!audioPath) {
        setMetadata(null)

        return
      }

      try {
        const _audioArrayBuffer = await (await fetch(audioPath)).arrayBuffer()

        try {
          const audioBlob = new Blob([_audioArrayBuffer])

          const { format, common } = await mm.parseBlob(audioBlob),
            cover = mm.selectCover(common.picture)

          // TODO: we shouldn't get this unless the designer expands the info box
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

          setAudioArrayBuffer(_audioArrayBuffer)
        } catch (error) {
          throw error
        }
      } catch (error) {
        throw error
      }
    }

    fetchMetadata()
  }, [audioPath])

  useEffect(() => {
    async function drawWave() {
      if (audioArrayBuffer && waveformRef.current && progressBarRef.current) {
        setWaveformLoading(true)

        const { width, height } = waveformRef.current,
          context = waveformRef.current.getContext('2d')

        if (!context) return

        context.fillStyle = 'hsl(0, 0%, 4%)'
        context.fillRect(0, 0, width, height)

        const audioContext = new AudioContext(),
          audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer)

        var data = audioBuffer.getChannelData(0)
        var step = Math.ceil(data.length / width)
        var amp = height / 2

        context.fillStyle = 'hsl(0, 0%, 25%)'

        for (var i = 0; i < width; i++) {
          var min = 1.0
          var max = -1.0

          for (var j = 0; j < step; j++) {
            var datum = data[i * step + j]

            if (datum < min) min = datum * 0.9
            if (datum > max) max = datum * 0.9
          }

          context.fillRect(
            i,
            (1 + min) * amp,
            1,
            Math.max(1, (max - min) * amp)
          )
        }

        try {
          waveformRef.current.style.display = 'unset'
          progressBarRef.current.style.display = 'unset'

          positionProgressBar(waveformRef.current, progressBarRef.current, time)

          setWaveformLoading(false)
        } catch (error) {
          logger.error('Unable to set waveformRef styles')
        }
      }
    }

    drawWave()
  }, [audioArrayBuffer, waveformRef.current, progressBarRef.current])

  useEffect(() => {
    if (!waveformRef.current || !progressBarRef.current) return

    positionProgressBar(waveformRef.current, progressBarRef.current, time)
  }, [time, waveformRef.current, progressBarRef.current])

  return (
    <div className={styles.info}>
      {metadata && (
        <>
          <div
            className={styles.metadata}
            style={{
              gridTemplateColumns: metadata.cover ? '72px auto' : 'auto'
            }}
          >
            {values(metadata).some((prop) => prop !== undefined) ? (
              <>
                {metadata.cover && (
                  <div
                    className={styles.cover}
                    style={{
                      backgroundImage: `url(${metadata.cover || ''})`
                    }}
                  />
                )}
                <div className={styles.data}>
                  <ul>
                    <li
                      className={styles.trackHeader}
                      title={`${metadata.artist || 'Unknown Artist'} - ${
                        metadata.title || 'Unknown Title'
                      }`}
                    >
                      <Marquee
                        speed={10}
                        delay={2}
                        gradient={false}
                        pauseOnClick
                      >
                        <div style={{ paddingRight: 20 }}>
                          {metadata.artist || 'Unknown Artist'} &mdash;{' '}
                          {metadata.title || 'Unknown Title'}
                        </div>
                      </Marquee>
                    </li>

                    {metadata.album && (
                      <li title={metadata.album}>
                        <>
                          <span>Album</span> {metadata.album}
                        </>
                      </li>
                    )}

                    {metadata.bitrate && (
                      <li
                        title={`${Math.round(metadata.bitrate / 1000)}k ${
                          metadata.codecProfile
                            ? ` ${metadata.codecProfile}`
                            : ''
                        }`}
                      >
                        <>
                          <span>Bitrate</span>{' '}
                          <>
                            {Math.round(metadata.bitrate / 1000)}k
                            {metadata.codecProfile
                              ? ` ${metadata.codecProfile}`
                              : ''}
                          </>
                        </>
                      </li>
                    )}

                    {metadata.sampleRate && (
                      <li title={`${metadata.sampleRate / 1000} kHz`}>
                        <>
                          <span>Sample Rate</span>{' '}
                          <>{metadata.sampleRate / 1000} kHz</>
                        </>
                      </li>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              // This is unlikely to happen because we get format data
              <div className={styles.noData}>Missing ID3 tag data.</div>
            )}
          </div>

          <div className={styles.waveform}>
            {waveformLoading && (
              <div className={styles.loading}>
                <Spin indicator={<LoadingOutlined spin />} />
              </div>
            )}

            <div ref={progressBarRef} className={styles.progressBar} />
            <div ref={seekBarRef} className={styles.seekBar} />

            <canvas
              ref={waveformRef}
              onMouseOver={() => {
                if (seekBarRef.current) seekBarRef.current.style.opacity = '1'
              }}
              onMouseOut={() => {
                if (seekBarRef.current) seekBarRef.current.style.opacity = '0'
              }}
              onMouseMove={(event) => {
                if (waveformRef.current && seekBarRef.current) {
                  const {
                    left: waveformLeft
                  } = waveformRef.current.getBoundingClientRect()

                  if (event.buttons === 1) {
                    seekByClickPosition(event.clientX)
                  }

                  seekBarRef.current.style.left = `${
                    event.clientX - waveformLeft
                  }px`
                }
              }}
              onClick={(event) => seekByClickPosition(event.clientX)}
            />
          </div>
        </>
      )}

      {!metadata && audioPath !== null && (
        <div className={styles.loadingInfo}>Loading metadata...</div>
      )}
    </div>
  )
}

Metadata.displayName = 'Metadata'

export default Metadata
