// src/pages/HomePage.tsx
import React, { useState } from 'react';
import {Layout, Menu, Dropdown, Card, Row, Col, Typography, Breadcrumb, Button} from 'antd';
import {
  BookOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ClusterOutlined,
  SolutionOutlined,
  SearchOutlined,
  RocketOutlined,
  HomeOutlined,
  SaveOutlined,
  KeyOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const { Header, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

const ROUTES = {
  NOTES: {
    INDEX: { path: '/notes/index', tabKey: 'index' },
    EXTRACT: { path: '/notes/extract', tabKey: 'extract' },
    MIND_MAP: { path: '/notes/mind-map', tabKey: 'mindmap' },
    KEYWORDS: { path: '/notes/keywords', tabKey: 'keywords' },
    EXPLANATION: { path: '/notes/smart-lecture', tabKey: 'smart-lecture' },
    SAVE_TO_DB: { path: '/notes/save', tabKey: 'storage' },
    NOTE_MANAGEMENT: { path: '/user-center/notes-management', tabKey: 'note-management'}
  },
  QUESTIONS: {
    INDEX: { path: '/questions/index', tabKey: 'questionIndex' },
    EXTRACT: { path: '/questions/extract', tabKey: 'extract' },
    SAVE: { path: '/questions/save', tabKey: 'save' },
    EXPLAIN: { path: '/questions/explanation', tabKey: 'explanation' },
    KEYWORDS: { path: '/questions/keywords', tabKey: 'keywords' },
    FIND_NOTES: { path: '/questions/related-notes', tabKey: 'related-notes' },
    AUTO_GRADE: { path: '/questions/auto-grade', tabKey: 'grading' },
    QUESTION_MANAGEMENT: { path: '/user-center/questions-management', tabKey: 'question-management' }
  }
};


const featureCards = {
  notes: [
    { title: '智能提取摘要', icon: <FileTextOutlined />, path: ROUTES.NOTES.EXTRACT },
    { title: '生成思维导图', icon: <ClusterOutlined />, path: ROUTES.NOTES.MIND_MAP },
    { title: '知识点关键词', icon: <KeyOutlined />, path: ROUTES.NOTES.KEYWORDS },
    { title: '智能生成讲解', icon: <CommentOutlined />, path: ROUTES.NOTES.EXPLANATION },
    { title: '保存笔记', icon: <SaveOutlined />, path: ROUTES.NOTES.SAVE_TO_DB },
    { title: '管理笔记', icon: <HomeOutlined />, path: ROUTES.NOTES.NOTE_MANAGEMENT}
  ],
  questions: [
    { title: '题目摘要提取', icon: <SolutionOutlined />, path: ROUTES.QUESTIONS.EXTRACT },
    { title: '生成知识点关键词', icon: <KeyOutlined />, path: ROUTES.QUESTIONS.KEYWORDS },
    { title: '智能题目讲解', icon: <QuestionCircleOutlined />, path: ROUTES.QUESTIONS.EXPLAIN },
    { title: '查找相关笔记', icon: <SearchOutlined />, path: ROUTES.QUESTIONS.FIND_NOTES },
    { title: '自动批改功能', icon: <CheckCircleOutlined />, path: ROUTES.QUESTIONS.AUTO_GRADE },
    { title: '题目保存', icon: <SolutionOutlined />, path: ROUTES.QUESTIONS.SAVE },
    { title: '管理题目', icon: <HomeOutlined />, path: ROUTES.QUESTIONS.QUESTION_MANAGEMENT },
  ]
};

const HomePage: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('notes');
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (path: string, tabKey: string) => {
    navigate({
      pathname: path,
      search: `?tab=${tabKey}` // 使用查询参数传递标签页标识
    });
  };

  const getMainRoute = () => {
    const route = selectedKey === 'notes'
        ? ROUTES.NOTES.INDEX
        : ROUTES.QUESTIONS.INDEX;
    return {
      pathname: route.path,
      search: `?tab=${route.tabKey}`
    };
  };

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
              <Breadcrumb.Item onClick={() => navigate('/home')}>
                <HomeOutlined /> 首页
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>


          <Dropdown overlay={userMenu} trigger={['click']}>
            <div className="user-center" onClick={() => navigate('/user-center')}>
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
            <div className="start-experience-container">
              <Card
                  hoverable
                  className="experience-card"
                  onClick={() => navigate(getMainRoute())}
              >
                <div className="card-content">
                  <ExperimentOutlined className="main-icon"/>
                  <Title level={3} className="start-text">
                    {selectedKey === 'notes' ? '开始整理笔记' : '开始处理题目'}
                  </Title>
                  <Paragraph className="sub-text">
                    {selectedKey === 'notes'
                        ? '点击进入智能笔记处理工作台'
                        : '立即开启题目智能分析流程'}
                  </Paragraph>
                  <Button
                      type="primary"
                      size="large"
                      className="start-button"
                      icon={<RocketOutlined/>}
                  >
                    {selectedKey === 'notes' ? '创建新笔记' : '上传题目'}
                  </Button>
                </div>
              </Card>
            </div>
            <div className="feature-cards-container">
              <Title level={4} className="cards-title">功能入口</Title>
              <div className="cards-scroll-area">
                <Row gutter={[24, 24]}>
                  {featureCards[selectedKey as keyof typeof featureCards].map((card) => (
                      <Col key={card.title} xs={24} sm={12} lg={8}>
                        <Card
                            hoverable
                            className="feature-card"
                            onClick={() => handleCardClick(card.path.path, card.path.tabKey)}
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
            </div>
          </Content>
        </Layout>
      </Layout>
  );
};

export default HomePage;
