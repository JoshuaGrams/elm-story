import React, { useState } from 'react'

import { EditorContext } from '../../contexts/EditorContext'

import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import styles from './styles.module.less'

const GameInspector: React.FC = () => {
  const [defaultLayout] = useState<LayoutData>({
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          tabs: [
            {
              id: 'propertiesTab',
              title: 'Properties',
              content: (
                <EditorContext.Consumer>
                  {({ editor }) => (
                    <div>
                      {editor.selectedGameOutlineComponent.id ? (
                        <>
                          <div>
                            Title: {editor.selectedGameOutlineComponent.title}
                          </div>
                          <div>
                            Type: {editor.selectedGameOutlineComponent.type}
                          </div>
                        </>
                      ) : (
                        <div>Nothing Selected</div>
                      )}
                    </div>
                  )}
                </EditorContext.Consumer>
              ),
              group: 'default'
            },
            {
              id: 'problemsTab',
              title: 'Problems',
              content: <div>Problems</div>,
              group: 'default'
            }
          ]
        }
      ]
    }
  })

  return (
    <DividerBox className={styles.gameInspector} mode="vertical">
      <DockLayout
        defaultLayout={defaultLayout}
        groups={{
          default: {
            floatable: false,
            animated: false,
            maximizable: false
          }
        }}
        dropMode="edge"
      />
    </DividerBox>
  )
}

export default GameInspector
