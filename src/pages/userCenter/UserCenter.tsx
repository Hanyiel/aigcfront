// src/pages/UserCenter.tsx
import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Statistic,
  List,
  Breadcrumb,
  Tabs,
  Form,
  Input,
  Upload
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  FileTextOutlined,
  SolutionOutlined,
  EditOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  StarOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/HomePage.css'; // 复用主页样式
import '../../styles/userCenter/UserCenter.css'; // 用户中心特有样式

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  // 用户数据（模拟）
  const [userData, setUserData] = useState({
    username: 'LinkMind用户',
    email: 'user@linkmind.com',
    joinDate: '2025年1月15日',
    avatar: null,
    usageStats: {
      notesCreated: 42,
      questionsProcessed: 28,
      mindMapsGenerated: 15,
      keywordsExtracted: 217
    },
    recentActivities: [
      { id: 1, title: '高等数学笔记', type: '笔记', date: '2025-06-28' },
      { id: 2, title: '线性代数习题集', type: '题目', date: '2025-06-27' },
      { id: 3, title: '数据结构思维导图', type: '导图', date: '2025-06-25' },
      { id: 4, title: '英语词汇关键词', type: '关键词', date: '2025-06-24' },
      { id: 5, title: '物理力学笔记', type: '笔记', date: '2025-06-22' }
    ],
    achievements: [
      { id: 1, name: '新手上路', icon: <StarOutlined />, earned: true },
      { id: 2, name: '笔记达人', icon: <BookOutlined />, earned: true },
      { id: 3, name: '解题高手', icon: <SolutionOutlined />, earned: true },
      { id: 4, name: '导图大师', icon: <FileTextOutlined />, earned: false },
      { id: 5, name: '关键词专家', icon: <QuestionCircleOutlined />, earned: false }
    ]
  });

  // 处理表单提交
  const handleSubmit = (values: any) => {
    console.log('提交的用户信息:', values);
    setUserData({ ...userData, ...values });
    setEditMode(false);
  };

  // 上传头像前的处理
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      console.error('只能上传图片文件!');
    }
    return isImage;
  };

  // 处理上传头像
  const handleAvatarChange = (info: any) => {
    // if (info.file.status === 'done') {
    //   // 这里应该是上传成功后的处理，模拟成功
    //   setUserData({ ...userData, avatar: URL.createObjectURL(info.file.originFileObj) });
    // }
  };

  // 导航到主页
  const navigateToHome = () => {
    navigate('/');
  };

  return (
      <Layout className="home-layout">
        <Header className="header">
          <div className="brand">
            <span className="brand-name">LinkMind</span>
            <span className="brand-sub">智能学习云脑引擎</span>
            <Breadcrumb style={{ fontSize: '16px', margin: '0 0 0 10px' }}>
              <Breadcrumb.Item onClick={navigateToHome}>
                <HomeOutlined /> 首页
              </Breadcrumb.Item>
              <Breadcrumb.Item>个人中心</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="user-center">
            <UserOutlined className="user-icon" />
            <span>用户中心</span>
          </div>
        </Header>

        <Layout>
          <Sider
              width={250}
              theme="light"
          >
            <div className="user-profile-card">
              <div className="avatar-container">
                {userData.avatar ? (
                    <Avatar size={80} src={userData.avatar} />
                ) : (
                    <Avatar size={80} icon={<UserOutlined />} />
                )}
              </div>
              <Title level={4} className="username">{userData.username}</Title>
              <Text type="secondary" className="user-email">
                <MailOutlined /> {userData.email}
              </Text>
              <Text type="secondary" className="join-date">
                加入于 {userData.joinDate}
              </Text>
            </div>

            <Menu
                mode="inline"
                selectedKeys={[activeTab]}
                onSelect={({ key }) => setActiveTab(key as string)}
            >
              <Menu.Item key="profile" icon={<UserOutlined />}>个人信息</Menu.Item>
              <Menu.Item key="security" icon={<SafetyCertificateOutlined />}>安全设置</Menu.Item>
              <Menu.Item key="activities" icon={<HistoryOutlined />}>最近活动</Menu.Item>
              <Menu.Item key="achievements" icon={<StarOutlined />}>成就徽章</Menu.Item>
              <Menu.Divider />
              <Menu.Item
                  key="logout"
                  icon={<LogoutOutlined />}
                  onClick={() => navigate('/login')}
              >
                退出登录
              </Menu.Item>
            </Menu>
          </Sider>

          <Content className="content user-center-content">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {/* 个人信息标签页 */}
              <TabPane tab="个人信息" key="profile">
                <Card
                    title="个人信息管理"
                    extra={
                        !editMode && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => setEditMode(true)}
                            >
                              编辑信息
                            </Button>
                        )
                    }
                >
                  {editMode ? (
                      <Form
                          form={form}
                          layout="vertical"
                          initialValues={userData}
                          onFinish={handleSubmit}
                      >
                        <Row gutter={24}>
                          <Col span={8}>
                            <Form.Item label="头像">
                              <Upload
                                  name="avatar"
                                  listType="picture-card"
                                  showUploadList={false}
                                  beforeUpload={beforeUpload}
                                  onChange={handleAvatarChange}
                              >
                                {userData.avatar ? (
                                    <Avatar size={100} src={userData.avatar} />
                                ) : (
                                    <div>
                                      <div style={{ marginTop: 8 }}>
                                        <CloudUploadOutlined style={{ fontSize: 24 }} />
                                        <div>上传头像</div>
                                      </div>
                                    </div>
                                )}
                              </Upload>
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                                label="用户名"
                                name="username"
                                rules={[{ required: true, message: '请输入用户名' }]}
                            >
                              <Input placeholder="请输入用户名" />
                            </Form.Item>

                            <Form.Item
                                label="电子邮箱"
                                name="email"
                                rules={[
                                  { required: true, message: '请输入电子邮箱' },
                                  { type: 'email', message: '请输入有效的电子邮箱' }
                                ]}
                            >
                              <Input placeholder="请输入电子邮箱" />
                            </Form.Item>

                            <Form.Item>
                              <Button
                                  type="primary"
                                  htmlType="submit"
                                  style={{ marginRight: 10 }}
                              >
                                保存更改
                              </Button>
                              <Button onClick={() => setEditMode(false)}>
                                取消
                              </Button>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                  ) : (
                      <Row gutter={24}>
                        <Col span={8}>
                          <div className="avatar-container">
                            {userData.avatar ? (
                                <Avatar size={120} src={userData.avatar} />
                            ) : (
                                <Avatar size={120} icon={<UserOutlined />} />
                            )}
                          </div>
                        </Col>
                        <Col span={16}>
                          <div className="user-info-section">
                            <div className="info-item">
                              <Text strong>用户名：</Text>
                              <Text>{userData.username}</Text>
                            </div>
                            <div className="info-item">
                              <Text strong>电子邮箱：</Text>
                              <Text>{userData.email}</Text>
                            </div>
                            <div className="info-item">
                              <Text strong>加入日期：</Text>
                              <Text>{userData.joinDate}</Text>
                            </div>
                          </div>
                        </Col>
                      </Row>
                  )}
                </Card>

                <Row gutter={24} style={{ marginTop: 24 }}>
                  <Col span={6}>
                    <Card className="stat-card">
                      <Statistic
                          title="创建的笔记"
                          value={userData.usageStats.notesCreated}
                          prefix={<BookOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="stat-card">
                      <Statistic
                          title="处理的题目"
                          value={userData.usageStats.questionsProcessed}
                          prefix={<SolutionOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="stat-card">
                      <Statistic
                          title="生成的导图"
                          value={userData.usageStats.mindMapsGenerated}
                          prefix={<FileTextOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="stat-card">
                      <Statistic
                          title="提取的关键词"
                          value={userData.usageStats.keywordsExtracted}
                          prefix={<QuestionCircleOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              {/* 安全设置标签页 */}
              <TabPane tab="安全设置" key="security">
                <Card title="账户安全">
                  <Row gutter={24}>
                    <Col span={24}>
                      <div className="security-item">
                        <Title level={5}>修改密码</Title>
                        <Text type="secondary">定期修改密码可以提高账户安全性</Text>
                        <Button type="primary" style={{ marginTop: 10 }}>修改密码</Button>
                      </div>

                      <div className="security-item">
                        <Title level={5}>双重认证</Title>
                        <Text type="secondary">启用后，登录时需要输入手机验证码</Text>
                        <Button style={{ marginTop: 10 }}>启用双重认证</Button>
                      </div>

                      <div className="security-item">
                        <Title level={5}>登录设备管理</Title>
                        <Text type="secondary">查看并管理已登录的设备</Text>
                        <Button style={{ marginTop: 10 }}>查看登录设备</Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </TabPane>

              {/* 最近活动标签页 */}
              <TabPane tab="最近活动" key="activities">
                <Card title="最近活动记录">
                  <List
                      itemLayout="horizontal"
                      dataSource={userData.recentActivities}
                      renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<BookOutlined />} />}
                                title={item.title}
                                description={`${item.type} • ${item.date}`}
                            />
                          </List.Item>
                      )}
                  />
                </Card>
              </TabPane>

              {/* 成就徽章标签页 */}
              <TabPane tab="成就徽章" key="achievements">
                <Card title="成就徽章">
                  <Row gutter={[24, 24]}>
                    {userData.achievements.map(achievement => (
                        <Col key={achievement.id} span={8}>
                          <div className={`achievement-card ${achievement.earned ? 'earned' : ''}`}>
                            <div className="achievement-icon">
                              {achievement.icon}
                            </div>
                            <div className="achievement-name">{achievement.name}</div>
                            <div className="achievement-status">
                              {achievement.earned ? (
                                  <span className="earned-badge">已获得</span>
                              ) : (
                                  <span className="not-earned">未获得</span>
                              )}
                            </div>
                          </div>
                        </Col>
                    ))}
                  </Row>
                </Card>
              </TabPane>
            </Tabs>
          </Content>
        </Layout>
      </Layout>
  );
};

export default UserCenter;
