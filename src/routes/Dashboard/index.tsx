import React from 'react'

import ProfileList from '../../components/ProfileList'

import styles from './styles.scss'

export default () => {
  return (
    <div>
      <h1>Elm Story</h1>
      <ProfileList className={styles.profiles} />
    </div>
  )
}
