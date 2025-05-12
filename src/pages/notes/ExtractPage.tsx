// src/pages/notes/extract/index.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Upload,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Breadcrumb,
  Dropdown
} from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  FilePdfOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import './extract.css';

const { Header, Sider, Content } = Layout;
const { Dragger } = Upload;
const { Title, Text } = Typography;

interface ExtractResult {
  summary: string;
  keywords: string[];
  structure: any[];
}

const ExtractPage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [currentFile, setCurrentFile] = useState<File>();
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [error, setError] = useState('');

  const mockResult = {
    summary: '本文详细阐述了深度学习的核心概念...',
    keywords: ['深度学习', '神经网络', '反向传播'],
    structure: [
      {
        title: '第一章 引言',
        key: '0',
        children: [
          { title: '1.1 研究背景', key: '0-0' },
          { title: '1.2 研究意义', key: '0-1' },
        ],
      }
    ],
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

  const handleUpload = (file: File) => {
    setCurrentFile(file);
    setError('');
    return false; // 阻止自动上传
  };

  const handleExtract = () => {
    setExtracting(true);
    setTimeout(() => {
      setResult(mockResult);
      setExtracting(false);
    }, 1500);
  };

  return (
      <Layout className="extract-layout">
        {/* 顶部导航栏 */}
        <Header className="extract-header">
          <div className="brand">
            <span className="brand-name">LinkMind</span>
            <span className="brand-sub">智能学习云脑引擎</span>
            <Breadcrumb style={{ fontSize: '16px' , margin: '0 0 0 10px' }}>
            <Breadcrumb.Item onClick={() => navigate('/')}>
              <HomeOutlined/> 首页
            </Breadcrumb.Item>
            <Breadcrumb.Item>笔记功能</Breadcrumb.Item>
            <Breadcrumb.Item>智能提取</Breadcrumb.Item>
          </Breadcrumb>
          </div>

          <Dropdown overlay={userMenu} trigger={['click']}>
            <div className="user-center">
              <UserOutlined className="user-icon"/>
              <span>用户中心</span>
            </div>
          </Dropdown>
        </Header>
        <Layout>

          {/* 侧边导航栏 */}
          <Sider
              collapsible
              collapsed={collapsed}
              onCollapse={setCollapsed}
              width={250}
              theme="light"
              trigger={null}
              className="site-sider"
          >
            <div className="sider-header">
              <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  className="collapse-btn"
              />
            </div>
            <Menu
                mode="inline"
                defaultSelectedKeys={['extract']}
                className="side-menu"
            >
              <Menu.Item
                  key="home"
                  icon={<HomeOutlined />}
                  onClick={() => navigate('/')}
              >
                返回首页
              </Menu.Item>
              <Menu.ItemGroup title="笔记功能">
                <Menu.Item key="mindmap" icon={<BookOutlined />}>思维导图</Menu.Item>
                <Menu.Item key="extract" icon={<FilePdfOutlined />}>智能提取</Menu.Item>
              </Menu.ItemGroup>
            </Menu>
          </Sider>


          {/* 主要内容区域 */}
          <Content className="extract-content">
            <div className="content-wrapper">
              <Title level={3} className="main-title">
                笔记提取
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="back-btn"
                >
                  返回上一级
                </Button>
              </Title>

              <Row gutter={[24, 24]} className="content-row">
                {/* 上传区域 */}
                <Col xs={24} md={12}>
                  <Card title="内容上传" className="upload-card">
                    <Dragger
                        accept=".pdf,.docx,.txt,.md,.mp4,.mp3"
                        beforeUpload={handleUpload}
                        maxCount={1}
                        showUploadList={false}
                    >
                      <div className="upload-content">
                        <InboxOutlined className="upload-icon" />
                        <Text className="upload-text">
                          {currentFile ? (
                              <>
                                已选择文件：<span className="file-name">{currentFile.name}</span>
                                <br />
                                <Button type="link" onClick={() => setCurrentFile(undefined)}>
                                  重新选择
                                </Button>
                              </>
                          ) : (
                              '点击或拖拽文件到此区域上传'
                          )}
                        </Text>
                        <Text type="secondary" className="format-tip">
                          支持格式：PDF, DOCX, TXT, MD, MP4, MP3
                        </Text>
                      </div>
                    </Dragger>
                  </Card>
                </Col>

                {/* 结果区域 */}
                <Col xs={24} md={12}>
                  <Card title="提取结果" className="result-card">
                    <Spin spinning={extracting} tip="AI正在解析内容...">
                      <div className="result-content">
                        {currentFile ? (
                            <>
                              <div className="action-bar">
                                <Button
                                    type="primary"
                                    onClick={handleExtract}
                                    disabled={!currentFile}
                                    className="extract-btn"
                                >
                                  开始智能提取
                                </Button>
                              </div>

                              {result && (
                                  <div className="result-details">
                                    {/* 结果展示部分 */}
                                  </div>
                              )}
                            </>
                        ) : (
                            <div className="empty-tip">请先上传需要解析的文件</div>
                        )}
                      </div>
                    </Spin>
                  </Card>
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </Layout>
  );
};

export default ExtractPage;
