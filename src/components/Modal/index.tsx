import React from 'react'
import { useEffect } from 'react'

import styles from './styles.module.scss'

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  show?: boolean
  onHide?: () => void
}

export default ({
  show = false,
  onHide,
  children,
  className = ''
}: ModalProps) => {
  useEffect(() => {
    // Hide scroll bar when modal is open
    document.body.style.overflow = show ? 'hidden' : 'unset'

    if (!show && onHide) onHide()
  }, [show])

  return (
    <div className={`${styles.modal} ${className} ${show ? styles.show : ''}`}>
      <div className={styles.wrapper}>{children}</div>
    </div>
  )
}
