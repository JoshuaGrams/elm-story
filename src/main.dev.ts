/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import os from 'os'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import path from 'path'
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import MenuBuilder from './menu'
import contextMenu from 'electron-context-menu'
import fs from 'fs-extra'
import format from './lib/compiler/format'

import { WINDOW_EVENT_TYPE } from './lib/events'
import { GameDataJSON } from './lib/transport/types/0.5.0'

import logger from './lib/logger'

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

      ipcMain.on(
        WINDOW_EVENT_TYPE.EXPORT_GAME_START,
        async (_, gameData: string) => {
          if (mainWindow) {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Select folder to export PWA',
              properties: ['openDirectory']
            })

            if (!result.canceled) {
              mainWindow.webContents.send(
                WINDOW_EVENT_TYPE.EXPORT_GAME_PROCESSING
              )

              const parsedGameData: GameDataJSON = JSON.parse(gameData)

              const gameFolderName = `${parsedGameData._.title
                .replace(/[^A-Z0-9]+/gi, '-')
                .toLocaleLowerCase()}_${parsedGameData._.version}_${Date.now()}`

              const savePathBase = result.filePaths[0],
                savePathFull = `${savePathBase}/${gameFolderName}`

              const enginePath =
                process.env.NODE_ENV === 'development'
                  ? path.join(__dirname, '../assets/engine-dist')
                  : path.join(process.resourcesPath, 'assets/engine-dist')

              try {
                await fs.copy(enginePath, savePathFull)

                const manifest: { 'index.html': { file: string } } = JSON.parse(
                  await fs.readFile(`${savePathFull}/manifest.json`, 'utf8')
                )

                let [html, js, webmanifest] = await Promise.all([
                  fs.readFile(`${savePathFull}/index.html`, 'utf8'),
                  fs.readFile(
                    `${savePathFull}/${manifest['index.html'].file}`,
                    'utf8'
                  ),
                  fs.readFile(`${savePathFull}/manifest.webmanifest`, 'utf8')
                ])

                const gameDescription =
                  parsedGameData._.description ||
                  `${parsedGameData._.title} is a game made with Elm Story.`

                html = html
                  .replace('___gameTitle___', parsedGameData._.title)
                  .replace('___gameDescription___', gameDescription)
                js = js
                  .replace('___gameId___', parsedGameData._.id)
                  .replace(
                    '"___engineData___"',
                    JSON.stringify(format(parsedGameData))
                  )
                webmanifest = webmanifest
                  .replace(/___gameTitle___/g, parsedGameData._.title)
                  .replace('___gameDescription___', gameDescription)

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
                  fs.remove(`${savePathFull}/manifest.json`)
                ])
              } catch (error) {
                throw error
              }

              setTimeout(() => {
                shell.openPath(savePathFull)

                mainWindow?.webContents.send(
                  WINDOW_EVENT_TYPE.EXPORT_GAME_COMPLETE
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
  new AppUpdater()
}

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
