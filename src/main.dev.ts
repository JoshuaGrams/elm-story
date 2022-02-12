/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import logger from './lib/logger'

import os from 'os'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import path from 'path'
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import MenuBuilder from './menu'
import contextMenu from 'electron-context-menu'
import fs, { outputFile } from 'fs-extra'
import format from './lib/compiler/format'
import md5 from 'md5'

import { WINDOW_EVENT_TYPE } from './lib/events'

import {
  WorldId,
  StudioId,
  WORLD_EXPORT_TYPE,
  PLATFORM_TYPE
} from './data/types'
import { WorldDataJSON } from './lib/transport/types/0.6.0'

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

contextMenu({
  showLookUpSelection: false,
  showCopyImage: false,
  showCopyImageAddress: false,
  showSaveImageAs: false,
  showSaveLinkAs: false,
  showInspectElement: false,
  showServices: false,
  showSearchWithGoogle: false
})

let mainWindow: BrowserWindow | null = null

const userDataPath = app.getPath('userData'),
  userCachePath = `${userDataPath}/.cache`,
  userTrashPath = `${userDataPath}/.trash`

logger.info(`ENV: ${process.env.NODE_ENV}`)

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  logger.info(`Installing dev tools...`)

  return installer
    .default(
      extensions.map((name) => installer[name]),
      { forceDownload, loadExtensionOptions: { allowFileAccess: true } }
    )
    .catch(logger.info)
}

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  const { width, height } =
    process.env.NODE_ENV === 'development'
      ? {
          width: 1920,
          height: 1080
        }
      : { width: 1366, height: 728 }

  mainWindow = new BrowserWindow({
    show: false,
    width,
    height,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // used for react dev tools
    },
    frame: false,
    backgroundColor: '#0a0a0a'
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  let eventsReady = false

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }

    mainWindow.webContents.send(
      mainWindow.fullScreen
        ? WINDOW_EVENT_TYPE.FULLSCREEN
        : WINDOW_EVENT_TYPE.FLOAT
    )

    mainWindow.webContents.send(WINDOW_EVENT_TYPE.PLATFORM, [os.platform()])

    if (!eventsReady) {
      eventsReady = true

      mainWindow.on('enter-full-screen', () =>
        mainWindow?.webContents.send(WINDOW_EVENT_TYPE.FULLSCREEN)
      )
      mainWindow.on('leave-full-screen', () =>
        mainWindow?.webContents.send(WINDOW_EVENT_TYPE.FLOAT)
      )

      ipcMain.on(WINDOW_EVENT_TYPE.QUIT, () => app.quit())
      ipcMain.on(WINDOW_EVENT_TYPE.MINIMIZE, () => mainWindow?.minimize())
      ipcMain.on(WINDOW_EVENT_TYPE.TOGGLE_FULLSCREEN, (_, isFullscreen) => {
        if (mainWindow) {
          if (isFullscreen && !mainWindow.fullScreen)
            mainWindow.setFullScreen(true)
          if (!isFullscreen && mainWindow.fullScreen)
            mainWindow.setFullScreen(false)
        }
      })

      ipcMain.on(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, (_, [address]) =>
        shell.openExternal(address)
      )

      ipcMain.handle(
        WINDOW_EVENT_TYPE.SAVE_ASSET,
        async (
          _,
          {
            studioId,
            worldId,
            id,
            data,
            ext
          }: {
            studioId: StudioId
            worldId: WorldId
            id: string
            data: ArrayBuffer
            ext: 'jpeg' | 'webp' | 'mp3'
          }
        ): Promise<string | null> => {
          const path = `${userDataPath}/assets/${studioId}/${worldId}/${id}.${ext}`

          try {
            await outputFile(path, Buffer.from(data))

            return path
          } catch (error) {
            // TODO: return error to app
            throw error
          }
        }
      )

      ipcMain.handle(
        WINDOW_EVENT_TYPE.RESTORE_ASSET,
        async (
          _,
          {
            studioId,
            worldId,
            id,
            ext
          }: {
            studioId: StudioId
            worldId: WorldId
            id: string
            data: ArrayBuffer
            ext: 'jpeg' | 'webp'
          }
        ) => {
          const assetsPath = `${userDataPath}/assets/${studioId}/${worldId}`,
            assetInTrashPath = `${userTrashPath}/${id}.${ext}`

          try {
            if (!(await fs.pathExists(assetInTrashPath))) return

            await fs.move(assetInTrashPath, `${assetsPath}/${id}.${ext}`)
          } catch (error) {
            // TODO: return error to app
            throw error
          }
        }
      )

      ipcMain.handle(
        WINDOW_EVENT_TYPE.REMOVE_ASSET,
        async (
          _,
          {
            studioId,
            worldId,
            id,
            ext,
            trash
          }: {
            studioId: StudioId
            worldId: WorldId
            id: string
            data: ArrayBuffer
            ext: 'jpeg' | 'webp'
            trash?: boolean
          }
        ) => {
          const assetsPath = `${userDataPath}/assets/${studioId}/${worldId}`,
            assetPath = `${assetsPath}/${id}.${ext}`

          try {
            if (!(await fs.pathExists(assetPath))) return

            if (trash) {
              // elmstorygames/feedback#239
              await fs.move(assetPath, `${userTrashPath}/${id}.${ext}`, {
                overwrite: true
              })
            }

            if (!trash) {
              await fs.remove(assetPath)
            }
          } catch (error) {
            // TODO: return error to app
            // see api().events.removeDeadImageAssets
          }
        }
      )

      // removes studio or world assets
      ipcMain.handle(
        WINDOW_EVENT_TYPE.REMOVE_ASSETS,
        async (
          _,
          {
            studioId,
            worldId,
            type
          }: { studioId: StudioId; worldId?: WorldId; type: 'STUDIO' | 'GAME' }
        ) => {
          if (type === 'GAME' && !worldId)
            throw 'Unable to remove storyworld assets. Missing ID.'

          const root = `${userDataPath}/assets`

          let path: string | undefined

          switch (type) {
            case 'STUDIO':
              path = `${root}/${studioId}/`
              break
            case 'GAME':
              path = `${root}/${studioId}/${worldId}`
              break
            default:
              break
          }

          path && (await fs.remove(path))
        }
      )

      // TODO: also return binary data
      ipcMain.handle(
        WINDOW_EVENT_TYPE.GET_ASSET,
        async (
          _,
          {
            studioId,
            worldId,
            id,
            ext
          }: {
            studioId: StudioId
            worldId: WorldId
            id: string
            ext: 'jpeg' | 'webp' | 'mp3'
          }
        ) => {
          let platformAssetPath: string

          switch (os.platform()) {
            case PLATFORM_TYPE.WINDOWS:
              platformAssetPath = `${userDataPath}/assets/${studioId}/${worldId}/${id}.${ext}`.replace(
                /\\/g,
                '/'
              )
              break
            case PLATFORM_TYPE.MACOS:
            case PLATFORM_TYPE.LINUX:
            default:
              platformAssetPath = `${userDataPath}/assets/${studioId}/${worldId}/${id}.${ext}`

              break
          }

          const exists = await fs.pathExists(platformAssetPath)

          if (!exists) return [`"${platformAssetPath}"`, false]

          // elmstorygames/feedback#238
          // copy asset to cache if asset is mp3 and return url
          if (ext === 'mp3') {
            const platformAssetCopyPath = `${userCachePath}/${id}.${ext}`

            try {
              // elmstorygames/feedback#243
              const assetCacheExists = await fs.pathExists(
                platformAssetCopyPath
              )

              if (assetCacheExists) return [`"${platformAssetCopyPath}"`, true]

              await fs.copy(platformAssetPath, platformAssetCopyPath)

              return [`"${platformAssetCopyPath}"`, true]
            } catch (error) {
              throw error
            }
          }

          return [`"${platformAssetPath}"`, exists]
        }
      )

      ipcMain.handle(
        WINDOW_EVENT_TYPE.IMPORT_WORLD_GET_JSON,
        async (
          _
        ): Promise<{ worldData?: WorldDataJSON; jsonPath?: string }> => {
          if (mainWindow) {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: `Select storyworld JSON to import`,
              properties: ['openFile']
            })

            if (!result.canceled) {
              try {
                return {
                  worldData: JSON.parse(
                    await fs.readFile(result.filePaths[0], 'utf8')
                  ),
                  jsonPath: result.filePaths[0]
                }
              } catch (error) {
                throw error
              }
            }

            return { worldData: undefined, jsonPath: undefined }
          }

          return { worldData: undefined, jsonPath: undefined }
        }
      )

      ipcMain.handle(
        WINDOW_EVENT_TYPE.IMPORT_WORLD_ASSETS,
        async (
          _,
          {
            studioId,
            worldId,
            jsonPath
          }: { studioId: StudioId; worldId: WorldId; jsonPath: string }
        ) => {
          try {
            const worldDirectory = path.dirname(jsonPath)

            await fs.copy(
              `${worldDirectory}/assets`,
              `${userDataPath}/assets/${studioId}/${worldId}/`.replace(
                /\\/g,
                '/'
              )
            )
          } catch (error) {
            // directory doesn't exist; skip
          }
        }
      )

      ipcMain.handle(
        WINDOW_EVENT_TYPE.EXPORT_WORLD_START,
        async (
          _,
          {
            type: worldType,
            data: worldDataAsString
          }: { type: WORLD_EXPORT_TYPE; data: string }
        ) => {
          if (mainWindow) {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: `Select folder to export storyworld as ${worldType}`,
              properties: ['openDirectory']
            })

            if (!result.canceled) {
              mainWindow.webContents.send(
                WINDOW_EVENT_TYPE.EXPORT_WORLD_PROCESSING
              )

              const parsedWorldData: WorldDataJSON = JSON.parse(
                worldDataAsString
              )

              const baseWorldFolderName = `${parsedWorldData._.title
                  .replace(/[^A-Z0-9]+/gi, '-')
                  .toLocaleLowerCase()}_${parsedWorldData._.version}`,
                fullWorldFolderName = `${baseWorldFolderName}_${Date.now()}`

              const savePathBase = result.filePaths[0],
                savePathFull = `${savePathBase}/${fullWorldFolderName}`

              if (worldType === WORLD_EXPORT_TYPE.JSON) {
                try {
                  await fs.outputFile(
                    `${savePathFull}/${baseWorldFolderName}.json`,
                    worldDataAsString
                  )

                  try {
                    await fs.copy(
                      `${userDataPath}/assets/${parsedWorldData._.studioId}/${parsedWorldData._.id}`.replace(
                        /\\/g,
                        '/'
                      ),
                      `${savePathFull}/assets`
                    )
                  } catch (error) {
                    logger.info(`Assets don't exist. Skipping...`)
                  }
                } catch (error) {
                  throw error
                }
              }

              if (worldType === WORLD_EXPORT_TYPE.PWA) {
                const enginePath =
                  process.env.NODE_ENV === 'development'
                    ? path.join(__dirname, '../assets/engine-dist')
                    : path.join(process.resourcesPath, 'assets/engine-dist')

                try {
                  await fs.copy(enginePath, savePathFull)

                  try {
                    await fs.copy(
                      `${userDataPath}/assets/${parsedWorldData._.studioId}/${parsedWorldData._.id}/`.replace(
                        /\\/g,
                        '/'
                      ),
                      `${savePathFull}/assets/content`
                    )
                  } catch (error) {
                    logger.info(`Assets don't exist. Skipping...`)
                  }

                  const manifest: {
                    'index.html': { file: string }
                  } = JSON.parse(
                    await fs.readFile(`${savePathFull}/manifest.json`, 'utf8')
                  )

                  let [html, js, webmanifest, sw] = await Promise.all([
                    fs.readFile(`${savePathFull}/index.html`, 'utf8'),
                    fs.readFile(
                      `${savePathFull}/${manifest['index.html'].file}`,
                      'utf8'
                    ),
                    fs.readFile(`${savePathFull}/manifest.webmanifest`, 'utf8'),
                    fs.readFile(`${savePathFull}/sw.js`, 'utf8')
                  ])

                  const worldDescription =
                    parsedWorldData._.description ||
                    `${parsedWorldData._.title} is a storyworld made with Elm Story.`

                  html = html
                    .replace(/___worldTitle___/g, parsedWorldData._.title)
                    .replace(/___worldDescription___/g, worldDescription)
                  js = js
                    .replace('___worldId___', parsedWorldData._.id)
                    .replace(
                      '"___storytellerData___"',
                      JSON.stringify(format(parsedWorldData))
                    )
                  webmanifest = webmanifest
                    .replace(/___worldTitle___/g, parsedWorldData._.title)
                    .replace('___worldDescription___', worldDescription)

                  // #379, #373
                  const swIndexRevSearchString = `index.html",revision:"`,
                    startingIndexRevReplacePosition =
                      sw.indexOf(swIndexRevSearchString) +
                      swIndexRevSearchString.length,
                    newIndexHash = md5(html)

                  // update index revision
                  sw = `${sw.substr(
                    0,
                    startingIndexRevReplacePosition
                  )}${newIndexHash}${sw.substr(
                    startingIndexRevReplacePosition + newIndexHash.length
                  )}`

                  const swJSRevSearchString = `${manifest['index.html'].file}",revision:"`,
                    startingJSRevReplacePosition =
                      sw.indexOf(swJSRevSearchString) +
                      swJSRevSearchString.length,
                    newJSHash = md5(js)

                  // update js revision
                  sw = `${sw.substr(
                    0,
                    startingJSRevReplacePosition
                  )}${newJSHash}${sw.substr(
                    startingJSRevReplacePosition + newJSHash.length
                  )}`

                  // update content assets
                  try {
                    const contentAssetsList = await fs.readdir(
                      `${savePathFull}/assets/content`
                    )

                    if (contentAssetsList.length > 0) {
                      const swManifestRevSearchString = `manifest.webmanifest",revision:"`,
                        startingAssetInsertPosition =
                          sw.indexOf(swManifestRevSearchString) +
                          swManifestRevSearchString.length +
                          34

                      let assets: { filename: string; md5: string }[] = []

                      await Promise.all(
                        contentAssetsList.map(async (assetFilename) => {
                          assets.push({
                            filename: assetFilename,
                            md5: md5(
                              await fs.readFile(
                                `${savePathFull}/assets/content/${assetFilename}`
                              )
                            )
                          })
                        })
                      )

                      let assetDataToInsert = ''

                      assets.map((asset) => {
                        assetDataToInsert =
                          assetDataToInsert +
                          `,{url:"assets/content/${asset.filename}",revision:"${asset.md5}"}`
                      })

                      sw = [
                        sw.slice(0, startingAssetInsertPosition),
                        assetDataToInsert,
                        sw.slice(startingAssetInsertPosition)
                      ].join('')
                    }
                  } catch (error) {
                    logger.info('Asset content does not exist. Skipping...')
                  }

                  await Promise.all([
                    fs.writeFile(`${savePathFull}/index.html`, html),
                    fs.writeFile(
                      `${savePathFull}/${manifest['index.html'].file}`,
                      js
                    ),
                    fs.writeFile(
                      `${savePathFull}/manifest.webmanifest`,
                      webmanifest
                    ),
                    fs.writeFile(`${savePathFull}/sw.js`, sw),
                    fs.remove(`${savePathFull}/manifest.json`)
                  ])
                } catch (error) {
                  throw error
                }
              }

              setTimeout(() => {
                shell.openPath(savePathFull)

                mainWindow?.webContents.send(
                  WINDOW_EVENT_TYPE.EXPORT_WORLD_COMPLETE
                )
              }, 5000)
            }
          }
        }
      )
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater()
}

// elmstorygames/feedback#110
fs.emptyDir(`${userTrashPath}`)

// elmstorygames/feedback#238
fs.emptyDir(`${userCachePath}`)

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.whenReady().then(createWindow).catch(logger.info)

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})
