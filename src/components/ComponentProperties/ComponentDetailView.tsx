import React from 'react'

import { Collapse } from 'antd'

export enum COMPONENT_DETAIL_VIEW_TITLE {
  CHOICE = 'Choice Details'
}

export enum COMPONENT_DETAIL_VIEW_ID {
  CHOICE = 'choice-details'
}

const ComponentDetailView: React.FC<{ id: string; title: string }> = ({
  id,
  title,
  children
}) => {
  return (
    <Collapse.Panel header={title} key={id}>
      {children}
    </Collapse.Panel>
  )
}

export default ComponentDetailView
