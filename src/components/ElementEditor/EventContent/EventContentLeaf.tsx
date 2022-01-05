import React from 'react'

import { EventContentLeaf as EventContentLeafType } from '../../../data/eventContentTypes'

const EventContentLeaf: React.FC<{
  leaf: EventContentLeafType
  attributes?: {}
}> = ({ leaf, attributes, children }) => {
  if (leaf.strong) {
    children = <strong {...attributes}>{children}</strong>
  }

  if (leaf.code) {
    children = <code {...attributes}>{children}</code>
  }

  if (leaf.em) {
    children = <em {...attributes}>{children}</em>
  }

  if (leaf.s) {
    children = <s {...attributes}>{children}</s>
  }

  if (leaf.u) {
    children = <u {...attributes}>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

EventContentLeaf.displayName = 'EventContentLeaf'

export default EventContentLeaf
