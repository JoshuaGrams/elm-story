import { values } from 'lodash'
import * as mm from 'music-metadata-browser'

import React, { useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'

import styles from './styles.module.less'

const initialMetadataState = {
  artist: undefined,
  album: undefined,
  title: undefined,
  cover: undefined,
  bitrate: undefined,
  sampleRate: undefined,
  codecProfile: undefined
}

const Metadata: React.FC<{ audioPath?: string | null }> = ({ audioPath }) => {
  const [metadata, setMetadata] = useState<{
    artist?: string
    album?: string
    title?: string
    cover?: string
    bitrate?: number
    sampleRate?: number
    codecProfile?: string
  } | null>({ ...initialMetadataState })

  useEffect(() => {
    async function fetchMetadata() {
      if (!audioPath) {
        setMetadata(null)

        return
      }

      try {
        const { format, common } = await mm.fetchFromUrl(audioPath),
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
      } catch (error) {
        throw error
      }
    }

    fetchMetadata()
  }, [audioPath])

  return (
    <div className={styles.info}>
      {metadata && (
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
                    <Marquee speed={10} delay={2} gradient={false} pauseOnClick>
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
                      title={`${metadata.bitrate / 1000}k ${
                        metadata.codecProfile ? ` ${metadata.codecProfile}` : ''
                      }`}
                    >
                      <>
                        <span>Bitrate</span>{' '}
                        <>
                          {metadata.bitrate / 1000}k
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
            <div className={styles.noData}>Missing ID3 tag data.</div>
          )}
        </div>
      )}

      {!metadata && audioPath !== null && (
        <div className={styles.loadingInfo}>Loading metadata...</div>
      )}
    </div>
  )
}

Metadata.displayName = 'Metadata'

export default Metadata
