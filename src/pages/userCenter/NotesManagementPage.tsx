import React, { useState } from 'react';
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Tooltip,
  Empty,
  List,
  Dropdown,
  Menu,
  Tabs,
  Descriptions,
  Divider,
  Image
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  TagsOutlined,
  ClusterOutlined,
  AudioOutlined,
  FileTextFilled,
  LinkOutlined,
  FileOutlined,
  EyeOutlined,
  MoreOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/userCenter/NotesManagementPage.css';

// 笔记管理子标签类型
type NotesSubTabKey = 'all-notes' | 'specific';

// 资源类型
type ResourceType = 'keywords' | 'mindmap' | 'explanation' | 'summary';

// 具体笔记子标签类型
type NoteDetailTabKey = 'original' | 'mindmap' | 'explanation';

const NotesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [notesSubTab, setNotesSubTab] = useState<NotesSubTabKey>('all-notes');
  const [noteDetailTab, setNoteDetailTab] = useState<NoteDetailTabKey>('original');
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [searchForm] = Form.useForm();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [userData] = useState({
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
    notes: [
      {
        id: 1,
        title: '高等数学笔记',
        content: '微积分基本定理和应用：微分学包括求导数的运算，是一套关于变化率的理论。它使得函数、速度、加速度和曲线的斜率等均可用一套通用的符号进行讨论。积分学包括求积分的运算，为定义和计算面积、体积等提供一套通用的方法。',
        tags: ['数学', '微积分'],
        category: '数学笔记',
        difficulty: 3,
        date: '2025-06-28',
        views: 120,
        favorites: 15,
        resources: {
          keywords: true,
          mindmap: true,
          explanation: false,
          summary: true
        },
        originalImage: 'https://via.placeholder.com/800x600?text=笔记原图示例',
        mindmapImage: 'https://via.placeholder.com/800x600?text=思维导图示例',
        explanation: '高等数学是大学数学的基础课程，主要包含微积分、线性代数和概率论等内容。本笔记重点讲解了微积分的基本概念和应用，包括极限、导数、微分、积分等核心知识点。'
      },
      {
        id: 2,
        title: '线性代数核心概念',
        content: '矩阵运算、特征值和特征向量：矩阵是线性代数中的基本概念，它是一个按照矩形阵列排列的复数或实数集合。特征值和特征向量是矩阵的重要属性，特征值表示线性变换的缩放因子，特征向量表示变换的方向。',
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
        },
        originalImage: 'https://via.placeholder.com/800x600?text=笔记原图示例',
        mindmapImage: 'https://via.placeholder.com/800x600?text=思维导图示例',
        explanation: '线性代数是研究向量空间和线性映射的数学分支。本笔记涵盖了矩阵运算、行列式、特征值和特征向量等核心概念，这些内容在工程、物理和计算机科学中有广泛应用。'
      },
      {
        id: 3,
        title: '数据结构与算法',
        content: '常见数据结构和算法分析：数据结构是计算机存储、组织数据的方式。算法是解决特定问题求解步骤的描述。常见的数据结构包括数组、链表、栈、队列、树、图等。算法分析主要关注时间复杂度和空间复杂度。',
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
        },
        originalImage: 'https://via.placeholder.com/800x600?text=笔记原图示例',
        mindmapImage: 'https://via.placeholder.com/800x600?text=思维导图示例',
        explanation: '数据结构与算法是计算机科学的核心基础。本笔记系统整理了常见数据结构的特点和应用场景，以及常用算法的时间复杂度和实现要点，包括排序算法、搜索算法和图算法等。'
      },
      {
        id: 4,
        title: '英语词汇记忆法',
        content: '词根词缀记忆法和常用词汇：英语单词由词根、前缀和后缀组成。了解常见的词根词缀可以帮助记忆单词。例如，词根 "spect" 表示 "看"，所以 "inspect"（检查）、"respect"（尊重）和 "spectator"（观众）都与此相关。',
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
        },
        originalImage: 'https://via.placeholder.com/800x600?text=笔记原图示例',
        mindmapImage: 'https://via.placeholder.com/800x600?text=思维导图示例',
        explanation: '英语词汇记忆有多种有效方法，本笔记重点介绍词根词缀记忆法，通过分析单词的构成部分来理解其含义。此外，还整理了常用高频词汇和短语，帮助提升词汇量和阅读能力。'
      },
      {
        id: 5,
        title: '物理力学公式总结',
        content: '牛顿力学和运动学公式：牛顿三大定律是经典力学的基础。第一定律（惯性定律）、第二定律（F=ma）和第三定律（作用与反作用）。运动学公式包括位移公式（s = v₀t + ½at²）、速度公式（v = v₀ + at）等。',
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
        },
        originalImage: 'https://via.placeholder.com/800x600?text=笔记原图示例',
        mindmapImage: 'https://via.placeholder.com/800x600?text=思维导图示例',
        explanation: '力学是物理学的基础分支，研究物体的运动和力的作用。本笔记系统整理了牛顿力学三大定律和运动学基本公式，以及它们在解决实际问题中的应用方法和注意事项。'
      }
    ],
    questions: [
      {id: 1, title: '微积分练习题', type: '数学', difficulty: '中等', date: '2025-06-28'},
      {id: 2, title: '线性代数证明题', type: '数学', difficulty: '困难', date: '2025-06-27'},
      {id: 3, title: '算法分析题', type: '计算机', difficulty: '困难', date: '2025-06-25'},
      {id: 4, title: '英语阅读理解', type: '外语', difficulty: '简单', date: '2025-06-24'},
      {id: 5, title: '力学计算题', type: '物理', difficulty: '中等', date: '2025-06-22'}
    ],
    knowledgeTags: ['微积分', '线性代数', '矩阵', '导数', '积分', '数据结构', '算法', '二叉树', '牛顿定律', '英语语法', '词汇']
  });

  const handleKnowledgeSearch = (values: any) => {
    setIsSearching(true);

    // 模拟搜索过程
    setTimeout(() => {
      const {keyword, category, difficulty} = values;

      const results = userData.notes.filter(note => {
        const matchesKeyword = keyword
            ? note.title.includes(keyword) || note.content.includes(keyword)
            : true;

        const matchesCategory = category
            ? note.category === category
            : true;

        const matchesDifficulty = difficulty
            ? note.difficulty === difficulty
            : true;

        return matchesKeyword && matchesCategory && matchesDifficulty;
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  const resetSearch = () => {
    searchForm.resetFields();
    setSearchResults([]);
  };

  const handleResourceClick = (noteId: number, resourceType: ResourceType) => {
    console.log(`打开笔记 ${noteId} 的 ${resourceType} 资源`);
    // 这里实际应导航到对应资源页面
  };

  const renderResourceMenu = (note: any) => (
      <Menu>
        <Menu.Item
            disabled={!note.resources.keywords}
            onClick={() => note.resources.keywords && handleResourceClick(note.id, 'keywords')}
        >
          <LinkOutlined /> 关键词
        </Menu.Item>
        <Menu.Item
            disabled={!note.resources.mindmap}
            onClick={() => note.resources.mindmap && handleResourceClick(note.id, 'mindmap')}
        >
          <ClusterOutlined /> 思维导图
        </Menu.Item>
        <Menu.Item
            disabled={!note.resources.explanation}
            onClick={() => note.resources.explanation && handleResourceClick(note.id, 'explanation')}
        >
          <AudioOutlined /> 笔记讲解
        </Menu.Item>
        <Menu.Item
            disabled={!note.resources.summary}
            onClick={() => note.resources.summary && handleResourceClick(note.id, 'summary')}
        >
          <FileOutlined /> 笔记摘要
        </Menu.Item>
      </Menu>
  );

  // 渲染笔记列表项
  const renderNoteItem = (note: any) => (
      <List.Item className="note-list-item">
        <div className="note-item-content">
          <div className="note-item-header">
            <div className="note-item-title">
              <FileTextFilled style={{color: '#1890ff', marginRight: 8}}/>
              {note.title}
            </div>
            <div className="note-item-meta">
              <span className="note-date">{note.date}</span>
              <span className="note-views">浏览: {note.views}</span>
              <span className="note-favorites">收藏: {note.favorites}</span>
            </div>
          </div>

          <div className="note-item-body">
            <div className="note-summary">
              {note.content.length > 80 ? note.content.substring(0, 80) + '...' : note.content}
            </div>

            <div className="note-item-tags">
              <Tag icon={<TagsOutlined/>} color="blue">{note.category}</Tag>
              {note.tags.map((tag: string) => (
                  <Tag key={tag} color="geekblue">{tag}</Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="note-item-actions">
          <Tooltip title="查看详情">
            <Button
                type="primary"
                icon={<EyeOutlined />}
                size="middle"
                onClick={() => {
                  setSelectedNote(note);
                  setNotesSubTab('specific');
                }}
            />
          </Tooltip>

          <Dropdown overlay={renderResourceMenu(note)} trigger={['click']}>
            <Button icon={<MoreOutlined />} size="middle" />
          </Dropdown>
        </div>
      </List.Item>
  );

  const renderAllNodePage = () => {
    return (
        <div className="notes-grid">
          <div className="notes-filter">
            <Input
                placeholder="搜索笔记标题或内容..."
                prefix={<SearchOutlined/>}
                style={{width: 300, marginRight: 16}}
            />
            <Select placeholder="按分类筛选" style={{width: 150, marginRight: 16}}>
              <Select.Option value="数学笔记">数学笔记</Select.Option>
              <Select.Option value="物理笔记">物理笔记</Select.Option>
              <Select.Option value="计算机笔记">计算机笔记</Select.Option>
              <Select.Option value="语言学习">语言学习</Select.Option>
            </Select>
            <Button icon={<FilterOutlined/>}>更多筛选</Button>
          </div>
          {userData.notes.length > 0 ? (
              <div className="notes-list-container">
                <List
                    className="notes-list"
                    itemLayout="horizontal"
                    dataSource={userData.notes}
                    renderItem={renderNoteItem}
                />
              </div>
          ) : (
              <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无笔记数据"
                  style={{margin: '40px 0'}}
              >
                <Button type="primary" icon={<PlusOutlined/>}>创建新笔记</Button>
              </Empty>
          )}
        </div>
    )
  }

  const renderPictureDetail = () => {
    return (
        <div className="note-original-content">
          <div className="image-preview">
            <Image
                src={selectedNote.originalImage}
                alt="笔记原图"
                placeholder={
                  <div style={{
                    background: '#f5f5f5',
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span>加载笔记原图...</span>
                  </div>
                }
            />
          </div>
          <div className="image-meta">
            <p>这是您笔记的原始图片，展示了您最初记录的内容。</p>
            <p>您可以通过放大查看细节，或下载保存原始文件。</p>
          </div>
        </div>
    )
  }

  const renderMindMapdetail = () => {
    return (
        <div className="mindmap-content">
          <div className="image-preview">
            <Image
                src={selectedNote.mindmapImage}
                alt="思维导图"
                placeholder={
                  <div style={{ background: '#f5f5f5', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>生成思维导图中...</span>
                  </div>
                }
            />
          </div>
          <div className="mindmap-description">
            <h3>思维导图解析</h3>
            <p>此思维导图根据您的笔记内容自动生成，展示了知识点的逻辑结构和关联关系。</p>
            <p>中心节点表示核心概念，分支节点表示相关知识点，颜色区分不同知识模块。</p>
          </div>
        </div>
    )
  }

  const renderExplanationDetail = () => {
    return (
        <div className="explanation-content">
          <div className="explanation-header">
            <AudioOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 10 }} />
            <h3>智能讲解：{selectedNote.title}</h3>
          </div>

          {/* 添加滚动容器 */}
          <div className="explanation-scroll-container">
            <div className="explanation-text">
              <p>{selectedNote.explanation}</p>
            </div>
            <div className="audio-player">
              <div className="audio-placeholder">
                <Button type="primary" icon={<AudioOutlined/>} size="middle">
                  播放讲解音频(其实并没有)
                </Button>
                <div className="audio-duration">预计时长: 5分30秒</div>
              </div>
            </div>
            <div className="explanation-tips">
              <h4>学习建议：</h4>
              <ul>
                <li>结合思维导图理解知识点结构</li>
                <li>重点掌握核心概念和公式</li>
                <li>完成相关练习题巩固知识</li>
                <li>定期复习以强化记忆</li>
              </ul>
            </div>
          </div>
        </div>
    )
  }

  const renderNodeDetail = () => {
    return (
        <Col span={16}>
          <Card
              className="note-detail-card"
              tabList={[
                {key: 'original', tab: '笔记原图'},
                {key: 'mindmap', tab: '思维导图'},
                {key: 'explanation', tab: '智能讲解'},
              ]}
              activeTabKey={noteDetailTab}
              onTabChange={(key) => setNoteDetailTab(key as NoteDetailTabKey)}
          >
            {noteDetailTab === 'original' && renderPictureDetail()}

            {noteDetailTab === 'mindmap' && renderMindMapdetail() }

            {noteDetailTab === 'explanation' && renderExplanationDetail() }
          </Card>
        </Col>
    )
  }

  const renderSpecificNote = () => {
    if (!selectedNote) {
      return (
          <div className="note-detail-empty">
            <Empty
                description="请先选择一个笔记"
                imageStyle={{ height: 80 }}
            >
              <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setNotesSubTab('all-notes')}
              >
                返回笔记列表
              </Button>
            </Empty>
          </div>
      );
    }

    return (
        <div className="note-detail-container">
          <Row gutter={24}>
            {/* 左侧笔记摘要区域 */}
            <Col span={8}>
              <Card
                  title={selectedNote.title}
                  className="note-summary-card"
                  extra={<div className="note-tags-container">
                    {selectedNote.tags.map((tag: string) => (
                        <Tag key={tag} color="geekblue">{tag}</Tag>
                    ))}
                  </div>
                  }
              >

                <Divider orientation="left">内容摘要</Divider>
                <div className="note-content-summary">
                  {selectedNote.content}
                </div>


              </Card>
            </Col>

            {/* 右侧笔记详情区域 */}
            { renderNodeDetail() }
          </Row>
        </div>
    );
  };

  return (
      <Card
          title="笔记管理"
          tabList={[
            {key: 'all-notes', tab: '所有笔记'},
            {key: 'specific', tab: '具体笔记查询'}
          ]}
          activeTabKey={notesSubTab}
          onTabChange={(key) => setNotesSubTab(key as NotesSubTabKey)}
          extra={
              notesSubTab === 'all-notes' && (
                  <Button
                      type="primary"
                      icon={<PlusOutlined/>}
                      onClick={() => navigate('/notes/index')}
                  >新建笔记</Button>
              )
          }
      >
        {notesSubTab === 'all-notes' ? renderAllNodePage() : renderSpecificNote()}
      </Card>
  )
}

export default NotesManagementPage;
