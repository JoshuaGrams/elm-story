import React, {
  memo,
  useRef,
  useState,
  useEffect,
  HTMLAttributes,
  ReactNode
} from 'react'

import { Rect } from 'react-flow-renderer'

export interface RouteEdgeLabelProps extends HTMLAttributes<SVGElement> {
  x: number
  y: number
  label?: string | ReactNode
}

import styles from './styles.module.less'

const EdgeText: React.FC<RouteEdgeLabelProps> = ({
  x,
  y,
  children,
  ...rest
}) => {
  const rectHeight = 12,
    textSpacing = 7,
    horizontalPadding = 6

  const conditionsTextRef = useRef<SVGTextElement>(null),
    effectsTextRef = useRef<SVGTextElement>(null)

  const [conditionsTextBbox, setConditionsTextBbox] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })

  const [effectsTextBbox, setEffectsTextBbox] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })

  const [rectBbox, setRectBbox] = useState<Rect>({
    x: 0,
    y: rectHeight / 2,
    width: 0,
    height: rectHeight
  })

  const [conditionTotal, setConditionTotal] = useState('-'),
    [effectTotal, setEffectTotal] = useState('-')

  useEffect(() => {
    if (conditionsTextRef.current && effectsTextRef.current) {
      const conditionsTextBbox = conditionsTextRef.current.getBBox(),
        effectsTextBbox = effectsTextRef.current.getBBox()

      setRectBbox({
        ...rectBbox,
        x: conditionsTextBbox.x + effectsTextBbox.x,
        width:
          conditionsTextBbox.width +
          effectsTextBbox.width +
          horizontalPadding +
          textSpacing
      })

      setConditionsTextBbox({
        x: conditionsTextBbox.x,
        y: conditionsTextBbox.y,
        width: conditionsTextBbox.width,
        height: conditionsTextBbox.height
      })

      setEffectsTextBbox({
        x: effectsTextBbox.x,
        y: effectsTextBbox.y,
        width: effectsTextBbox.width,
        height: effectsTextBbox.height
      })
    }
  }, [conditionTotal, effectTotal])

  return (
    <>
      <defs>
        <clipPath id="round-corner">
          <rect
            x="0"
            y="0"
            width={rectBbox.width}
            height={rectHeight}
            rx="2"
            ry="2"
          />
        </clipPath>
      </defs>

      <g
        transform={`translate(${x - rectBbox.width / 2} ${y - rectHeight / 2})`}
        {...rest}
        className={styles.RouteEdgeLabel}
        style={{ cursor: 'pointer' }}
        clipPath="url(#round-corner)"
      >
        <rect
          style={{ fill: 'black' }}
          x={0}
          y={0}
          width={rectBbox.width}
          height={rectHeight}
        />

        <rect
          className={styles.conditions}
          width={
            horizontalPadding / 2 + conditionsTextBbox.width + textSpacing / 2
          }
          height={rectHeight}
          x={0}
          y={0}
        />

        <text
          x={horizontalPadding / 2}
          y={conditionsTextBbox.height / 2}
          dy="0.3em"
          ref={conditionsTextRef}
          className={styles.label}
        >
          {conditionTotal}
        </text>

        <rect
          className={styles.effects}
          width={
            horizontalPadding / 2 + effectsTextBbox.width + textSpacing / 2
          }
          height={rectHeight}
          x={horizontalPadding / 2 + conditionsTextBbox.width + textSpacing / 2}
          y={0}
        />

        <text
          x={horizontalPadding / 2 + conditionsTextBbox.width + textSpacing}
          y={effectsTextBbox.height / 2}
          dy="0.3em"
          ref={effectsTextRef}
          className={styles.label}
        >
          {effectTotal}
        </text>

        <rect
          width={1}
          height={rectHeight}
          className={styles.divider}
          x={
            horizontalPadding / 2 +
            conditionsTextBbox.width -
            0.5 +
            textSpacing / 2
          }
        />
        {children}
      </g>
    </>
  )
}
export default memo(EdgeText)
