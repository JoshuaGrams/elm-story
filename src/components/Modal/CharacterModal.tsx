import React from 'react'

import { useCharacter } from '../../hooks'

import { StudioId, WorldId, ElementId } from '../../data/types'

import { Modal, ModalProps } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import CharacterManager from '../CharacterManager'

import styles from './styles.module.less'

interface CharacterModalProps extends ModalProps {
  studioId: StudioId
  worldId: WorldId
  characterId?: ElementId
  visible?: boolean
}

const CharacterModal: React.FC<CharacterModalProps> = ({
  studioId,
  worldId,
  characterId,
  visible,
  onCancel
}) => {
  const character = useCharacter(studioId, characterId, [characterId])

  return (
    <Modal
      title={
        <>
          <UserOutlined className={styles.icon} /> {character?.title || ''}
        </>
      }
      visible={visible}
      destroyOnClose
      onCancel={(event) => onCancel && onCancel(event)}
      centered
      footer={null}
      className={styles.CharacterModal}
    >
      {character && (
        <CharacterManager
          studioId={studioId}
          worldId={worldId}
          character={character}
        />
      )}
    </Modal>
  )
}

CharacterModal.displayName = 'CharacterModal'

export default CharacterModal
