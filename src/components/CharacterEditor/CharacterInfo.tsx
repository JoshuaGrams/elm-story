import React, { useState } from 'react'

import { GameId, StudioId } from '../../data/types'

import { Col, Row, Form, Input, Select } from 'antd'

import styles from './styles.module.less'

type LayoutType = Parameters<typeof Form>[0]['layout']

const ReferencesSelect: React.FC = () => {
  return (
    <Select mode="tags">
      <Select.Option key="gender-she" value="she">
        she
      </Select.Option>
      <Select.Option key="gender-her" value="her">
        her
      </Select.Option>
      <Select.Option key="gender-hers" value="hers">
        hers
      </Select.Option>
      <Select.Option key="gender-herself" value="herself">
        herself
      </Select.Option>

      <Select.Option key="gender-he" value="he">
        he
      </Select.Option>
      <Select.Option key="gender-him" value="him">
        him
      </Select.Option>
      <Select.Option key="gender-his" value="his">
        his
      </Select.Option>
      <Select.Option key="gender-himself" value="himself">
        himself
      </Select.Option>

      <Select.Option key="gender-they" value="they">
        they
      </Select.Option>
      <Select.Option key="gender-them" value="them">
        them
      </Select.Option>
      <Select.Option key="gender-theirs" value="theirs">
        theirs
      </Select.Option>
      <Select.Option key="gender-themself" value="themself">
        themself
      </Select.Option>

      <Select.Option key="gender-ze" value="ze">
        ze
      </Select.Option>
      <Select.Option key="gender-hir" value="hir">
        hir
      </Select.Option>
      <Select.Option key="gender-zir" value="zir">
        zir
      </Select.Option>
      <Select.Option key="gender-hirs" value="hirs">
        hirs
      </Select.Option>
      <Select.Option key="gender-zirs" value="zirs">
        zirs
      </Select.Option>
      <Select.Option key="gender-hirself" value="hirself">
        hirself
      </Select.Option>
      <Select.Option key="gender-zirself" value="zirself">
        zirself
      </Select.Option>
    </Select>
  )
}

const CharacterInfo: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = ({ studioId, gameId }) => {
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
            {/* TODO: https://nosir.github.io/cleave.js/? */}
            <Form.Item label="Pronouns / Aliases">
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
