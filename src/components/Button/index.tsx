import React from 'react'

import styles from './styles.module.scss'

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  primary?: boolean
  destroy?: boolean
}

export default ({
  children,
  type = 'button',
  title,
  onClick,
  disabled = false,
  className = '',
  primary = false,
  destroy = false
}: ButtonProps) => {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${
        primary && !disabled
          ? styles.primary
          : destroy
          ? styles.destroy
          : disabled
          ? styles.disabled
          : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}
