// src/pages/notes/note.tsx
import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Breadcrumb } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  ClusterOutlined,
  ExportOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined, CommentOutlined
} from '@ant-design/icons';
import '../../styles/notes/NotePage.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const NOTE_TABS = [
    {
    key: 'index',
    label: '笔记首页',
    icon: <HomeOutlined />,
    path: '/notes/index'
  },
  {
    key: 'extract',
    label: '摘要提取',
    icon: <FileTextOutlined />,
    path: '/notes/extract'
  },
  {
    key: 'mind-map',
    label: '思维导图',
    icon: <ApartmentOutlined />,
    path: '/notes/mind-map'
  },
  {
    key: 'keywords',
    label: '关键词提取',
    icon: <ClusterOutlined />,
    path: '/notes/keywords'
  },
    {
    key: 'smart-lecture',
    label: '智能讲解',
    icon: <CommentOutlined />,
    path: '/notes/smart-lecture'
  },
  {
    key: 'save',
    label: '储存到库',
    icon: <ExportOutlined />,
    path: '/notes/save'
  }
];

const NotePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // 获取当前激活的标签页
  const activeTab = NOTE_TABS.find(tab =>
    location.pathname.includes(tab.key)
  )?.key || 'extract';

  return (
    <Layout className="note-layout">
      {/* 头部区域 */}
      <Header className="note-header">
        <div className="brand-section">
          <span className="app-name">LinkMind</span>
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item onClick={() => navigate('/home')}>
              <HomeOutlined /> 首页
            </Breadcrumb.Item>
            <Breadcrumb.Item>笔记工作台</Breadcrumb.Item>
            <Breadcrumb.Item>
              {NOTE_TABS.find(t => t.key === activeTab)?.label}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </Header>

      <Layout>
        {/* 左侧导航栏 */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={240}
          theme="light"
          className="side-nav"
        >
          <div className="nav-header">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
            {!collapsed && (
              <Title level={4} className="nav-title">
                <BookOutlined /> 笔记工具
              </Title>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onSelect={({ key }) => {
              const path = NOTE_TABS.find(t => t.key === key)?.path;
              path && navigate(path);
            }}
          >
            {NOTE_TABS.map(tab => (
              <Menu.Item
                key={tab.key}
                icon={tab.icon}
              >
                {tab.label}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>

        {/* 右侧内容区域 */}
        <Content className="note-content">
          {/* 使用路由出口嵌入子页面 */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default NotePage;
