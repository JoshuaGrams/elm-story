import React from 'React'

import { Modal } from 'antd'

const ErrorModal: React.FC<{ message: string | null; code: string | null }> = ({
  message,
  code
}) => {
  return (
    <Modal title="Error" visible={true}>
      <div>Elm Story has encountered and error.</div>
      <div>Message: {message}</div>
      <div>Code: {code}</div>
    </Modal>
  )
}

export default ErrorModal
