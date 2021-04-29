import React from 'react'

import { Modal } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const ExportJSONModal: React.FC<{ visible: boolean }> = ({
  visible = false
}) => {
  return (
    <Modal
      visible={visible}
      destroyOnClose
      closable={false}
      centered
      footer={null}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 20 }}>Preparing Game Data</div>
        <LoadingOutlined style={{ fontSize: 24 }} spin />
      </div>
    </Modal>
  )
}

export default ExportJSONModal
