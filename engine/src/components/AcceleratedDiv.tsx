import React from 'react'

import { animated } from 'react-spring'

const AcceleratedDiv = React.forwardRef<
  HTMLDivElement,
  { style?: {}; className?: string; children?: React.ReactNode }
>(({ style, className, children }, ref) => {
  return (
    <animated.div
      style={{ ...style, transform: 'translate3d(0,0,0)' }}
      className={className}
      ref={ref}
    >
      {children}
    </animated.div>
  )
})

AcceleratedDiv.displayName = 'AcceleratedDiv'

export default AcceleratedDiv
