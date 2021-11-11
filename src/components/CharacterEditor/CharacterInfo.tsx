import React, { useState, useEffect, useRef } from 'react'

import {
  Character,
  CHARACTER_PRONOUN_TYPES,
  GameId,
  StudioId
} from '../../data/types'

import { Col, Row, Form, Input, Popover } from 'antd'
import {
  MultiValue,
  components,
  GroupBase,
  MultiValueGenericProps
} from 'react-select'
import CreateableSelect from 'react-select/creatable'

import styles from './styles.module.less'
import selectStyles from '../../styles/select.module.less'

type LayoutType = Parameters<typeof Form>[0]['layout']

interface ReferenceSelectOption {
  value: string
  label: string
  pronoun: boolean | undefined
  editing: boolean
}

const ReferencesSelect: React.FC = () => {
  const editRefInputRef = useRef<Input>(null)

  const [selections, setSelections] = useState<
    MultiValue<ReferenceSelectOption> | undefined
  >()

  const [selectedCustomRef, setSelectedCustomRef] = useState<{
    data: ReferenceSelectOption | undefined
    editing: boolean
  }>({
    editing: false,
    data: undefined
  })

  useEffect(() => {
    console.log(selections)
  }, [selections])

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
          <Popover
            visible={props.data.editing}
            placement="top"
            arrowContent={<div style={{ zIndex: 1001 }}>hi</div>}
            overlayClassName="es-select__editable-value-popover"
            content={
              <Input
                defaultValue={selectedCustomRef.data?.value}
                ref={editRefInputRef}
                style={{
                  textTransform: 'uppercase',
                  background: 'hsl(0, 0%, 3%)',
                  zIndex: 1002
                }}
                autoFocus
                onPressEnter={() => {
                  const newValue = editRefInputRef.current?.input.value

                  if (
                    newValue &&
                    newValue !== selectedCustomRef.data?.value &&
                    selections
                  ) {
                    const sanitizedNewValue = newValue.toUpperCase().trim()

                    if (
                      Object.keys(CHARACTER_PRONOUN_TYPES).findIndex(
                        (pronoun) => pronoun === sanitizedNewValue
                      ) === -1
                    ) {
                      const foundSelectionIndex = selections?.findIndex(
                        (selection) =>
                          selection.value === selectedCustomRef.data?.value
                      )

                      if (foundSelectionIndex !== -1) {
                        const newSelections = [...selections]

                        newSelections[
                          foundSelectionIndex
                        ].label = sanitizedNewValue
                        newSelections[
                          foundSelectionIndex
                        ].value = sanitizedNewValue

                        setSelections(newSelections)
                      }
                    }
                  }

                  editRefInputRef.current?.blur()
                }}
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
              />
            }
          >
            {props.data.value}
          </Popover>
        </components.MultiValueLabel>
      </div>
    )
  }

  return (
    <>
      <CreateableSelect
        isDisabled={selectedCustomRef.editing}
        isMulti
        value={selections}
        components={{ MultiValueLabel }}
        onChange={(newSelections) =>
          setSelections(
            newSelections.map(({ value, label, pronoun }) => ({
              value: value.toUpperCase().trim(),
              label: label.toUpperCase().trim(),
              pronoun,
              editing: false
            }))
          )
        }
        options={Object.keys(CHARACTER_PRONOUN_TYPES).map((value) => ({
          value,
          label: value,
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

const CharacterInfo: React.FC<{
  studioId: StudioId
  gameId: GameId
  character: Character
}> = ({ studioId, gameId, character }) => {
  const [characterInfoForm] = Form.useForm(),
    [formLayout] = useState<LayoutType>('vertical')

  return (
    <div className={styles.CharacterInfo}>
      <Row>
        <Col flex="100px">
          <div className={styles.defaultMood}>
            <div className={styles.portrait}>
              <div className={styles.defaultMoodLabel}>Neutral</div>
            </div>
          </div>
        </Col>
        <Col flex="auto" className={styles.content}>
          <Form
            id="save-character-info-form"
            form={characterInfoForm}
            layout={formLayout}
            initialValues={{
              title: character.title
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
              <Input autoFocus />
            </Form.Item>

            <Form.Item
              label="Pronouns / Aliases"
              normalize={(value) => {
                console.log('here')
                console.log(value)
              }}
            >
              <ReferencesSelect />
            </Form.Item>

            <Form.Item label="Description" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={5} />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  )
}

CharacterInfo.displayName = 'CharacterInfo'

export default CharacterInfo
