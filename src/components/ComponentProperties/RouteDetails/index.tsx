import React from 'react'

import { ComponentId, StudioId } from '../../../data/types'

import { useRoute } from '../../../hooks'

import ComponentTitle from '../ComponentTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const RouteDetails: React.FC<{
  studioId: StudioId
  routeId: ComponentId
}> = ({ studioId, routeId }) => {
  const route = useRoute(studioId, routeId, [routeId])

  return (
    <>
      {route && (
        <div className={styles.componentDetailViewWrapper}>
          <div className={styles.content}>
            <ComponentTitle
              title={route.title}
              onUpdate={async (title) =>
                route.id &&
                (await api().routes.saveRoute(studioId, {
                  ...(await api().routes.getRoute(studioId, route.id)),
                  title
                }))
              }
            />
            <div className={styles.componentId}>{route.id}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default RouteDetails
