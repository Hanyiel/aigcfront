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
    Empty
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
    FileOutlined
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


    return (
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
                                <Button type="primary" style={{ marginTop: 36 }}>修改密码</Button>
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
                                <Button style={{ marginTop: 36 }}>启用双重认证</Button>
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
                                <Button style={{ marginTop: 36 }}>查看登录设备</Button>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </Card>
    )
}

export default SecurityPage;