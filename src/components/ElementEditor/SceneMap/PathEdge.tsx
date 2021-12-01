import React, { memo } from 'react'

import { ElementId, ELEMENT_TYPE, StudioId } from '../../../data/types'

import {
  usePathConditionsCountByPathRef,
  usePathEffectsCountByPathRef
} from '../../../hooks'

import {
  EdgeProps,
  Position,
  getMarkerEnd,
  getEdgeCenter
} from 'react-flow-renderer'

import PathEdgeLabel from './PathEdgeLabel'

interface GetBezierPathParams {
  sourceX: number
  sourceY: number
  sourcePosition?: Position
  targetX: number
  targetY: number
  targetPosition?: Position
  centerX?: number
  centerY?: number
}

export interface PathEdgeData {
  type: ELEMENT_TYPE.PATH
  studioId: StudioId
  pathId: ElementId
}

export function getBezierPath({
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
  centerX,
  centerY
}: GetBezierPathParams): string {
  const [_centerX, _centerY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY
  })
  const leftAndRight = [Position.Left, Position.Right]

  const cX = typeof centerX !== 'undefined' ? centerX : _centerX
  const cY = typeof centerY !== 'undefined' ? centerY : _centerY

  let path = `M${sourceX},${sourceY} C${sourceX},${cY} ${targetX},${cY} ${targetX},${targetY}`

  if (
    leftAndRight.includes(sourcePosition) &&
    leftAndRight.includes(targetPosition)
  ) {
    path = `M${sourceX},${sourceY} C${cX},${sourceY} ${cX},${targetY} ${targetX},${targetY}`
  } else if (leftAndRight.includes(targetPosition)) {
    path = `M${sourceX},${sourceY} C${sourceX},${targetY} ${sourceX},${targetY} ${targetX},${targetY}`
  } else if (leftAndRight.includes(sourcePosition)) {
    path = `M${sourceX},${sourceY} C${targetX},${sourceY} ${targetX},${sourceY} ${targetX},${targetY}`
  }

  return path
}

export default memo(
  ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition = Position.Bottom,
    targetPosition = Position.Top,
    arrowHeadType,
    markerEndId,
    data
  }: EdgeProps<PathEdgeData>) => {
    const conditionsCount =
        (data &&
          usePathConditionsCountByPathRef(data.studioId, data.pathId, [
            data.studioId,
            data.pathId
          ])) ||
        undefined,
      effectsCount =
        (data &&
          usePathEffectsCountByPathRef(data.studioId, data.pathId, [
            data.studioId,
            data.pathId
          ])) ||
        undefined

    const [centerX, centerY] = getEdgeCenter({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition
    })

    const path = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    })

    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId)

    return (
      <>
        <path
          d={path}
          className="react-flow__edge-path"
          markerEnd={markerEnd}
        />
        <PathEdgeLabel
          x={centerX}
          y={centerY}
          totalConditions={conditionsCount || 0}
          totalEffects={effectsCount || 0}
        />
      </>
    )
  }
)
