'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Layout, Menu, Dropdown, Avatar, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  TableOutlined,
  FormOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: <Link href="/">仪表盘</Link> },
  { key: '/table', icon: <TableOutlined />, label: <Link href="/table">数据表格</Link> },
  { key: '/form', icon: <FormOutlined />, label: <Link href="/form">表单页面</Link> },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]

  const selectedKey = pathname === '/' ? '/' : pathname

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: 'linear-gradient(180deg, #1a1f36 0%, #0f1322 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {!collapsed && (
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
              管理后台
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            marginTop: 16,
            background: 'transparent',
            border: 'none',
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <span
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: 'pointer', fontSize: 18 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Dropdown menu={{ items: userMenuItems }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
              <span>管理员</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
