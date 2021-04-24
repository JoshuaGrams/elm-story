import React, { useContext, useEffect, useState } from 'react'

import { ComponentId, VARIABLE_TYPE } from '../../data/types'

import { EngineContext } from '../../contexts/EngineContext'

import { Table } from 'antd'

import styles from './styles.module.less'

const columns = [
  {
    title: 'Component ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: 'Default',
    dataIndex: 'default',
    key: 'default'
  },
  {
    title: 'Current',
    dataIndex: 'current',
    key: 'current'
  }
]

interface Data {
  key: string
  id: ComponentId
  title: string
  type: VARIABLE_TYPE
  default: string
  current: string
}

const GameStateView: React.FC = () => {
  const { engine } = useContext(EngineContext)

  const [dataSource, setDataSource] = useState<Data[]>([])

  useEffect(() => {
    const newDataSource: Data[] = []

    Object.keys(engine.gameState).map((key) =>
      newDataSource.push({
        key,
        id: key,
        title: engine.gameState[key].title,
        type: engine.gameState[key].type,
        default: `${engine.gameState[key].defaultValue || 'undefined'}`,
        current: `${engine.gameState[key].currentValue || 'undefined'}`
      })
    )

    setDataSource(newDataSource)
  }, [engine.gameState])

  return (
    <div className={styles.GameStateView}>
      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </div>
  )
}

export default GameStateView
