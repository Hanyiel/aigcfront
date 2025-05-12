// src/pages/HomePage.tsx
import React, { useState } from 'react';
import {Layout, Menu, Dropdown, Card, Row, Col, Typography, Breadcrumb} from 'antd';
import {
  BookOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ClusterOutlined,
  SolutionOutlined,
  SearchOutlined,
  BulbOutlined,
  EditOutlined,
  RocketOutlined, HomeOutlined

} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const { Header, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

const ROUTES = {
  NOTES: {
    MIND_MAP: '/notes/mind-map',
    EXTRACT: '/notes/extract'
  },
  QUESTIONS: {
    RECORD: '/questions/record',
    EXPLAIN: '/questions/explain',
    SEARCH: '/questions/search'
  }
};


const featureCards = {
  notes: [
    { title: '思维导图生成', icon: <ClusterOutlined />, path: ROUTES.NOTES.MIND_MAP },
    { title: '智能提取笔记', icon: <FileTextOutlined />, path: ROUTES.NOTES.EXTRACT }
  ],
  questions: [
    { title: '题目记录', icon: <SolutionOutlined />, path: ROUTES.QUESTIONS.RECORD },
    { title: '题目讲解', icon: <QuestionCircleOutlined />, path: ROUTES.QUESTIONS.EXPLAIN },
    { title: '关联笔记查找', icon: <SearchOutlined />, path: ROUTES.QUESTIONS.SEARCH }
  ]
};

const HomePage: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('notes');
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

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
      <Layout className="home-layout">
        <Header className="header">
          <div className="brand">
            <span className="brand-name">LinkMind</span>
            <span className="brand-sub">智能学习云脑引擎</span>
            <Breadcrumb style={{ fontSize: '16px' , margin: '0 0 0 10px' }}>
            <Breadcrumb.Item onClick={() => navigate('/')}>
              <HomeOutlined /> 首页
            </Breadcrumb.Item>
          </Breadcrumb>
          </div>


          <Dropdown overlay={userMenu} trigger={['click']}>
            <div className="user-center">
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
              width={250}
              theme="light"
          >
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onSelect={({ key }) => setSelectedKey(key as string)}
            >
              <Menu.ItemGroup title="    ">
                <Menu.Item key="notes" icon={<BookOutlined />}>笔记功能</Menu.Item>
                <Menu.Item key="questions" icon={<QuestionCircleOutlined />}>题目功能</Menu.Item>
              </Menu.ItemGroup>
            </Menu>
          </Sider>

          <Content className="content">
            <div className="hero-section">
              <div className="hero-section">
                <Title level={2} className="hero-title">
                  <RocketOutlined/> 重新定义高效学习方式
                </Title>
                <Paragraph className="hero-description">
                  作为新一代智能学习平台，我们深度融合<span className="highlight">多模态AI解析引擎</span>与<span
                    className="highlight">自适应学习算法</span>，
                  为每位学习者打造专属的知识管理体系。系统支持智能解析PDF、图片等各种文件格式，通过<span
                    className="highlight">深度神经网络</span>
                  自动构建跨学科知识图谱，实现知识点关联。
                </Paragraph>
              </div>
            </div>
            <div className="feature-cards">
              <Title level={4} className="cards-title">功能入口</Title>
              <Row gutter={[24, 24]}>
                {featureCards[selectedKey as keyof typeof featureCards].map((card) => (
                    <Col key={card.title} xs={24} sm={12} lg={8}>
                      <Card
                          hoverable
                          className="feature-card"
                          onClick={() => navigate(card.path)}
                      >
                        <div className="card-content">
                          <div className="card-icon">{card.icon}</div>
                          <h3 className="card-title">{card.title}</h3>
                        </div>
                      </Card>
                    </Col>
                ))}
              </Row>
            </div>
          </Content>
        </Layout>
      </Layout>
  );
};

export default HomePage;
