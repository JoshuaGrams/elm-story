import React from 'react'

import ProfileList from '../../components/ProfileList'

import styles from './styles.module.scss'

export default () => {
  return (
    <div>
      <ProfileList className={styles.profiles} />
    </div>
  )
}
