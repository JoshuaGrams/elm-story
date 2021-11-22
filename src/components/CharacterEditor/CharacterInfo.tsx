import { debounce, isEqual } from 'lodash-es'
import { names, uniqueNamesGenerator } from 'unique-names-generator'
import { v4 as uuid } from 'uuid'

import React, { useState, useEffect, useRef, useCallback } from 'react'

import {
  Character,
  CharacterRefs,
  CHARACTER_MASK_TYPE,
  CHARACTER_PRONOUN_TYPES,
  GameId,
  StudioId
} from '../../data/types'

import { Col, Row, Form, Input, Popover, Button } from 'antd'
import { RedoOutlined } from '@ant-design/icons'
import {
  MultiValue,
  components,
  GroupBase,
  MultiValueGenericProps
} from 'react-select'
import CreateableSelect from 'react-select/creatable'

import CharacterMask from './CharacterMask'

import styles from './styles.module.less'
import selectStyles from '../../styles/select.module.less'

import api from '../../api'

type LayoutType = Parameters<typeof Form>[0]['layout']

interface ReferenceSelectOption {
  value: string
  id: string | null
  pronoun: boolean | undefined
  editing: boolean
}

const EditAliasPopover: React.FC<{
  editing: boolean
  defaultValue: string | undefined
  selections: MultiValue<ReferenceSelectOption>
  onFinish: (newSelections: ReferenceSelectOption[]) => void
  onBlur: () => void
}> = ({ children, editing, defaultValue, selections, onFinish, onBlur }) => {
  const editRefInputRef = useRef<Input>(null)

  useEffect(() => {
    editRefInputRef.current?.select()
  }, [])

  return (
    <Popover
      visible={editing}
      placement="top"
      overlayClassName="es-select__editable-value-popover"
      content={
        <Input
          defaultValue={defaultValue}
          ref={editRefInputRef}
          style={{
            textTransform: 'uppercase',
            background: 'hsl(0, 0%, 3%)',
            zIndex: 1002
          }}
          autoFocus
          onPressEnter={() => {
            const newValue = editRefInputRef.current?.input.value

            if (newValue && newValue !== defaultValue && selections) {
              const sanitizedNewValue = newValue.toUpperCase().trim()

              if (
                Object.keys(CHARACTER_PRONOUN_TYPES).findIndex(
                  (pronoun) => pronoun === sanitizedNewValue
                ) === -1
              ) {
                const foundSelectionIndex = selections?.findIndex(
                  (selection) => selection.value === defaultValue
                )

                if (foundSelectionIndex !== -1) {
                  const newSelections = [...selections]

                  newSelections[foundSelectionIndex].value = sanitizedNewValue

                  onFinish(newSelections)
                }
              }
            }

            editRefInputRef.current?.blur()
          }}
          onBlur={() => onBlur()}
        />
      }
    >
      {children}
    </Popover>
  )
}

EditAliasPopover.displayName = 'EditAliasPopover'

const ReferencesSelect: React.FC<{
  refs: CharacterRefs
  onSelect: (newRefs: CharacterRefs) => Promise<void>
}> = ({ refs, onSelect }) => {
  const [selections, setSelections] = useState<
    MultiValue<ReferenceSelectOption> | undefined
  >(undefined)

  const [selectedCustomRef, setSelectedCustomRef] = useState<{
    data: ReferenceSelectOption | undefined
    editing: boolean
  }>({
    editing: false,
    data: undefined
  })

  // TODO: breakout
  const MultiValueLabel = (
    props: MultiValueGenericProps<
      ReferenceSelectOption,
      boolean,
      GroupBase<ReferenceSelectOption>
    >
  ) => {
    const isPronoun = props.data.pronoun as boolean | undefined

    return (
      <div
        className={`${!isPronoun ? selectStyles.editableValue : ''}`}
        onClick={() => {
          if (!isPronoun && selections) {
            const foundSelectionIndex = selections.findIndex(
              (selection) => selection.value === props.data.value
            )

            if (foundSelectionIndex !== -1) {
              const newSelections = [...selections]

              newSelections[foundSelectionIndex].editing = true

              setSelections(newSelections)

              setSelectedCustomRef({
                ...selectedCustomRef,
                data: props.data as ReferenceSelectOption,
                editing: true
              })
            }
          }
        }}
      >
        <components.MultiValueLabel {...props}>
          {selections && (
            <EditAliasPopover
              defaultValue={selectedCustomRef.data?.value}
              editing={props.data.editing}
              selections={selections}
              onFinish={(newSelections) => setSelections(newSelections)}
              onBlur={() => {
                if (selections) {
                  setSelections(
                    selections.map((selection) => ({
                      ...selection,
                      editing: false
                    }))
                  )

                  setSelectedCustomRef({
                    ...selectedCustomRef,
                    data: undefined,
                    editing: false
                  })
                }
              }}
            >
              {props.data.value}
            </EditAliasPopover>
          )}
        </components.MultiValueLabel>
      </div>
    )
  }

  useEffect(() => {
    async function updateCharacterReferences() {
      const selectionsAsRefArray: CharacterRefs = selections
        ? selections.map((selection) => [selection.id, selection.value])
        : []

      try {
        !isEqual(refs, selectionsAsRefArray) &&
          (await onSelect(selectionsAsRefArray))
      } catch (error) {
        throw error
      }
    }

    selections && updateCharacterReferences()
  }, [selections])

  useEffect(() => {
    let incomingSelections: ReferenceSelectOption[] = []

    refs.map((ref) => {
      const sanitizedRef = ref[1].toUpperCase().trim(),
        pronoun =
          Object.keys(CHARACTER_PRONOUN_TYPES).findIndex(
            (value) => value === sanitizedRef
          ) !== -1

      incomingSelections.push({
        editing: false,
        value: sanitizedRef,
        id: ref[0],
        pronoun
      })
    })

    setSelections(incomingSelections)
  }, [])

  return (
    <>
      <CreateableSelect
        isDisabled={selectedCustomRef.editing}
        isMulti
        value={selections}
        components={{ MultiValueLabel }}
        onChange={(newSelections) => {
          setSelections(
            newSelections.map(({ value, id, pronoun }) => ({
              value: value.toUpperCase().trim(),
              id: pronoun ? null : id || uuid(),
              pronoun,
              editing: false
            }))
          )
        }}
        options={Object.keys(CHARACTER_PRONOUN_TYPES).map((value) => ({
          value,
          label: value,
          id: null,
          pronoun: true,
          editing: false
        }))}
        menuPortalTarget={document.body}
        className={selectStyles.ESSelect}
        classNamePrefix="es-select"
        styles={{
          multiValue: (styles, { data }) => {
            return {
              ...styles,
              transition: 'opacity 0.2s',
              opacity: selectedCustomRef.editing
                ? data.value === selectedCustomRef.data?.value
                  ? '1.0'
                  : '0.4'
                : '1.0',
              borderColor: data.editing ? 'hsl(265, 100%, 60%) !important' : '',
              borderStyle: data.pronoun ? 'dashed !important' : 'solid',
              ':hover': {
                borderColor: !data.pronoun
                  ? 'hsl(265, 100%, 60%) !important'
                  : ''
              }
            }
          }
        }}
        openMenuOnClick={false}
        formatCreateLabel={(value) =>
          `Create alias "${value.toUpperCase().trim()}"`
        }
      />
    </>
  )
}

ReferencesSelect.displayName = 'ReferencesSelect'

const CharacterInfo: React.FC<{
  studioId: StudioId
  gameId: GameId
  character: Character
}> = ({ studioId, gameId, character }) => {
  const titleInputRef = useRef<Input>(null)

  const [characterInfoForm] = Form.useForm()

  const [formLayout] = useState<LayoutType>('vertical')

  const saveTitle = useCallback(
    async (event: { target: { value: string } }) => {
      const sanitizedTitle = event.target.value.trim()

      try {
        if (sanitizedTitle && character.title !== sanitizedTitle) {
          await api().characters.saveCharacter(studioId, {
            ...character,
            title: sanitizedTitle
          })
        }
      } catch (error) {
        throw error
      }
    },
    [character]
  )

  const saveDescription = useCallback(
    async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const sanitizedDescription = event.target.value.trim()

      try {
        character.description !== sanitizedDescription &&
          (await api().characters.saveCharacter(studioId, {
            ...character,
            description: sanitizedDescription
          }))
      } catch (error) {
        throw error
      }
    },
    [character]
  )

  useEffect(() => {
    titleInputRef.current?.select()
  }, [])

  return (
    <div className={styles.CharacterInfo}>
      <Row>
        <Col flex="auto">
          <div className={styles.defaultMood}>
            {/* TODO: dominate mask */}
            {character.id && (
              <CharacterMask
                studioId={studioId}
                gameId={gameId}
                characterId={character.id}
                active
                type={CHARACTER_MASK_TYPE.NEUTRAL}
                width="100%"
                overlay={false}
                assetId={
                  character.masks.find(
                    (mask) => mask.type === CHARACTER_MASK_TYPE.NEUTRAL
                  )?.assetId
                }
              />
            )}
          </div>
        </Col>

        <Col flex="auto" className={styles.content}>
          <Form
            id="save-character-info-form"
            form={characterInfoForm}
            layout={formLayout}
            initialValues={{
              title: character.title,
              description: character.description
            }}
          >
            <Form.Item
              label="Name"
              name="title"
              rules={[
                {
                  required: true,
                  message: 'Character name is required.'
                }
              ]}
            >
              <Input
                ref={titleInputRef}
                autoFocus
                onChange={debounce(saveTitle, 200)}
                onPressEnter={() => titleInputRef.current?.blur()}
                suffix={
                  <Button
                    icon={<RedoOutlined />}
                    onClick={() => {
                      const randomName = uniqueNamesGenerator({
                        dictionaries: [names, names],
                        length: 2,
                        separator: ' '
                      })

                      saveTitle({ target: { value: randomName } })

                      characterInfoForm.setFieldsValue({
                        ...characterInfoForm.getFieldsValue,
                        title: randomName
                      })
                    }}
                  />
                }
                style={{ paddingRight: '4px' }}
              />
            </Form.Item>

            <Form.Item label="Pronouns / Aliases">
              <ReferencesSelect
                refs={character.refs}
                onSelect={async (newRefs) => {
                  try {
                    await api().characters.saveCharacter(studioId, {
                      ...character,
                      refs: newRefs
                    })
                  } catch (error) {
                    throw error
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              style={{ marginBottom: 0 }}
            >
              <Input.TextArea
                rows={8}
                onChange={debounce(saveDescription, 200)}
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </Form>

          <div className={styles.componentId}>{character.id}</div>
        </Col>
      </Row>
    </div>
  )
}

CharacterInfo.displayName = 'CharacterInfo'

export default CharacterInfo
