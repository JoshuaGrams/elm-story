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
              title: 'Diner (INT)',
              content: <div>Diner (INT) Flow</div>,
              group: 'content',
              closable: true
            },
            {
              id: 't2',
              title: 'Diner (EXT)',
              content: <div>Diner (EXT) Flow</div>,
              group: 'content',
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
