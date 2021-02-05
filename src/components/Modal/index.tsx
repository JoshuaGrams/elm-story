import React from 'react'

import styles from './styles.module.scss'

type ModalProps = {
  show?: boolean
  children: React.ReactNode
}

export default ({ show = false, children }: ModalProps) => {
  return <div className={`${styles.modal} ${!show ? styles.hide : ''}`}>{children}</div>
}
