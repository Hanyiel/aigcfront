// src/pages/UserCenter.tsx
import React, {useState, useEffect, createContext} from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Breadcrumb,
  Form,
  message,
  Modal // 添加Modal组件
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  BookOutlined,
  LogoutOutlined,
  SolutionOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/userCenter/UserCenter.css';
import {Note, NoteDetail} from "../../contexts/userCenter/UserNoteContext";
import {Question, QuestionDetail} from "../../contexts/userCenter/UserQuestionContext";
import QuestionsManagementPage from "./QuestionsManagementPage";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const API_URL = 'http://localhost:8000/api';

// 左侧菜单类型
type MainTabKey = 'profile' | 'security' | 'notes-management' | 'questions-management';

// 笔记管理子标签类型
type NotesSubTabKey = 'all-notes' | 'knowledge-query';

// 资源类型
type ResourceType = 'keywords' | 'mindmap' | 'explanation' | 'summary';

// 资源状态类型
type ResourceStatus = {
  keywords: boolean;
  mindmap: boolean;
  explanation: boolean;
  summary: boolean;
};

const USER_CENTER_TABS = [
  {
    key: 'profile',
    path: '/user-center/profile'
  },
  {
    key: 'security',
    path: '/user-center/security'
  },
  {
    key: 'notes-management',
    path: '/user-center/notes-management'
  },
  {
    key: 'questions-management',
    path: '/user-center/questions-management'
  }
]

// 笔记管理上下文
interface NoteManagementContextType {

  selectedNote: Note | null;
  setSelectedNote: React.Dispatch<React.SetStateAction<Note | null>>;
  selectedNoteDetail: NoteDetail | null;
  setSelectedNoteDetail: React.Dispatch<React.SetStateAction<NoteDetail | null>>;
  selectedSubject: string | null;
  setSelectedSubject: React.Dispatch<React.SetStateAction<string | null>>;
  subjects: string[];
  setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}
interface QuestionManagementContextType {
  selectedQuestion: Question | null;
  setSelectedQuestion: React.Dispatch<React.SetStateAction<Question | null>>;
  selectedQuestionDetail: QuestionDetail | null;
  setSelectedQuestionDetail: React.Dispatch<React.SetStateAction<QuestionDetail | null>>;
  questionTypes: string[];
  setQuestionTypes: React.Dispatch<React.SetStateAction<string[]>>;
  questionSubjects: string[];
  setQuestionSubjects: React.Dispatch<React.SetStateAction<string[]>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

export const NoteManagementContext = createContext<NoteManagementContextType>({
  selectedNote: null,
  setSelectedNote: () => {},
  selectedNoteDetail: null,
  setSelectedNoteDetail: () => {},
  selectedSubject: null,
  setSelectedSubject: () => {},
  subjects: [],
  setSubjects: () => {},
  notes: [],
  setNotes: () => {}
});

export const QuestionManagementContext = createContext<QuestionManagementContextType>({
  selectedQuestion: null,
  setSelectedQuestion: () => {},
  selectedQuestionDetail: null,
  setSelectedQuestionDetail: () => {},
  questionTypes: [],
  setQuestionTypes: () => {},
  questionSubjects: [],
  setQuestionSubjects: () => {},
  questions: [],
  setQuestions: () => {}
});

export interface CountContextType {
  mindmap_count: number ;
  setMindmap_count: React.Dispatch<React.SetStateAction<number >>
  keywords_count: number ;
  setKeywords_count: React.Dispatch<React.SetStateAction<number >>;
}

export const CountContext = createContext<CountContextType>({
  mindmap_count: 0,
  setMindmap_count: () => {},
  keywords_count: 0,
  setKeywords_count: () => {},
})

const UserCenter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notesSubTab, setNotesSubTab] = useState<NotesSubTabKey>('all-notes');
  const [username, setUsername] = useState('LinkMind用户'); // 添加用户名状态
  // 笔记部分数据
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNoteDetail, setSelectedNoteDetail] = useState<NoteDetail | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  // 题目部分数据
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<QuestionDetail | null>(null);
  const [questionSubjects, setQuestionSubjects] = useState<string[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  // 统计部分数据
  const [mindmap_count, setMindmap_count] = useState<number>(0)
  const [keywords_count, setKeywords_count] = useState<number>(0)
  // 在组件挂载时从本地存储获取用户名
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // 用户数据（模拟）
  const [userData] = useState({
    username,
    email: 'user@linkmind.com',
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

  const activeTab = USER_CENTER_TABS.find(tab =>
      location.pathname.includes(tab.key)
  )?.key || 'extract';

  // 导航到主页
  const navigateToHome = () => {
    navigate('/home');
  };

  // 登出函数
  const log_out = () => {
    // 显示确认对话框
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 清除本地存储
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        // 显示退出成功消息
        message.success('已成功退出登录');
        // 跳转到登录页
        navigate('/login');
      },
      onCancel: () => {
        // 用户点击取消，不做任何操作
        console.log('用户取消退出登录');
      },
    });
  }

  // 生成面包屑路径
  const getBreadcrumbPath = () => {
    const paths = [
      <Breadcrumb.Item key="home" onClick={navigateToHome}>
        <HomeOutlined /> 首页
      </Breadcrumb.Item>,
      <Breadcrumb.Item key="user-center">个人中心</Breadcrumb.Item>
    ];

    // 根据当前选中的标签添加路径
    if (activeTab === 'profile') {
      paths.push(<Breadcrumb.Item key="profile">个人信息</Breadcrumb.Item>);
    } else if (activeTab === 'security') {
      paths.push(<Breadcrumb.Item key="security">安全设置</Breadcrumb.Item>);
    } else if (activeTab === 'notes-management') {
      paths.push(<Breadcrumb.Item key="notes-management">笔记管理</Breadcrumb.Item>);
    } else if (activeTab === 'questions-management') {
      paths.push(<Breadcrumb.Item key="questions-management">题目管理</Breadcrumb.Item>);
    }

    return paths;
  };

  return (
      <Layout className="user-center-home-layout">
        {/* ========== 导航栏 ========== */}
        <Header className="user-center-header">
          <div className="brand">
            <span className="brand-name">LinkMind</span>
            <span className="brand-sub">智能学习云脑引擎</span>
            <Breadcrumb style={{ fontSize: '16px', margin: '0 0 0 10px' }}>
              {getBreadcrumbPath()}
            </Breadcrumb>
          </div>

          <div className="user-center">
            <UserOutlined className="user-icon" />
            <span>用户中心</span>
          </div>
        </Header>

        <Layout className="user-center-layout">
          <Sider
              width={240}
              theme="light"
              className="fixed-sider"
          >
            <div className="user-profile-card">
              <div className="avatar-container">
                {userData.avatar ? (
                    <Avatar size={80} src={userData.avatar} />
                ) : (
                    <Avatar size={80} icon={<UserOutlined />} />
                )}
              </div>
              <Title level={4} className="username">{username}</Title>
              <Text type="secondary" className="user-email">
                <MailOutlined /> {userData.email}
              </Text>
              {/*<Text type="secondary" className="join-date">*/}
              {/*  加入于 {userData.joinDate}*/}
              {/*</Text>*/}
            </div>

            <Menu
                mode="inline"
                selectedKeys={[activeTab]}
                onSelect={({ key }) => {
                  const path = USER_CENTER_TABS.find(t => t.key === key)?.path;
                  path && navigate(path);
                }}            >
              <Menu.Item key="profile" icon={<UserOutlined />}>个人信息</Menu.Item>
              <Menu.Item key="security" icon={<SafetyCertificateOutlined />}>安全设置</Menu.Item>
              <Menu.Item key="notes-management" icon={<BookOutlined />}>笔记管理</Menu.Item>
              <Menu.Item key="questions-management" icon={<SolutionOutlined />}>题目管理</Menu.Item>
              <Menu.Divider />
              <Menu.Item
                  key="logout"
                  icon={<LogoutOutlined />}
                  onClick={log_out} // 使用新的登出函数
              >
                退出登录
              </Menu.Item>
            </Menu>
          </Sider>

          <Content className="content user-center-content">
            <NoteManagementContext.Provider value={{
              selectedNote,
              setSelectedNote,
              selectedNoteDetail,
              setSelectedNoteDetail,
              selectedSubject,
              setSelectedSubject,
              subjects,
              setSubjects,
              notes,
              setNotes
            }}>
              <QuestionManagementContext.Provider value={{
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
              }}>
                <CountContext.Provider value={{
                  mindmap_count,
                  setMindmap_count,
                  keywords_count,
                  setKeywords_count,
                }}>
                  <Outlet />
                </CountContext.Provider>
              </QuestionManagementContext.Provider>
            </NoteManagementContext.Provider>
          </Content>
        </Layout>
      </Layout>
  );
};

export default UserCenter;
