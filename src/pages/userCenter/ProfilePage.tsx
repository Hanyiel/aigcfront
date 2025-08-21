import React, {useContext, useEffect, useState} from 'react';
import {
    Card,
    Row,
    Col,
    Avatar,
    Button,
    Statistic,
    Form,
    Input,
    Upload, Layout, Typography,

} from 'antd';
import {
    UserOutlined,
    BookOutlined,
    QuestionCircleOutlined,
    FileTextOutlined,
    SolutionOutlined,
    EditOutlined,
    CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/userCenter/ProfilePage.css';
import {Note, NoteDetail, useUserNoteContext} from "../../contexts/userCenter/UserNoteContext"
import { Question, QuestionDetail } from "../../contexts/userCenter/UserQuestionContext"

import {NoteManagementContext, QuestionManagementContext} from "./UserCenter";


const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// 左侧菜单类型
type MainTabKey = 'profile' | 'security' | 'notes-management' | 'questions-management';

// 笔记管理子标签类型
type NotesSubTabKey = 'all-notes' | 'knowledge-query';

// 资源类型

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<MainTabKey>('profile');
    const [notesSubTab, setNotesSubTab] = useState<NotesSubTabKey>('all-notes');
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [username, setUsername] = useState('LinkMind用户'); // 添加用户名状态

    // 笔记部分数据
    const noteManagementContext = useContext(NoteManagementContext);

    const{
        selectedNote = null,
        setSelectedNote = () => {},
        selectedNoteDetail = null,
        setSelectedNoteDetail = () => {},
        selectedSubject = null,
        setSelectedSubject = () => {},
        subjects = [],
        setSubjects = () => {},
        notes = [],
        setNotes = () => {}
    } = noteManagementContext || {};

    const questionManagementContext = useContext(QuestionManagementContext);
    const {
        selectedQuestion,
        setSelectedQuestion,
        selectedQuestionDetail,
        setSelectedQuestionDetail,
        questionTypes,
        setQuestionTypes,
        questionSubjects,
        setQuestionSubjects,
        questions,
        setQuestions
    }=questionManagementContext || {};

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // 用户数据（模拟）
    const [userData] = useState({
        email: 'use@linkmind.com',
        joinDate: '2025年1月15日',
        avatar: null,
        usageStats: {
            notesCreated: 42,
            questionsProcessed: 28,
            mindMapsGenerated: 15,
            keywordsExtracted: 217
        },
        notes: [
            {
                id: 1,
                title: '高等数学笔记',
                content: '微积分基本定理和应用...',
                tags: ['数学', '微积分'],
                category: '数学笔记',
                difficulty: 3,
                date: '2025-06-28',
                views: 120,
                favorites: 15,
                // 资源状态：true表示存在，false表示不存在
                resources: {
                    keywords: true,
                    mindmap: true,
                    explanation: false,
                    summary: true
                }
            },
            {
                id: 2,
                title: '线性代数核心概念',
                content: '矩阵运算、特征值和特征向量...',
                tags: ['数学', '线性代数'],
                category: '数学笔记',
                difficulty: 2,
                date: '2025-06-27',
                views: 85,
                favorites: 8,
                resources: {
                    keywords: true,
                    mindmap: false,
                    explanation: true,
                    summary: true
                }
            },
            {
                id: 3,
                title: '数据结构与算法',
                content: '常见数据结构和算法分析...',
                tags: ['计算机', '算法'],
                category: '计算机笔记',
                difficulty: 4,
                date: '2025-06-25',
                views: 210,
                favorites: 32,
                resources: {
                    keywords: true,
                    mindmap: true,
                    explanation: true,
                    summary: true
                }
            },
            {
                id: 4,
                title: '英语词汇记忆法',
                content: '词根词缀记忆法和常用词汇...',
                tags: ['外语', '英语'],
                category: '语言学习',
                difficulty: 1,
                date: '2025-06-24',
                views: 95,
                favorites: 12,
                resources: {
                    keywords: false,
                    mindmap: false,
                    explanation: true,
                    summary: false
                }
            },
            {
                id: 5,
                title: '物理力学公式总结',
                content: '牛顿力学和运动学公式...',
                tags: ['物理', '力学'],
                category: '物理笔记',
                difficulty: 3,
                date: '2025-06-22',
                views: 78,
                favorites: 9,
                resources: {
                    keywords: true,
                    mindmap: true,
                    explanation: false,
                    summary: true
                }
            }
        ],
        questions: [
            { id: 1, title: '微积分练习题', type: '数学', difficulty: '中等', date: '2025-06-28' },
            { id: 2, title: '线性代数证明题', type: '数学', difficulty: '困难', date: '2025-06-27' },
            { id: 3, title: '算法分析题', type: '计算机', difficulty: '困难', date: '2025-06-25' },
            { id: 4, title: '英语阅读理解', type: '外语', difficulty: '简单', date: '2025-06-24' },
            { id: 5, title: '力学计算题', type: '物理', difficulty: '中等', date: '2025-06-22' }
        ],
        knowledgeTags: ['微积分', '线性代数', '矩阵', '导数', '积分', '数据结构', '算法', '二叉树', '牛顿定律', '英语语法', '词汇']
    });

    const handleSubmit = (values: any) => {
        console.log('提交的用户信息:', values);
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

    return (
        <>
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
                                    <Text>{username}</Text>
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

            <Row gutter={36} style={{ marginTop: 36, alignItems: "center" }}>
                <Col span={1}>

                </Col>
                <Col span={10}>
                    <Card
                        className="stat-card"
                        onClick={()=>navigate("../notes-management")}
                    >
                        <Statistic
                            title="创建的笔记"
                            value={notes.length > 0 ? notes.length : "请前往笔记管理页面获取笔记数据或者新建笔记"}
                            style={{ height : 160, alignItems: "center", paddingTop: 40}}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={2}>

                </Col>
                <Col span={10}>
                    <Card
                        className="stat-card"
                        onClick={()=>navigate("../questions-management")}
                    >
                        <Statistic
                            title="处理的题目"
                            value={questions.length > 0 ? questions.length : "请前往题目管理页面获取题目数据或者新建题目"}
                            style={{ height : 160, alignItems: "center", paddingTop: 40}}
                            prefix={<SolutionOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={1}>

                </Col>
            </Row>
        </>
    )
}

export default ProfilePage;