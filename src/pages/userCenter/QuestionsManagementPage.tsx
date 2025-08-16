import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Button,
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
  Badge,
  Form,
  Spin,
  message
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
import { useNavigate } from "react-router-dom";
import { UserQuestionContext } from '../../contexts/userCenter/UserQuestionContext';
import { logout } from "../../services/auth";

const { Text } = Typography;
const { Panel } = Collapse;
const API_URL = 'http://localhost:8000/api';
const UPLOADS_URL = 'http://localhost:8000/uploads';

// 题目管理子标签类型
type QuestionsSubTabKey = 'all-questions' | 'incorrect-questions' | 'question-detail';

// 具体题目子标签类型
type QuestionDetailTabKey = 'summary' | 'explanation' | 'related-notes' | 'grading';

interface Question {
  questionId: string;
  content: string;
  type: string;
  isWrong: boolean;
  hasMindMap: boolean;
  hasKeywords: boolean;
  hasExplanation: boolean;
  hasAutoScoreReport: boolean;
  hasRelatedItems: boolean;
  imageName?: string;
  createTime: string;
  updateTime: string;
}

interface QuestionBasic {
  questionId: string;
  content: string;
  type: string;
  isWrong: boolean;
}

interface AutoScoreReport {
  code: number;
  score: number;
  correct_answer: string;
  your_answer: string;
  error_analysis: string[];
  explanation: string[];
  knowledge_point: string[];
}

interface QuestionAutoScore {
  autoScoreReport: AutoScoreReport;
}

interface RelatedNote {
  noteId: string;
  title: string;
  content: string;
  similarity: number;
}

interface RelatedQuestion {
  questionId: string;
  content: string;
  similarity: number;
}

interface QuestionRelatedItems {
  relatedItems: {
    related_notes: RelatedNote[];
    related_questions: RelatedQuestion[];
  };
}

const QuestionsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [questionsSubTab, setQuestionsSubTab] = useState<QuestionsSubTabKey>('all-questions');
  const [questionDetailTab, setQuestionDetailTab] = useState<QuestionDetailTabKey>('summary');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionDetail, setQuestionDetail] = useState<QuestionBasic | null>(null);
  const [autoScore, setAutoScore] = useState<QuestionAutoScore | null>(null);
  const [relatedItems, setRelatedItems] = useState<QuestionRelatedItems | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [searchForm] = Form.useForm();
  const [isSearching, setIsSearching] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0
  });
  const [loading, setLoading] = useState({
    subjects: false,
    questions: false,
    detail: false
  });

  const questionContext = useContext(UserQuestionContext);

  // 获取科目列表
  const getSubjects = async () => {
    try {
      setLoading(prev => ({ ...prev, subjects: true }));
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/questions/subject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.code === 200 && result.data?.subject) {
        setSubjects(result.data.subject);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取学科失败');
    } finally {
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  // 获取题型列表
  const getQuestionTypes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/questions/type`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.code === 200 && result.data?.subject) {
        setQuestionTypes(result.data.subject);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取题型失败');
    }
  };

  // 获取题目列表
  const getQuestions = async (isWrongOnly: boolean = false) => {
    try {
      setLoading(prev => ({ ...prev, questions: true }));
      const token = localStorage.getItem('authToken');
      const formValues = searchForm.getFieldsValue();
      const requestBody = {
        isWrong: isWrongOnly ? true : undefined,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        subject: formValues.subject || undefined,
        type: formValues.type || undefined
      };

      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.code === 200 && result.data) {
        setQuestions(result.data.questions || []);
        setPagination(prev => ({
          ...prev,
          total: result.data.total || 0
        }));
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取题目失败');
    } finally {
      setLoading(prev => ({ ...prev, questions: false }));
    }
  };

  // 获取题目详情
  const fetchQuestionDetails = async (questionId: string) => {
    if (!questionId) return;

    setLoading(prev => ({ ...prev, detail: true }));

    try {
      // 获取基本信息
      const basic = await questionContext.getQuestionBasic(questionId);
      setQuestionDetail(basic);

      // 获取评分报告
      const score = await questionContext.getQuestionAutoScore(questionId);
      setAutoScore(score);

      // 获取讲解
      const explanationData = await questionContext.getQuestionExplanation(questionId);
      setExplanation(explanationData?.explanation || null);

      // 获取相关内容
      const related = await questionContext.getQuestionRelatedItems(questionId);
      setRelatedItems(related);
    } catch (error) {
      message.error('获取题目详情失败');
    } finally {
      setLoading(prev => ({ ...prev, detail: false }));
    }
  };

  // // 初始化数据
  // useEffect(() => {
  //   getSubjects();
  //   getQuestionTypes();
  //   getQuestions();
  // }, [pagination.pageNum, pagination.pageSize]);

  // // 当切换标签时重新获取题目列表
  // useEffect(() => {
  //   if (questionsSubTab === 'all-questions') {
  //     getQuestions(false);
  //   } else if (questionsSubTab === 'incorrect-questions') {
  //     getQuestions(true);
  //   }
  // }, [questionsSubTab]);

  // 当选择题目时获取详情
  useEffect(() => {
    if (selectedQuestion) {
      fetchQuestionDetails(selectedQuestion.questionId);
    }
  }, [selectedQuestion]);

  // 处理搜索
  const handleQuestionSearch = (values: any) => {
    getQuestions(questionsSubTab === 'incorrect-questions');
  };

  const resetSearch = () => {
    searchForm.resetFields();
    getQuestions(questionsSubTab === 'incorrect-questions');
  };

  // 渲染题目列表项
  const renderQuestionItem = (question: Question) => (
    <List.Item className="question-list-item">
      <div className="question-item-content">
        <div className="question-item-header">
          <div className="question-item-title">
            <QuestionCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            {question.content.substring(0, 30)}...
            {question.isWrong && (
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
            <Tag color="blue">{question.type}</Tag>
            <span className="question-date">{question.createTime.split(' ')[0]}</span>
          </div>
        </div>

        <div className="question-item-body">
          <div className="question-summary">
            {question.content.substring(0, 100)}...
          </div>

          <div className="question-item-tags">
            <Tag color={question.hasMindMap ? 'green' : 'default'}>思维导图</Tag>
            <Tag color={question.hasKeywords ? 'green' : 'default'}>关键词</Tag>
            <Tag color={question.hasExplanation ? 'green' : 'default'}>讲解</Tag>
            <Tag color={question.hasAutoScoreReport ? 'green' : 'default'}>评分报告</Tag>
            <Tag color={question.hasRelatedItems ? 'green' : 'default'}>相关内容</Tag>
          </div>

          {/* 显示题目图片 */}
          {question.imageName && (
            <div className="question-item-image">
              <Image
                src={`${UPLOADS_URL}/${question.imageName}`}
                alt="题目图片"
                width={80}
                height={60}
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
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
      <Spin spinning={loading.questions || loading.subjects}>
        <div className="questions-grid">
          <div className="notes-filter">
            <Input
              placeholder="搜索题目内容..."
              prefix={<SearchOutlined />}
              style={{ width: 300, marginRight: 16 }}
            />
            <Select
              placeholder="学科"
              style={{ width: 120, marginRight: 16 }}
              onChange={(value) => {
                searchForm.setFieldsValue({ subject: value });
              }}
            >
              <Select.Option value="">全部</Select.Option>
              {subjects.map((subject) => (
                <Select.Option key={subject} value={subject}>
                  {subject}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="题型"
              style={{ width: 120, marginRight: 16 }}
              onChange={(value) => {
                searchForm.setFieldsValue({ type: value });
              }}
            >
              <Select.Option value="">全部</Select.Option>
              {questionTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
            <Button
              icon={questions.length > 0 ? <FilterOutlined /> : <SearchOutlined />}
              onClick={() => getQuestions(false)}
            >
              {questions.length > 0 ? '刷新' : '查询'}
            </Button>
          </div>

          {questions.length > 0 ? (
            <div className="questions-list-container">
              <List
                className="questions-list"
                itemLayout="horizontal"
                dataSource={questions}
                renderItem={renderQuestionItem}
                pagination={{
                  current: pagination.pageNum,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: (page, pageSize) => {
                    setPagination(prev => ({ ...prev, pageNum: page, pageSize }));
                  },
                  showSizeChanger: true,
                  showTotal: total => `共 ${total} 条题目`
                }}
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
      </Spin>
    );
  };

  const renderIncorrectQuestionsPage = () => {
    return (
      <Spin spinning={loading.questions}>
        <div className="questions-grid">
          <div className="questions-filter">
            <Form form={searchForm} layout="inline" onFinish={() => getQuestions(true)}>
              <Form.Item name="subject" style={{ marginBottom: 16 }}>
                <Select placeholder="学科" style={{ width: 120 }}>
                  <Select.Option value="">全部</Select.Option>
                  {subjects.map((subject) => (
                    <Select.Option key={subject} value={subject}>
                      {subject}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="type" style={{ marginBottom: 16 }}>
                <Select placeholder="题型" style={{ width: 120 }}>
                  <Select.Option value="">全部</Select.Option>
                  {questionTypes.map((type) => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
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

          {questions.length > 0 ? (
            <div className="questions-list-container">
              <List
                className="questions-list"
                itemLayout="horizontal"
                dataSource={questions}
                renderItem={renderQuestionItem}
                pagination={{
                  current: pagination.pageNum,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: (page, pageSize) => {
                    setPagination(prev => ({ ...prev, pageNum: page, pageSize }));
                  },
                  showSizeChanger: true,
                  showTotal: total => `共 ${total} 条题目`
                }}
              />
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无错题记录"
              style={{ margin: '40px 0' }}
            >
              <p>太棒了！您目前没有错题记录，继续保持！</p>
            </Empty>
          )}
        </div>
      </Spin>
    );
  };

  const renderSummaryDetail = () => {
    if (!selectedQuestion || !questionDetail) return null;

    return (
      <div className="question-summary-detail">
        <div className="question-content">
          <h4>题目内容</h4>
          <div className="content-box">
            <Text>{questionDetail.content}</Text>
          </div>
        </div>

        <div className="question-answer">
          <h4>题目类型</h4>
          <div className="content-box">
            <Tag color="blue">{questionDetail.type}</Tag>
            <Tag color={questionDetail.isWrong ? 'red' : 'green'}>
              {questionDetail.isWrong ? '错题' : '已掌握'}
            </Tag>
          </div>
        </div>

        <div className="knowledge-points">
          <h4>附加资源</h4>
          <div className="tags-container">
            <Tag color={selectedQuestion.hasMindMap ? 'green' : 'default'}>思维导图</Tag>
            <Tag color={selectedQuestion.hasKeywords ? 'green' : 'default'}>关键词</Tag>
            <Tag color={selectedQuestion.hasExplanation ? 'green' : 'default'}>讲解</Tag>
            <Tag color={selectedQuestion.hasAutoScoreReport ? 'green' : 'default'}>评分报告</Tag>
            <Tag color={selectedQuestion.hasRelatedItems ? 'green' : 'default'}>相关内容</Tag>
          </div>
        </div>
      </div>
    );
  };

  const renderExplanationDetail = () => {
    return (
      <div className="explanation-content">
        <div className="explanation-header">
          <AudioOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 10 }} />
          <h3>题目讲解</h3>
        </div>

        <div className="explanation-scroll-container">
          <div className="explanation-text">
            {explanation ? (
              <pre>{explanation}</pre>
            ) : (
              <Empty description="暂无讲解内容" />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRelatedNotes = () => {
    if (!relatedItems) return null;

    return (
      <div className="related-notes">
        <h3>相关笔记 ({relatedItems.relatedItems.related_notes.length})</h3>
        <p>以下笔记可能对理解本题有帮助：</p>

        <List
          itemLayout="horizontal"
          dataSource={relatedItems.relatedItems.related_notes}
          renderItem={note => (
            <List.Item>
              <List.Item.Meta
                avatar={<FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                title={<a>{note.title}</a>}
                description={`相似度: ${(note.similarity * 100).toFixed(1)}%`}
              />
              <Button type="link" size="small">查看笔记</Button>
            </List.Item>
          )}
        />

        <h3 style={{ marginTop: 20 }}>相关题目 ({relatedItems.relatedItems.related_questions.length})</h3>
        <List
          itemLayout="horizontal"
          dataSource={relatedItems.relatedItems.related_questions}
          renderItem={question => (
            <List.Item>
              <List.Item.Meta
                avatar={<QuestionCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                title={<a>{question.content.substring(0, 50)}...</a>}
                description={`相似度: ${(question.similarity * 100).toFixed(1)}%`}
              />
              <Button type="link" size="small">查看题目</Button>
            </List.Item>
          )}
        />
      </div>
    );
  };

  const renderGradingDetail = () => {
    if (!autoScore) return null;

    const report = autoScore.autoScoreReport;

    return (
      <div className="grading-detail">
        <div className="grading-header">
          <div className="score-display">
            <span className="score-label">得分：</span>
            <span className="score-value">{report.score}/10</span>
          </div>
          <div className="status-tag">
            {report.score >= 6 ? (
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
            <Text>{report.error_analysis.join(' ')}</Text>
          </div>
        </div>

        {report.error_analysis.length > 0 && (
          <div className="mistakes-section">
            <h4>错误分析</h4>
            <List
              size="small"
              dataSource={report.error_analysis}
              renderItem={(mistake, index) => (
                <List.Item>
                  <Text>{index + 1}. {mistake}</Text>
                </List.Item>
              )}
            />
          </div>
        )}

        <div className="improvement-tips">
          <h4>解题思路</h4>
          <Collapse bordered={false} defaultActiveKey={['1']}>
            <Panel header="解题步骤" key="1">
              <ul>
                {report.explanation.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </Panel>
            <Panel header="知识点" key="2">
              <ul>
                {report.knowledge_point.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
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
        <Spin spinning={loading.detail}>
          <Row gutter={8}>
            <Col span={10}>
              <Card
                title="题目摘要"
                className="question-detail-card"
              >
                {renderSummaryDetail()}
              </Card>
            </Col>
            <Col span={14}>
              <Card
                className="question-detail-card"
                tabList={[
                  { key: 'explanation', tab: '智能讲解' },
                  { key: 'related-notes', tab: '相关内容' },
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
        </Spin>
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
