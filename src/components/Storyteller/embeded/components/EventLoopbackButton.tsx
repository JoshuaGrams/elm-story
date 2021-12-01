import React from 'react'

import { EngineEventResult } from '../types'
import { ENGINE_EVENT_LOOPBACK_RESULT_VALUE } from '../lib'

export const EventLoopbackButtonContent = (
  <>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="event-loopback-btn-content"
    >
      <path
        d="M14.854 4.854C14.9006 4.80755 14.9375 4.75238 14.9627 4.69163C14.9879 4.63089 15.0009 4.56577 15.0009 4.5C15.0009 4.43423 14.9879 4.36911 14.9627 4.30836C14.9375 4.24762 14.9006 4.19244 14.854 4.146L10.854 0.145998C10.7601 0.0521117 10.6328 -0.00063324 10.5 -0.00063324C10.3672 -0.00063324 10.2399 0.0521117 10.146 0.145998C10.0521 0.239885 9.99937 0.367223 9.99937 0.499998C9.99937 0.632774 10.0521 0.760112 10.146 0.853998L13.293 4H3.5C2.83696 4 2.20107 4.26339 1.73223 4.73223C1.26339 5.20107 1 5.83696 1 6.5L1 10.5C1 11.163 1.26339 11.7989 1.73223 12.2678C2.20107 12.7366 2.83696 13 3.5 13H10.5C10.6326 13 10.7598 12.9473 10.8536 12.8536C10.9473 12.7598 11 12.6326 11 12.5C11 12.3674 10.9473 12.2402 10.8536 12.1464C10.7598 12.0527 10.6326 12 10.5 12H3.5C3.10218 12 2.72064 11.842 2.43934 11.5607C2.15804 11.2794 2 10.8978 2 10.5L2 6.5C2 6.10217 2.15804 5.72064 2.43934 5.43934C2.72064 5.15803 3.10218 5 3.5 5H13.293L10.146 8.146C10.0521 8.23988 9.99937 8.36722 9.99937 8.5C9.99937 8.63277 10.0521 8.76011 10.146 8.854C10.2399 8.94788 10.3672 9.00063 10.5 9.00063C10.6328 9.00063 10.7601 8.94788 10.854 8.854L14.854 4.854Z"
        fillRule="evenodd"
      />
    </svg>
    RETURN
  </>
)

const EventLoopbackButton: React.FC<{
  onClick?: () => void
  eventResult?: EngineEventResult
}> = React.memo(({ onClick, eventResult }) => {
  return (
    <div
      className={`event-loopback-btn ${
        eventResult?.value === ENGINE_EVENT_LOOPBACK_RESULT_VALUE
          ? 'event-choice-result'
          : ''
      }`}
    >
      <button
        onClick={onClick}
        type={!onClick ? 'submit' : undefined}
        disabled={
          eventResult?.value === ENGINE_EVENT_LOOPBACK_RESULT_VALUE
            ? true
            : false
        }
      >
        {EventLoopbackButtonContent}
      </button>
    </div>
  )
})

EventLoopbackButton.displayName = 'EventLoopbackButton'

export default EventLoopbackButton
