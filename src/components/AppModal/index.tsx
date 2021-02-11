import React, { useContext } from 'react'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import Modal from '../Modal'

const AppModal: React.FC = () => {
  const { modal, modalDispatch } = useContext(ModalContext)

  return (
    <Modal
      open={modal.layout && modal.open}
      onClose={() => modalDispatch({ type: MODAL_ACTION_TYPE.CLOSE })}
    >
      {modal.layout || <div>Missing modal layout.</div>}
    </Modal>
  )
}

export default AppModal
