import React from 'react'
import { CSSTransition } from 'react-transition-group'

import fade from '../../styles/transitions/fade.module.scss'

export enum TRANSITION_TYPE {
  FADE = 'FADE'
}

interface TransitionProps {
  in: boolean
  type: TRANSITION_TYPE
}

const Transition: React.FC<TransitionProps> = ({
  children,
  in: _in = false,
  type
}) => {
  let transitionClassNames

  switch (type) {
    case TRANSITION_TYPE.FADE:
      transitionClassNames = fade
      break
    default:
      throw new Error('Unable to transition. Missing type.')
  }

  return (
    <CSSTransition
      in={_in}
      mountOnEnter
      unmountOnExit
      timeout={100}
      classNames={transitionClassNames}
    >
      {children}
    </CSSTransition>
  )
}

export default Transition
