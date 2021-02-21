import React from 'react'
import { CSSTransition } from 'react-transition-group'

import fade from '../../styles/transitions/fade.module.less'

export enum TRANSITION_TYPE {
  SNAP = 'SNAP',
  FADE = 'FADE'
}

interface TransitionProps {
  in: boolean
  type: TRANSITION_TYPE
}

/**
 * Transitions child.
 * Mounts on enter and exit.
 * Does not support fragments.
 */
const Transition: React.FC<TransitionProps> = ({
  children,
  in: _in = false,
  type
}) => {
  let transitionClassNames,
    snap = type === TRANSITION_TYPE.SNAP

  switch (type) {
    case TRANSITION_TYPE.SNAP:
      transitionClassNames = ''
      break
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
      timeout={snap ? 0 : 100}
      classNames={transitionClassNames}
    >
      {children}
    </CSSTransition>
  )
}

export default Transition
