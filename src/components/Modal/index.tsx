import React, { useEffect } from 'react'
import { DocumentId } from '../../data/types'

import Transition, { TRANSITION_TYPE } from '../Transition'

import styles from './styles.module.less'

export interface ModalProps {
  open?: boolean // is the modal open?
  onCreate?: (documentId: DocumentId) => void // event callback for modal layout
  onRemove?: () => void // event callback for modal layout
  onClose?: () => void
  className?: string
}

/**
 * Modal instance will unmount when
 * open prop is false.
 * Does not support fragments.
 */
const Modal: React.FC<ModalProps> = ({
  open = false,
  onClose,
  children,
  className = ''
}) => {
  useEffect(() => {
    // Hide scroll bar when modal is open
    document.body.style.overflow = open ? 'hidden' : 'unset'

    if (!open && onClose) onClose()
  }, [open])

  return (
    <Transition in={open} type={TRANSITION_TYPE.FADE}>
      <div className={`${styles.modal} ${className}`}>
        <div className={styles.wrapper}>
          {React.cloneElement(children as React.ReactElement, {
            open,
            onClose
          })}
        </div>
      </div>
    </Transition>
  )
}

export default Modal
