import React from 'react'

import TabContentToolbar from './TabContentToolbar'

import styles from './styles.module.less'

const TabContent: React.FC<{ view: JSX.Element; tools: JSX.Element }> = ({
  tools,
  view
}) => {
  return (
    <div className={styles.TabContent}>
      <TabContentToolbar>{tools}</TabContentToolbar>
      <div className={styles.TabContentView}>{view}</div>
    </div>
  )
}

export default TabContent
