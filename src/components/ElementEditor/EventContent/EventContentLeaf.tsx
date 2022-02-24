import React, { ReactChild, ReactElement, ReactNode } from 'react'

import { EventContentLeaf as EventContentLeafType } from '../../../data/eventContentTypes'

import styles from './styles.module.less'

const EventContentLeaf: React.FC<{
  leaf: EventContentLeafType
  attributes?: {}
}> = ({ leaf, attributes, children }) => {
  let classNames = ''

  if (leaf.expression) {
    classNames = `${styles.expression}`
  }

  if (leaf.expressionStart || leaf.expressionEnd) {
    classNames = `${classNames} ${styles.expressionCap}`
  }

  if (leaf.strong) {
    children = <strong {...attributes}>{children}</strong>
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

  return (
    <span
      {...attributes}
      className={classNames}
      // elmstorygames/feedback#223
      spellCheck={leaf.expression ? false : true}
    >
      {children}
    </span>
  )
}

EventContentLeaf.displayName = 'EventContentLeaf'

export default EventContentLeaf
