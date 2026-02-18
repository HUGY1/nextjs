import { Card, Row, Col, Statistic } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'

export default function Dashboard() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={11280}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={932}
              prefix={<ShoppingOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="月销售额"
              value={9280}
              prefix="¥"
              suffix={
                <span style={{ fontSize: 14, color: '#ff4d4f' }}>
                  <ArrowDownOutlined /> 3%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="转化率" value={68.5} suffix="%" />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="欢迎使用">
            <p>
              这是基于 Next.js、React、TypeScript 和 Ant Design
              构建的管理后台模板。您可以在左侧菜单切换不同页面。
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
