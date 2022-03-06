import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
  WebContents
} from 'electron'

import { WINDOW_EVENT_TYPE } from './lib/events'

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string
  submenu?: DarwinMenuItemConstructorOptions[] | Menu
}

// elmstorygames/feedback#284
const ZOOM_UI_INCREMENT: number = 0.2

enum ZOOM_TYPE {
  IN = 'IN',
  OUT = 'OUT',
  RESET = 'RESET'
}

const zoomUI = (webContents: WebContents, zoomType: ZOOM_TYPE) => {
  if (zoomType === ZOOM_TYPE.RESET) {
    webContents.setZoomLevel(0)
    return
  }

  const currentZoomLevel = webContents.getZoomLevel()

  if (currentZoomLevel < 3 && zoomType === ZOOM_TYPE.IN) {
    webContents.setZoomLevel(
      parseFloat((currentZoomLevel + ZOOM_UI_INCREMENT).toFixed(2))
    )
  }

  if (currentZoomLevel > -1 && zoomType === ZOOM_TYPE.OUT) {
    webContents.setZoomLevel(
      parseFloat((currentZoomLevel - ZOOM_UI_INCREMENT).toFixed(2))
    )
  }
}

export default class MenuBuilder {
  mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  buildMenu(): Menu {
    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate()

    const menu = Menu.buildFromTemplate(template)

    Menu.setApplicationMenu(menu)

    return menu
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Elm Story',
      submenu: [
        {
          label: 'Hide Elm Story',
          accelerator: 'CmdOrCtrl+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'CmdOrCtrl+Shift+H',
          selector: 'hideOtherApplications:'
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    }

    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    }

    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Zoom UI In',
          accelerator: 'CmdOrCtrl+Alt+=',
          click: () => zoomUI(this.mainWindow.webContents, ZOOM_TYPE.IN)
        },
        {
          label: 'Zoom UI Out',
          accelerator: 'CmdOrCtrl+Alt+-',
          click: () => zoomUI(this.mainWindow.webContents, ZOOM_TYPE.OUT)
        },
        {
          label: 'Reset UI Zoom',
          accelerator: 'CmdOrCtrl+Alt+0',
          click: () => zoomUI(this.mainWindow.webContents, ZOOM_TYPE.RESET)
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => this.mainWindow.webContents.reload()
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () =>
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools()
          }
        }
      ]
    }

    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Zoom UI In',
          accelerator: 'CmdOrCtrl+Alt+=',
          click: () => zoomUI(this.mainWindow.webContents, ZOOM_TYPE.IN)
        },

        {
          label: 'Zoom UI Out',
          accelerator: 'CmdOrCtrl+Alt+-',
          click: () => zoomUI(this.mainWindow.webContents, ZOOM_TYPE.OUT)
        },
        {
          label: 'Reset UI Zoom',
          accelerator: 'CmdOrCtrl+Alt+0',
          click: () => zoomUI(this.mainWindow.webContents, ZOOM_TYPE.RESET)
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => this.mainWindow.webContents.reload()
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+CmdOrCtrl+F',
          click: () =>
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
        }
        // #DEV - test prod builds
        // {
        //   label: 'Toggle Developer Tools',
        //   accelerator: 'Alt+CmdOrCtrl+I',
        //   click: () => this.mainWindow.webContents.toggleDevTools()
        // }
      ]
    }

    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () =>
            this.mainWindow.webContents.send(
              WINDOW_EVENT_TYPE.CLOSE_TAB_OR_WINDOW
            )
        },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' }
      ]
    }

    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://elmstorygames.itch.io/elm-story/')
          }
        },
        {
          label: 'Help',
          click() {
            shell.openExternal('https://elmstory.com/help/')
          }
        },
        {
          label: 'Community',
          click() {
            shell.openExternal('https://elmstory.com/community/')
          }
        }
      ]
    }

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp]
  }

  buildDefaultTemplate() {
    const templateDefault: MenuItemConstructorOptions[] = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'CmdOrCtrl+O'
          },
          {
            label: '&Close',
            accelerator: 'CmdOrCtrl+W',
            click: () =>
              this.mainWindow.webContents.send(
                WINDOW_EVENT_TYPE.CLOSE_TAB_OR_WINDOW
              )
          }
        ]
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: 'Zoom UI In',
                  accelerator: 'CmdOrCtrl+Alt+=',
                  click: () => zoomUI(this.mainWindow.webContents, ZOOM_TYPE.IN)
                },

                {
                  label: 'Zoom UI Out',
                  accelerator: 'CmdOrCtrl+Alt+-',
                  click: () =>
                    zoomUI(this.mainWindow.webContents, ZOOM_TYPE.OUT)
                },
                {
                  label: 'Reset UI Zoom',
                  accelerator: 'CmdOrCtrl+Alt+0',
                  click: () =>
                    zoomUI(this.mainWindow.webContents, ZOOM_TYPE.RESET)
                },
                {
                  label: '&Reload',
                  accelerator: 'CmdOrCtrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload()
                  }
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    )
                  }
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+CmdOrCtrl+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools()
                  }
                }
              ]
            : [
                {
                  label: 'Zoom UI In',
                  accelerator: 'CmdOrCtrl+Alt+=',
                  click: () => zoomUI(this.mainWindow.webContents, ZOOM_TYPE.IN)
                },
                {
                  label: 'Zoom UI Out',
                  accelerator: 'CmdOrCtrl+Alt+-',
                  click: () =>
                    zoomUI(this.mainWindow.webContents, ZOOM_TYPE.OUT)
                },
                {
                  label: 'Reset UI Zoom',
                  accelerator: 'CmdOrCtrl+Alt+0',
                  click: () =>
                    zoomUI(this.mainWindow.webContents, ZOOM_TYPE.RESET)
                },
                {
                  label: '&Reload',
                  accelerator: 'CmdOrCtrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload()
                  }
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    )
                  }
                }
                // #DEV - test prod builds
                // {
                //   label: 'Toggle &Developer Tools',
                //   accelerator: 'Alt+CmdOrCtrl+I',
                //   click: () => {
                //     this.mainWindow.webContents.toggleDevTools()
                //   }
                // }
              ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('https://elmstorygames.itch.io/elm-story/')
            }
          },
          {
            label: 'Help',
            click() {
              shell.openExternal('https://elmstory.com/help/')
            }
          },
          {
            label: 'Community',
            click() {
              shell.openExternal('https://elmstory.com/community/')
            }
          }
        ]
      }
    ]

    return templateDefault
  }
}
