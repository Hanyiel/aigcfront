// src/pages/questions/QuestionPage.tsx
import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {Layout, Menu, Button, Typography, Breadcrumb, Upload, Dropdown} from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  ClusterOutlined,
  CommentOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  UploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined, SolutionOutlined, UserOutlined, LogoutOutlined
} from '@ant-design/icons';
import '../../styles/questions/QuestionPage.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const QUESTION_TABS = [
  {
    key: 'index',
    label: '题目首页',
    icon: <HomeOutlined />,
    path: '/questions/index'
  },
    {
    key: 'extract', // 新增提取导航项
    label: '题目提取',
    icon: <SolutionOutlined />,
    path: '/questions/extract'
  },
  {
    key: 'keywords',
    label: '知识点关键词',
    icon: <ClusterOutlined />,
    path: '/questions/keywords'
  },
  {
    key: 'explanation',
    label: '题目讲解',
    icon: <CommentOutlined />,
    path: '/questions/explanation'
  },
  {
    key: 'related-notes',
    label: '相关笔记',
    icon: <SearchOutlined />,
    path: '/questions/related-notes'
  },
  {
    key: 'auto-grade',
    label: '自动批改',
    icon: <CheckCircleOutlined />,
    path: '/questions/auto-grade'
  },
  {
    key: 'save',
    label: '保存题目',
    icon: <SaveOutlined />,
    path: '/questions/save'
  }
];

const QuestionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const activeTab = QUESTION_TABS.find(tab =>
    location.pathname.includes(tab.key)
  )?.key || 'index';

  const userMenu = (
      <Menu>
        <Menu.Item key="profile" icon={<UserOutlined />}>个人中心</Menu.Item>
        <Menu.Divider />
        <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={() => navigate('/login')}
        >
          退出登录
        </Menu.Item>
      </Menu>
  );

  return (
    <Layout className="question-layout">
      <Header className="question-header">
        <div className="brand-section">
          <span className="app-name">LinkMind</span>
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item onClick={() => navigate('/home')}>
              <HomeOutlined /> 首页
            </Breadcrumb.Item>
            <Breadcrumb.Item>题目工作台</Breadcrumb.Item>
            <Breadcrumb.Item>
              {QUESTION_TABS.find(t => t.key === activeTab)?.label}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Dropdown overlay={userMenu} trigger={['click']}>
            <div className="user-center" onClick={() => navigate('../user-center')}>
              <UserOutlined className="user-icon" />
              <span>用户中心</span>
            </div>
          </Dropdown>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={240}
          theme="light"
          className="question-side-nav"
        >
          <div className="question-nav-header">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
            {!collapsed && (
              <Title level={4} className="nav-title">
                <BookOutlined /> 题目处理
              </Title>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onSelect={({ key }) => {
              const path = QUESTION_TABS.find(t => t.key === key)?.path;
              path && navigate(path);
            }}
          >
            {QUESTION_TABS.map(tab => (
              <Menu.Item
                key={tab.key}
                icon={tab.icon}
              >
                {tab.label}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>

        <Content className="question-page-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

// 首页组件示例
export const IndexPage = () => (
  <div className="upload-section">
    <Upload.Dragger
      accept="image/*"
      multiple={false}
      beforeUpload={() => false}
      className="uploader"
    >
      <p className="upload-icon">
        <UploadOutlined style={{ fontSize: 40 }} />
      </p>
      <p className="upload-text">点击或拖拽题目图片到这里</p>
      <p className="upload-hint">支持JPG/PNG格式，建议图片大小不超过5MB</p>
    </Upload.Dragger>
  </div>
);

export default QuestionPage;
