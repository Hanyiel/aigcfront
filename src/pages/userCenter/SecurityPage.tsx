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
    Breadcrumb,
    Form,
    Input,
    Upload,
    Space,
    Select,
    Tag,
    Tooltip,
    Empty,
    Modal, // 添加Modal组件
    message // 添加message组件
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
    CloudUploadOutlined,
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    TagsOutlined,
    ClusterOutlined,
    AudioOutlined,
    FileTextFilled,
    LinkOutlined,
    FileOutlined,
    LockOutlined // 添加锁图标
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/userCenter/UserCenter.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// 左侧菜单类型
type MainTabKey = 'profile' | 'security' | 'notes-management' | 'questions-management';

// 笔记管理子标签类型
type NotesSubTabKey = 'all-notes' | 'knowledge-query';

// 资源状态类型
type ResourceStatus = {
    keywords: boolean;
    mindmap: boolean;
    explanation: boolean;
    summary: boolean;
};

const SecurityPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<MainTabKey>('profile');
    const [notesSubTab, setNotesSubTab] = useState<NotesSubTabKey>('all-notes');
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // 添加状态控制对话框
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [twoFactorVisible, setTwoFactorVisible] = useState(false);
    const [deviceManageVisible, setDeviceManageVisible] = useState(false);

    // 处理修改密码表单提交
    const handleChangePassword = async (values: any) => {
        const { oldPassword, newPassword, confirmPassword } = values;

        // 验证新密码和确认密码是否一致
        if (newPassword !== confirmPassword) {
            message.error('新密码和确认密码不一致');
            return;
        }

        try {
            // 这里应该是调用API修改密码的逻辑
            // 模拟API调用
            console.log('修改密码:', { oldPassword, newPassword });

            // 模拟成功
            message.success('密码修改成功');
            setChangePasswordVisible(false);
            form.resetFields(); // 重置表单
        } catch (error) {
            message.error('密码修改失败，请重试');
        }
    };

    return (
        <>
            <Card title="账户安全">
                <Row gutter={24}>
                    <Col span={24}>
                        <div className="security-item">
                            <Row >
                                <Col span={22}>
                                    <Title level={5}>修改密码</Title>
                                    <Text type="secondary">定期修改密码可以提高账户安全性</Text>
                                </Col>
                                <Col span={2}>
                                    <Button
                                        type="primary"
                                        style={{ marginTop: 36 }}
                                        onClick={() => setChangePasswordVisible(true)}
                                    >
                                        修改密码
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        <div className="security-item">
                            <Row>
                                <Col span={22}>
                                    <Title level={5}>双重认证</Title>
                                    <Text type="secondary">启用后，登录时需要输入手机验证码</Text>
                                </Col>
                                <Col span={2}>
                                    <Button
                                        style={{ marginTop: 36 }}
                                        onClick={() => setTwoFactorVisible(true)}
                                    >
                                        启用双重认证
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        <div className="security-item">
                            <Row>
                                <Col span={22}>
                                    <Title level={5}>登录设备管理</Title>
                                    <Text type="secondary">查看并管理已登录的设备</Text>
                                </Col>
                                <Col span={2}>
                                    <Button
                                        style={{ marginTop: 36 }}
                                        onClick={() => setDeviceManageVisible(true)}
                                    >
                                        查看登录设备
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* 修改密码对话框 */}
            <Modal
                title="修改密码"
                open={changePasswordVisible}
                onCancel={() => setChangePasswordVisible(false)}
                footer={null}
                width={400}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        name="oldPassword"
                        label="旧密码"
                        rules={[{ required: true, message: '请输入旧密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请输入当前密码"
                        />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 6, message: '密码长度至少6位' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请输入新密码"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认新密码"
                        rules={[{ required: true, message: '请确认新密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请再次输入新密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 双重认证提示对话框 */}
            <Modal
                title="双重认证"
                open={twoFactorVisible}
                onCancel={() => setTwoFactorVisible(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setTwoFactorVisible(false)}>
                        确定
                    </Button>
                ]}
            >
                <p>暂不支持此功能</p>
            </Modal>

            {/* 登录设备管理提示对话框 */}
            <Modal
                title="登录设备管理"
                open={deviceManageVisible}
                onCancel={() => setDeviceManageVisible(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setDeviceManageVisible(false)}>
                        确定
                    </Button>
                ]}
            >
                <p>暂不支持此功能</p>
            </Modal>
        </>
    )
}

export default SecurityPage;
