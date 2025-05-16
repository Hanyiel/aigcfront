// src/pages/test-page/index.tsx
import {Layout, Typography, Button, Menu, Dropdown} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoutOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import '../../styles/questions/RecordPage.css'; // 可以复用现有样式

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const RecordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 统一用户菜单（与主界面保持一致）
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
    <Layout className="test-layout">
      {/* 统一导航栏 */}
      <Header className="test-header">
        <div className="nav-container">
          <div className="nav-left">
            <span
              className="brand"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              LinkMind
            </span>
            <span className="divider">/</span>
            <span className="path">
              {location.pathname.split('/').filter(Boolean).join(' / ')}
            </span>
          </div>

          <Dropdown overlay={userMenu} trigger={['click']}>
            <div className="user-center">
              <UserOutlined className="user-icon" />
              <span>用户中心</span>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* 测试内容区域 */}
      <Content className="test-content">
        <div className="content-wrapper">
          <Title level={2} className="test-title">
            🚧 功能开发中
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginLeft: 24 }}
            >
              返回上一页
            </Button>
          </Title>

          <div className="mock-content">
            <Text type="secondary">
              当前路径：{location.pathname}
            </Text>

            <div style={{ marginTop: 40 }}>
              <Text strong>可用测试操作：</Text>
              <div style={{ marginTop: 16 }}>
                <Button onClick={() => navigate('/')}>返回首页</Button>
                <Button onClick={() => navigate('/notes')} style={{ marginLeft: 12 }}>
                  跳转笔记功能
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default RecordPage;
