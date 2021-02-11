import React, { useMemo, createContext } from 'react'
import { useReducer } from 'react'

type ModalState = {
  layout?: JSX.Element
  open: boolean
}

export enum MODAL_ACTION_TYPE {
  LAYOUT = 'LAYOUT',
  OPEN = 'OPEN',
  CLOSE = 'CLOSE'
}

type ModalActionType =
  | {
      type: MODAL_ACTION_TYPE.LAYOUT
      layout: JSX.Element
    }
  | { type: MODAL_ACTION_TYPE.OPEN }
  | { type: MODAL_ACTION_TYPE.CLOSE }

const modalReducer = (
  state: ModalState,
  action: ModalActionType
): ModalState => {
  switch (action.type) {
    case MODAL_ACTION_TYPE.LAYOUT:
      return { ...state, layout: action.layout }
    case MODAL_ACTION_TYPE.OPEN:
      return { ...state, open: true }
    case MODAL_ACTION_TYPE.CLOSE:
      return { ...state, open: false }
    default:
      return state
  }
}

type ModalContextType = {
  modal: ModalState
  modalDispatch: React.Dispatch<ModalActionType>
}

const defaultModalState: ModalState = {
  layout: undefined,
  open: false
}

export const ModalContext = createContext<ModalContextType>({
  modal: defaultModalState,
  modalDispatch: () => {}
})

const ModalProvider: React.FC = ({ children }) => {
  const [modal, modalDispatch] = useReducer(modalReducer, defaultModalState)

  return (
    <ModalContext.Provider
      value={useMemo(() => ({ modal, modalDispatch }), [modal, modalDispatch])}
    >
      {children}
    </ModalContext.Provider>
  )
}

export default ModalProvider
