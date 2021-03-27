import React from 'react'

import styles from './styles.module.less'

const TabToolbar: React.FC = ({ children }) => {
  return <div className={styles.TabContentToolbar}>{children}</div>
}

export default TabToolbar
