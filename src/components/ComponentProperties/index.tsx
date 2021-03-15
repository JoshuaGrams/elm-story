import React, { useContext, useEffect, useState } from 'react'

import { COMPONENT_TYPE, Game, GameId, StudioId } from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { Collapse, Form, Input } from 'antd'

import api from '../../api'

import styles from './styles.module.less'
import { useSelectedGame } from '../../hooks'

const { Panel } = Collapse

const ComponentProperties: React.FC<{
  studioId: StudioId
  gameId: GameId | undefined
}> = ({ studioId, gameId = undefined }) => {
  const { editor, editorDispatch } = useContext(EditorContext)

  const selectedGame: Game | undefined = gameId
    ? useSelectedGame(studioId, gameId)
    : undefined

  const [editComponentTitleForm] = Form.useForm()

  const [activeKeys, setActiveKeys] = useState<string[]>(['game-details'])

  async function updateTitle(title: string) {
    if (
      studioId &&
      editor.selectedGameOutlineComponent.id &&
      title &&
      title !== editor.selectedGameOutlineComponent.title
    ) {
      try {
        switch (editor.selectedGameOutlineComponent.type) {
          case COMPONENT_TYPE.CHAPTER:
            await api().chapters.saveChapter(studioId, {
              ...(await api().chapters.getChapter(
                studioId,
                editor.selectedGameOutlineComponent.id
              )),
              title
            })
            break
          case COMPONENT_TYPE.SCENE:
            await api().scenes.saveScene(studioId, {
              ...(await api().scenes.getScene(
                studioId,
                editor.selectedGameOutlineComponent.id
              )),
              title
            })
            break
          case COMPONENT_TYPE.PASSAGE:
            await api().passages.savePassage(studioId, {
              ...(await api().passages.getPassage(
                studioId,
                editor.selectedGameOutlineComponent.id
              )),
              title
            })
            break
          default:
            break
        }
      } catch (error) {
        throw new Error(error)
      }

      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
        selectedGameOutlineComponent: {
          ...editor.selectedGameOutlineComponent,
          title
        }
      })
    }
  }

  useEffect(() => {
    editComponentTitleForm.resetFields()

    if (
      editor.selectedGameOutlineComponent.id &&
      !activeKeys.includes('component-details')
    ) {
      setActiveKeys([...activeKeys, 'component-details'])
    }
  }, [editor.selectedGameOutlineComponent])

  return (
    <Collapse
      className={styles.componentProperties}
      activeKey={activeKeys}
      onChange={(activeKeys) => setActiveKeys([...activeKeys])}
    >
      <Panel header="Game Details" key="game-details">
        {selectedGame && (
          <>
            <div>Title: {selectedGame.title}</div>
            <div>Directed by: {selectedGame.director}</div>
          </>
        )}
      </Panel>

      <Panel header="Component Details" key="component-details">
        {editor.selectedGameOutlineComponent.id ? (
          <>
            <Form
              form={editComponentTitleForm}
              initialValues={{
                title: editor.selectedGameOutlineComponent.title
              }}
              onBlur={(event) => updateTitle(event.target.value)}
              onFinish={({ title }) => updateTitle(title)}
            >
              <Form.Item label="Title" name="title">
                <Input />
              </Form.Item>
            </Form>
            <div>Type: {editor.selectedGameOutlineComponent.type}</div>
            <div>Notes:</div>
          </>
        ) : (
          <div>Select component...</div>
        )}
      </Panel>
    </Collapse>
  )
}

export default ComponentProperties