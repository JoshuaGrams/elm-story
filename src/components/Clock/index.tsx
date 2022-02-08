import { format } from 'date-fns'

import React from 'react'

const Clock: React.FC<{ seconds: number }> = ({ seconds }) => (
  <span>{format(seconds * 1000, 'mm:ss')}</span>
)

Clock.displayName = 'Clock'

export default Clock
