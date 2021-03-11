import React, { useState } from 'react'

import DockLayout, { LayoutData } from 'rc-dock'

const ComponentEditor: React.FC = () => {
  const [defaultLayout] = useState<LayoutData>({
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          tabs: [
            {
              id: 't1',
              title: 'Tab Test 1',
              content: <div style={{ padding: '10px' }}>Tab Test 1</div>,
              group: 'default',
              closable: true
            },
            {
              id: 't2',
              title: 'Tab Test 2',
              content: <div style={{ padding: '10px' }}>Tab Test 2</div>,
              group: 'default',
              closable: true
            }
          ]
        }
      ]
    }
  })

  return (
    <DockLayout
      defaultLayout={defaultLayout}
      groups={{
        default: {
          floatable: false,
          animated: false,
          maximizable: true
        }
      }}
      dropMode="edge"
    />
  )
}

export default ComponentEditor
