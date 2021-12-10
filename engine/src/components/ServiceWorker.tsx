import React, { useEffect, useState } from 'react'

import { useRegisterSW } from 'virtual:pwa-register/react'

const ServiceWorker: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered: (r) => {
      r && setInterval(() => r.update(), 60 * 60 * 1000) // 1 hour
    }
  })

  const [updateApp, setUpdateApp] = useState(false)

  useEffect(() => {
    import.meta.env.DEV && !needRefresh && setNeedRefresh(true)
  }, [])

  return (
    <>
      {needRefresh && (
        <div id="world-update-toast">
          <span>{!updateApp ? 'Update available.' : 'Updating...'}</span>

          <button
            onClick={() => {
              import.meta.env.DEV && setNeedRefresh(false)

              if (!import.meta.env.DEV) {
                setUpdateApp(true)
                updateServiceWorker(true)
              }
            }}
            disabled={updateApp}
          >
            Reload
          </button>
        </div>
      )}
    </>
  )
}

ServiceWorker.displayName = 'ServiceWorker'

export default ServiceWorker
