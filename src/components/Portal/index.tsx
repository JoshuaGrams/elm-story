import React from 'react'
import ReactDOM from 'react-dom'

const Portal: React.FC = ({ children }): React.ReactPortal | null => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}

Portal.displayName = 'Portal'

export default Portal
