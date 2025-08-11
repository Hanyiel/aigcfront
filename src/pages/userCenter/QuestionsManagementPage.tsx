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
  Image,
  Collapse,
  Typography,
  Badge
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  TagsOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  AudioOutlined,
  EyeOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import '../../styles/userCenter/QuestionsMangementPage.css';
import {useNavigate} from "react-router-dom";

const { Text } = Typography;
const { Panel } = Collapse;

// 题目管理子标签类型
type QuestionsSubTabKey = 'all-questions' | 'incorrect-questions' | 'question-detail';

// 具体题目子标签类型
type QuestionDetailTabKey = 'summary' | 'explanation' | 'related-notes' | 'grading';

const QuestionsManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const [questionsSubTab, setQuestionsSubTab] = useState<QuestionsSubTabKey>('all-questions');
  const [questionDetailTab, setQuestionDetailTab] = useState<QuestionDetailTabKey>('summary');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [searchForm] = Form.useForm();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [userData] = useState({
    username: 'LinkMind用户',
    email: 'user@linkmind.com',
    joinDate: '2025年1月15日',
    avatar: null,
    usageStats: {
      questionsProcessed: 128,
      incorrectQuestions: 42,
      notesCreated: 56,
      mindMapsGenerated: 18
    },
    questions: [
      {
        id: 1,
        title: '微积分练习题',
        type: '数学',
        difficulty: '中等',
        date: '2025-06-28',
        status: 'correct',
        content: '求函数 f(x) = x³ - 3x² + 2x 在区间 [0, 3] 上的最大值和最小值。',
        answer: '最大值在 x=1 处取得，f(1)=0；最小值在 x=2 处取得，f(2)=-2',
        explanation: '首先求导数 f\'(x) = 3x² - 6x + 2，令导数为零解得 x=1 和 x=2。在区间端点 f(0)=0，f(3)=6。比较四个点的函数值可得最大值 f(3)=6，最小值 f(2)=-2。',
        knowledgePoints: ['导数', '函数极值', '闭区间最值'],
        relatedNotes: [1, 5],
        grading: {
          score: 10,
          feedback: '解答正确，步骤完整，使用了导数求解极值的方法。',
          mistakes: []
        }
      },
      {
        id: 2,
        title: '线性代数证明题',
        type: '数学',
        difficulty: '困难',
        date: '2025-06-27',
        status: 'incorrect',
        content: '证明：若 n 阶矩阵 A 满足 A² = A，则 A 的特征值只能是 0 或 1。',
        answer: '设 λ 是 A 的特征值，x 是对应的特征向量，则 Ax = λx。由 A²x = A(Ax) = A(λx) = λ(Ax) = λ²x，又 A² = A，故 A²x = Ax = λx，所以 λ²x = λx，即 (λ² - λ)x = 0。因 x ≠ 0，故 λ² - λ = 0，解得 λ = 0 或 1。',
        explanation: '该证明利用了特征值和特征向量的定义，结合矩阵等式 A² = A 推导出特征值满足的方程。证明的关键在于理解特征向量的非零性保证了 λ² - λ = 0 成立。',
        knowledgePoints: ['矩阵', '特征值', '特征向量'],
        relatedNotes: [2],
        grading: {
          score: 6,
          feedback: '证明思路正确，但在特征向量非零性的论述上不够严谨，导致失分。',
          mistakes: [
            '未明确说明特征向量 x 不为零向量',
            '未考虑特征向量空间维度问题'
          ]
        }
      },
      {
        id: 3,
        title: '算法分析题',
        type: '计算机',
        difficulty: '困难',
        date: '2025-06-25',
        status: 'incorrect',
        content: '设计一个时间复杂度为 O(n log n) 的算法，找出一个未排序整数数组中的最长连续序列的长度。例如，给定 [100, 4, 200, 1, 3, 2]，最长连续序列是 [1, 2, 3, 4]，返回长度 4。',
        answer: '使用哈希集合存储所有数字，遍历数组，对于每个数字，如果其前一个数不在集合中，则向后查找连续序列，记录最大长度。',
        explanation: '该算法首先将所有数字存入哈希集合（O(n)），然后遍历数组（O(n)），对于每个数字，如果它是序列的起点（即前一个数不在集合中），则向后查找连续序列（每个元素只会被访问一次，因此总时间复杂度为 O(n)）。整个算法时间复杂度为 O(n)。',
        knowledgePoints: ['算法', '时间复杂度', '哈希表'],
        relatedNotes: [3],
        grading: {
          score: 8,
          feedback: '算法思路正确，但未明确说明时间复杂度分析过程，且代码实现中边界条件处理不够完善。',
          mistakes: [
            '时间复杂度分析不完整',
            '未考虑重复数字的情况',
            '边界条件处理有瑕疵'
          ]
        }
      },
      {
        id: 4,
        title: '英语阅读理解',
        type: '外语',
        difficulty: '简单',
        date: '2025-06-24',
        status: 'correct',
        content: '阅读以下段落，回答后面的问题：\n\n"The Industrial Revolution, which began in Britain in the late 18th century, marked a major turning point in history. It involved the transformation from an agrarian society to an industrial one, characterized by the development of new manufacturing processes and the introduction of machinery."\n\n问题：工业革命的主要特征是什么？',
        answer: '从农业社会向工业社会的转变，以及新制造工艺的发展和机械的引入。',
        explanation: '该题目考察对段落关键信息的提取能力。正确答案需要包含两个核心点：1) 社会形态转变（农业到工业）；2) 技术变革（新制造工艺和机械）。',
        knowledgePoints: ['阅读理解', '关键信息提取', '历史术语'],
        relatedNotes: [4],
        grading: {
          score: 10,
          feedback: '回答准确，完整涵盖了段落中的关键信息点。',
          mistakes: []
        }
      },
      {
        id: 5,
        title: '力学计算题',
        type: '物理',
        difficulty: '中等',
        date: '2025-06-22',
        status: 'correct',
        content: '一个质量为 2kg 的物体从静止开始沿光滑斜面下滑，斜面倾角为 30°，斜面长度为 5m。求物体滑到斜面底端时的速度。（g=10m/s²）',
        answer: '根据机械能守恒：mgh = 1/2 mv²，其中 h = 5 × sin30° = 2.5m，所以 v = √(2gh) = √(2×10×2.5) = √50 ≈ 7.07m/s',
        explanation: '该问题可以使用牛顿第二定律或机械能守恒定律解决。机械能守恒是更简便的方法，因为斜面光滑无摩擦，物体重力势能完全转化为动能。',
        knowledgePoints: ['牛顿定律', '机械能守恒', '斜面运动'],
        relatedNotes: [5],
        grading: {
          score: 10,
          feedback: '解题方法正确，计算准确，使用了最简便的机械能守恒方法。',
          mistakes: []
        }
      },
      {
        id: 6,
        title: '二叉树遍历',
        type: '计算机',
        difficulty: '中等',
        date: '2025-06-20',
        status: 'incorrect',
        content: '已知二叉树的前序遍历序列为 ABDECF，中序遍历序列为 DBEAFC，请画出该二叉树并写出后序遍历序列。',
        answer: '二叉树结构：A为根，B为左子节点，D为B的左子节点，E为B的右子节点，C为A的右子节点，F为C的右子节点。后序遍历序列：DEBFCA',
        explanation: '二叉树的重建需要根据前序和中序遍历序列确定根节点位置，然后递归构建左右子树。后序遍历的序列可以通过递归遍历得到。',
        knowledgePoints: ['二叉树', '遍历算法', '递归'],
        relatedNotes: [3],
        grading: {
          score: 7,
          feedback: '二叉树结构正确，但后序遍历序列错误，应该是 DEBFCA 而不是 DBEBCA。',
          mistakes: [
            '后序遍历序列错误',
            '未正确识别C节点的左子树为空'
          ]
        }
      }
    ],
    notes: [
      { id: 1, title: '高等数学笔记', category: '数学笔记' },
      { id: 2, title: '线性代数核心概念', category: '数学笔记' },
      { id: 3, title: '数据结构与算法', category: '计算机笔记' },
      { id: 4, title: '英语词汇记忆法', category: '语言学习' },
      { id: 5, title: '物理力学公式总结', category: '物理笔记' }
    ],
    knowledgeTags: ['微积分', '线性代数', '矩阵', '导数', '积分', '数据结构', '算法', '二叉树', '牛顿定律', '英语语法', '词汇']
  });

  const handleQuestionSearch = (values: any) => {
    setIsSearching(true);

    // 模拟搜索过程
    setTimeout(() => {
      const { keyword, type, difficulty, status } = values;

      const results = userData.questions.filter(question => {
        const matchesKeyword = keyword
            ? question.title.includes(keyword) || question.content.includes(keyword)
            : true;

        const matchesType = type
            ? question.type === type
            : true;

        const matchesDifficulty = difficulty
            ? question.difficulty === difficulty
            : true;

        const matchesStatus = status
            ? question.status === status
            : true;

        return matchesKeyword && matchesType && matchesDifficulty && matchesStatus;
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  const resetSearch = () => {
    searchForm.resetFields();
    setSearchResults([]);
  };

  // 渲染题目列表项
  const renderQuestionItem = (question: any) => (
      <List.Item className="question-list-item">
        <div className="question-item-content">
          <div className="question-item-header">
            <div className="question-item-title">
              <QuestionCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              {question.title}
              {question.status === 'incorrect' && (
                  <Badge
                      count="错题"
                      style={{
                        backgroundColor: '#ff4d4f',
                        marginLeft: 8,
                        fontSize: 12,
                        height: 20,
                        lineHeight: '20px'
                      }}
                  />
              )}
            </div>
            <div className="question-item-meta">
              <Tag color={question.type === '数学' ? 'blue' :
                  question.type === '计算机' ? 'cyan' :
                      question.type === '外语' ? 'green' : 'orange'}>
                {question.type}
              </Tag>
              <Tag color={question.difficulty === '简单' ? 'green' :
                  question.difficulty === '中等' ? 'orange' : 'red'}>
                {question.difficulty}
              </Tag>
              <span className="question-date">{question.date}</span>
            </div>
          </div>

          <div className="question-item-body">
            <div className="question-summary">
              {question.content.length > 100 ? question.content.substring(0, 100) + '...' : question.content}
            </div>

            <div className="question-item-tags">
              {question.knowledgePoints.slice(0, 3).map((point: string) => (
                  <Tag key={point} color="geekblue">{point}</Tag>
              ))}
              {question.knowledgePoints.length > 3 && (
                  <Tag>+{question.knowledgePoints.length - 3}个</Tag>
              )}
            </div>
          </div>
        </div>

        <div className="question-item-actions">
          <Tooltip title="查看详情">
            <Button
                type="primary"
                icon={<EyeOutlined />}
                size="middle"
                onClick={() => {
                  setSelectedQuestion(question);
                  setQuestionsSubTab('question-detail');
                }}
            />
          </Tooltip>

          <Dropdown overlay={
            <Menu>
              <Menu.Item icon={<FileTextOutlined />}>导出题目</Menu.Item>
              <Menu.Item icon={<AudioOutlined />}>语音讲解</Menu.Item>
              <Menu.Item danger>删除记录</Menu.Item>
            </Menu>
          } trigger={['click']}>
            <Button icon={<MoreOutlined />} size="middle" />
          </Dropdown>
        </div>
      </List.Item>
  );

  const renderAllQuestionsPage = () => {
    return (
        <div className="questions-grid">
          <div className="questions-filter">
            <Form form={searchForm} layout="inline" onFinish={handleQuestionSearch}>
              <Form.Item name="keyword" style={{ marginBottom: 16 }}>
                <Input
                    placeholder="搜索题目内容..."
                    prefix={<SearchOutlined />}
                    style={{ width: 250 }}
                />
              </Form.Item>
              <Form.Item name="type" style={{ marginBottom: 16 }}>
                <Select placeholder="题目类型" style={{ width: 120 }}>
                  <Select.Option value="数学">数学</Select.Option>
                  <Select.Option value="计算机">计算机</Select.Option>
                  <Select.Option value="外语">外语</Select.Option>
                  <Select.Option value="物理">物理</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="difficulty" style={{ marginBottom: 16 }}>
                <Select placeholder="难度" style={{ width: 100 }}>
                  <Select.Option value="简单">简单</Select.Option>
                  <Select.Option value="中等">中等</Select.Option>
                  <Select.Option value="困难">困难</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="status" style={{ marginBottom: 16 }}>
                <Select placeholder="答题状态" style={{ width: 120 }}>
                  <Select.Option value="correct">已掌握</Select.Option>
                  <Select.Option value="incorrect">错题</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item style={{ marginBottom: 16 }}>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={resetSearch}>
                  重置
                </Button>
              </Form.Item>
            </Form>
          </div>

          {userData.questions.length > 0 ? (
              <div className="questions-list-container">
                <List
                    className="questions-list"
                    itemLayout="horizontal"
                    dataSource={userData.questions}
                    renderItem={renderQuestionItem}
                />
              </div>
          ) : (
              <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无题目数据"
                  style={{ margin: '40px 0' }}
              >
                <Button type="primary" icon={<PlusOutlined />}>添加新题目</Button>
              </Empty>
          )}
        </div>
    );
  };

  const renderIncorrectQuestionsPage = () => {
    const incorrectQuestions = userData.questions.filter(q => q.status === 'incorrect');

    return (
        <div className="questions-grid">
          {/*<div className="incorrect-header">*/}
          {/*  <div className="incorrect-stats">*/}
          {/*    <h3>错题统计</h3>*/}
          {/*    <p>共 <span className="highlight">{incorrectQuestions.length}</span> 道错题</p>*/}
          {/*    <p>最近错题率: <span className="highlight">{(incorrectQuestions.length / userData.questions.length * 100).toFixed(1)}%</span></p>*/}
          {/*  </div>*/}
          {/*  <div className="incorrect-actions">*/}
          {/*    <Button type="primary" icon={<PlusOutlined />}>添加错题</Button>*/}
          {/*    <Button style={{ marginLeft: 8 }}>生成错题集</Button>*/}
          {/*  </div>*/}
          {/*</div>*/}
          <div className="questions-filter">
            <Form form={searchForm} layout="inline" onFinish={handleQuestionSearch}>
              <Form.Item name="keyword" style={{marginBottom: 16}}>
                <Input
                    placeholder="搜索题目内容..."
                    prefix={<SearchOutlined/>}
                    style={{width: 250}}
                />
              </Form.Item>
              <Form.Item name="type" style={{marginBottom: 16}}>
                <Select placeholder="题目类型" style={{width: 120}}>
                  <Select.Option value="数学">数学</Select.Option>
                  <Select.Option value="计算机">计算机</Select.Option>
                  <Select.Option value="外语">外语</Select.Option>
                  <Select.Option value="物理">物理</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="difficulty" style={{marginBottom: 16}}>
                <Select placeholder="难度" style={{width: 100}}>
                  <Select.Option value="简单">简单</Select.Option>
                  <Select.Option value="中等">中等</Select.Option>
                  <Select.Option value="困难">困难</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item style={{marginBottom: 16}}>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined/>}>
                  搜索
                </Button>
                <Button style={{marginLeft: 8}} onClick={resetSearch}>
                  重置
                </Button>
              </Form.Item>
            </Form>
          </div>

          {incorrectQuestions.length > 0 ? (
              <div className="questions-list-container">
                <List
                    className="questions-list"
                    itemLayout="horizontal"
                    dataSource={incorrectQuestions}
                    renderItem={renderQuestionItem}
                />
              </div>
          ) : (
              <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无错题记录"
                  style={{margin: '40px 0'}}
              >
                <p>太棒了！您目前没有错题记录，继续保持！</p>
              </Empty>
          )}
        </div>
    );
  };

  const renderSummaryDetail = () => {
    return (
        <div className="question-summary-detail">
          <div className="question-content">
            <h4>题目内容</h4>
            <div className="content-box">
              <Text>{selectedQuestion.content}</Text>
            </div>
          </div>

          <div className="question-answer">
            <h4>你的答案</h4>
            <div className="content-box">
              <Text>{selectedQuestion.answer}</Text>
            </div>
          </div>

          <div className="knowledge-points">
            <h4>知识点</h4>
            <div className="tags-container">
              {selectedQuestion.knowledgePoints.map((point: string) => (
                  <Tag key={point} color="blue">{point}</Tag>
              ))}
            </div>
          </div>
        </div>
    );
  };

  const renderExplanationDetail = () => {
    return (
        <div className="explanation-content">
          <div className="explanation-header">
            <AudioOutlined style={{fontSize: 24, color: '#1890ff', marginRight: 10}}/>
            <h3>题目讲解</h3>
          </div>

          <div className="explanation-scroll-container">
            <div className="explanation-text">
              <p>{selectedQuestion.explanation}</p>
            </div>
          </div>

          <div className="audio-player">
            <div className="audio-placeholder">
              <Button type="primary" icon={<AudioOutlined/>} size="large">
                播放讲解音频
              </Button>
              <div className="audio-duration">预计时长: 3分15秒</div>
            </div>
          </div>

          <div className="explanation-tips">
            <h4>解题技巧：</h4>
            <ul>
              <li>仔细阅读题目要求，确定解题方向</li>
              <li>分析题目涉及的知识点和公式</li>
              <li>分步骤解答，确保逻辑清晰</li>
              <li>最后检查答案是否符合题目要求</li>
            </ul>
          </div>
        </div>
    );
  };

  const renderRelatedNotes = () => {
    const relatedNotes = selectedQuestion.relatedNotes.map((id: number) =>
        userData.notes.find(note => note.id === id)
    );

    return (
        <div className="related-notes">
          <h3>相关笔记 ({relatedNotes.length})</h3>
          <p>以下笔记可能对理解本题有帮助：</p>

          <List
              itemLayout="horizontal"
              dataSource={relatedNotes}
              renderItem={note => (
                  <List.Item>
                    <List.Item.Meta
                        avatar={<FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                        // title={<a href="#">{note.title}</a>}
                        // description={note.category}
                    />
                    <Button type="link" size="small">查看笔记</Button>
                  </List.Item>
              )}
          />

          <div className="notes-tips">
            <h4>学习建议：</h4>
            <ul>
              <li>结合相关笔记复习知识点</li>
              <li>整理错题笔记，记录解题思路</li>
              <li>定期复习错题，巩固薄弱环节</li>
              <li>尝试用不同方法解答同一题目</li>
            </ul>
          </div>
        </div>
    );
  };

  const renderGradingDetail = () => {
    const grading = selectedQuestion.grading;

    return (
        <div className="grading-detail">
          <div className="grading-header">
            <div className="score-display">
              <span className="score-label">得分：</span>
              <span className="score-value">{grading.score}/10</span>
            </div>
            <div className="status-tag">
              {selectedQuestion.status === 'correct' ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    回答正确
                  </Tag>
              ) : (
                  <Tag icon={<CloseCircleOutlined />} color="error">
                    回答错误
                  </Tag>
              )}
            </div>
          </div>

          <div className="feedback-section">
            <h4>批改反馈</h4>
            <div className="feedback-content">
              <Text>{grading.feedback}</Text>
            </div>
          </div>

          {grading.mistakes.length > 0 && (
              <div className="mistakes-section">
                <h4>错误分析</h4>
                <List
                    size="small"
                    dataSource={grading.mistakes}
                    renderItem={(mistake: string, index: number) => (
                        <List.Item>
                          <Text>{index + 1}. {mistake}</Text>
                        </List.Item>
                    )}
                />
              </div>
          )}

          <div className="improvement-tips">
            <h4>提升建议</h4>
            <Collapse bordered={false} defaultActiveKey={['1']}>
              <Panel header="知识点巩固" key="1">
                <ul>
                  {selectedQuestion.knowledgePoints.map((point: string) => (
                      <li key={point}>{point} - 建议完成3道相关练习题</li>
                  ))}
                </ul>
              </Panel>
              <Panel header="解题技巧" key="2">
                <p>1. 仔细审题，明确题目要求</p>
                <p>2. 分析已知条件和未知量</p>
                <p>3. 选择合适的方法和公式</p>
                <p>4. 分步骤解答，确保逻辑清晰</p>
              </Panel>
              <Panel header="学习资源推荐" key="3">
                <p>• 《{selectedQuestion.type}解题方法大全》第5章</p>
                <p>• 在线课程："{selectedQuestion.knowledgePoints[0]}专项突破"</p>
                <p>• 练习题库：{selectedQuestion.type}分类练习题</p>
              </Panel>
            </Collapse>
          </div>
        </div>
    );
  };

  const renderQuestionDetail = () => {
    if (!selectedQuestion) {
      return (
          <div className="question-detail-empty">
            <Empty
                description="请先选择一个题目"
                imageStyle={{ height: 80 }}
            >
              <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setQuestionsSubTab('all-questions')}
              >
                返回题目列表
              </Button>
            </Empty>
          </div>
      );
    }

    return (
        <div className="question-detail-container">

          <Row gutter={8}>
            {/* 左侧题目摘要区域 */}
            <Col span={10}>
              <Card
                  title= "题目摘要"
                  className="question-detail-card"
                  // extra={<div className="note-tags-container">
                  //       {selectedQuestion.tags.map((tag: string) => (
                  //           <Tag key={tag} color="geekblue">{tag}</Tag>
                  //       ))}
                  //     </div>
                  // }
              >

                { renderSummaryDetail() }
              </Card>

            </Col>

            {/* 右侧题目详情区域 */}
            <Col span={14}>
              <Card
                  className="question-detail-card"
                  tabList={[
                    { key: 'explanation', tab: '智能讲解' },
                    { key: 'related-notes', tab: '相关笔记' },
                    { key: 'grading', tab: '批改结果' },

                  ]}
                  activeTabKey={questionDetailTab}
                  onTabChange={(key) => setQuestionDetailTab(key as QuestionDetailTabKey)}
              >
                {questionDetailTab === 'explanation' && renderExplanationDetail()}
                {questionDetailTab === 'related-notes' && renderRelatedNotes()}
                {questionDetailTab === 'grading' && renderGradingDetail()}
              </Card>
            </Col>
          </Row>
        </div>
    );
  };

  return (
      <Card
          title="题目管理"
          tabList={[
            { key: 'all-questions', tab: '全部题目' },
            { key: 'incorrect-questions', tab: '错题集' },
            { key: 'question-detail', tab: '题目详情' },
          ]}
          activeTabKey={questionsSubTab}
          onTabChange={(key) => {
            setQuestionsSubTab(key as QuestionsSubTabKey);
            if (key !== 'question-detail') {
              setSelectedQuestion(null);
            }
          }}
          extra={
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/questions/index')}
            >添加题目</Button>
          }
      >
        {questionsSubTab === 'all-questions' ? renderAllQuestionsPage() :
            questionsSubTab === 'incorrect-questions' ? renderIncorrectQuestionsPage() :
                renderQuestionDetail()}
      </Card>
  );
};

export default QuestionsManagementPage;
