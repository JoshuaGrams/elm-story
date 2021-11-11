import React from 'react'

import { StudioId, GameId, ComponentId } from '../../data/types'

import { Modal, ModalProps } from 'antd'

import CharacterEditor from '../CharacterEditor'

import styles from './styles.module.less'

interface CharacterModalProps extends ModalProps {
  studioId: StudioId
  gameId: GameId
  characterId?: ComponentId
  visible?: boolean
}

const CharacterModal: React.FC<CharacterModalProps> = ({
  studioId,
  gameId,
  characterId,
  visible,
  onCancel
}) => {
  return (
    <Modal
      title="Edit Character"
      visible={visible}
      destroyOnClose
      onCancel={(event) => onCancel && onCancel(event)}
      centered
      footer={null}
      className={styles.CharacterModal}
      
    >
      {characterId && (
        <CharacterEditor
          studioId={studioId}
          gameId={gameId}
          characterId={characterId}
        />
      )}
    </Modal>
  )
}

CharacterModal.displayName = 'CharacterModal'

export default CharacterModal
