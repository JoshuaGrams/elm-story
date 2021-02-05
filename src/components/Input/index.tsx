import React from 'react'

import styles from './styles.module.scss'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default (props: InputProps) => {
  return <input className={styles.input} {...props} />
}
