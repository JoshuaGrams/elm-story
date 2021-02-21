import React, { useRef, useEffect } from 'react'

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  focusOnMount?: boolean
  selectOnMount?: boolean
}

import styles from './styles.module.less'

const Input: React.FC<InputProps> = ({
  type,
  value,
  placeholder,
  onChange,
  focusOnMount = false,
  selectOnMount = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        if (focusOnMount) inputRef.current.focus()
        if (selectOnMount) inputRef.current.select()
      }
    }, 1)
  }, [])

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={styles.input}
      ref={inputRef}
    />
  )
}

export default Input
