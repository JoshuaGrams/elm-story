import React from 'react'

const EventLinkElement: React.FC<{ text: string; url: string }> = ({
  text,
  url
}) => {
  return (
    <a
      className="event-content-link"
      href={url}
      target="_blank"
      title={`Open "${url}" in a new tab`}
    >
      {text}
    </a>
  )
}

EventLinkElement.displayName = 'EventLinkElement'

export default EventLinkElement
