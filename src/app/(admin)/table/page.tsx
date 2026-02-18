import { Table, Tag, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface DataType {
  key: string
  name: string
  age: number
  address: string
  tags: string[]
}

const columns: ColumnsType<DataType> = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '标签',
    key: 'tags',
    dataIndex: 'tags',
    render: (tags: string[]) => (
      <>
        {tags.map((tag) => (
          <Tag color="blue" key={tag}>
            {tag}
          </Tag>
        ))}
      </>
    ),
  },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <Space size="middle">
        <a>编辑</a>
        <a>删除</a>
      </Space>
    ),
  },
]

const data: DataType[] = [
  {
    key: '1',
    name: '张三',
    age: 32,
    address: '西湖区湖底公园1号',
    tags: ['开发者'],
  },
  {
    key: '2',
    name: '李四',
    age: 42,
    address: '滨江区网商路699号',
    tags: ['设计师'],
  },
  {
    key: '3',
    name: '王五',
    age: 28,
    address: '余杭区梦想小镇',
    tags: ['产品', '运营'],
  },
]

export default function TablePage() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据表格</h2>
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </div>
  )
}
