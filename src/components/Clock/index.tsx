import { format } from 'date-fns'

import React from 'react'

const Clock: React.FC<{ seconds: number }> = ({ seconds }) => (
  <span>{seconds !== -1 ? format(seconds * 1000, 'mm:ss') : '00:00'}</span>
)

Clock.displayName = 'Clock'

export default Clock
