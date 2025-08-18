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
  CloseCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import '../../styles/userCenter/QuestionsMangementPage.css';
import { useNavigate } from "react-router-dom";
import { UserQuestionContext } from '../../contexts/userCenter/UserQuestionContext';
import { logout } from "../../services/auth";
import { Question, QuestionDetail } from "../../contexts/userCenter/UserQuestionContext"
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const { Text } = Typography;
const { Panel } = Collapse;
const API_URL = 'http://localhost:8000/api';
const UPLOADS_URL = 'http://localhost:8000/uploads';

// 题目管理子标签类型
type QuestionsSubTabKey = 'all-questions' | 'incorrect-questions' | 'question-detail';

// 具体题目子标签类型
type QuestionDetailTabKey = 'extract' | 'explanation' | 'related-notes' | 'grading';

const QuestionsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [questionsSubTab, setQuestionsSubTab] = useState<QuestionsSubTabKey>('all-questions');
  const [questionDetailTab, setQuestionDetailTab] = useState<QuestionDetailTabKey>('extract');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<QuestionDetail | null>(null);
  const [questionDetail, setQuestionDetail] = useState<QuestionDetail | null>(null); // 更新为 QuestionDetail 类型
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
  const [imageFile, setImageFile] = useState<File | null>(null);

  const questionContext = useContext(UserQuestionContext);

  // 图片URL转File对象的函数
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error converting URL to File:', error);
      throw error;
    }
  };

  // 重新编辑处理函数
  const reEditQuestion = () => {
    if (selectedQuestion && questionDetail && imageFile) {
      questionContext.prepareQuestionRegenarate(selectedQuestion, questionDetail, imageFile);
      navigate('/questions/index');
    } else {
      message.warning('无法重新编辑，请确保题目信息已加载完成');
    }
  };

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
      console.log("获取结果", result);
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
      const token = localStorage.getItem('authToken');

      // 获取基本信息
      const basicResponse = await fetch(`${API_URL}/questions/${questionId}/basic`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!basicResponse.ok) {
        throw new Error(`获取基本信息失败: ${basicResponse.statusText}`);
      }

      const basicResult = await basicResponse.json();
      const basicData = basicResult.data || {};

      // 获取自动评分报告
      let autoScoreReport = null;
      try {
        const scoreResponse = await fetch(`${API_URL}/questions/${questionId}/score`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (scoreResponse.ok) {
          const scoreResult = await scoreResponse.json();
          autoScoreReport = scoreResult.data?.autoScoreReport || null;
        }
      } catch (scoreError) {
        console.warn('获取评分报告失败:', scoreError);
      }

      // 获取讲解
      let explanationData = null;
      try {
        const explanationResponse = await fetch(`${API_URL}/questions/${questionId}/explanation`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (explanationResponse.ok) {
          const explanationResult = await explanationResponse.json();
          explanationData = explanationResult.data?.explanation || null;
        }
      } catch (explanationError) {
        console.warn('获取讲解失败:', explanationError);
      }

      // 组合所有数据
      setQuestionDetail({
        questionId,
        title: basicData.title || '无标题',
        content: basicData.content || '无内容',
        explanation: explanationData,
        AutoScoreReport: autoScoreReport,
        // 其他字段根据实际情况添加
      });

    } catch (error) {
      message.error('获取题目详情失败');
    } finally {
      setLoading(prev => ({ ...prev, detail: false }));
    }
  };

  // 当选择题目时获取详情
  useEffect(() => {
    if (selectedQuestion) {
      fetchQuestionDetails(selectedQuestion.questionId);
    }
  }, [selectedQuestion]);

  // 获取题目图片并转换为文件
  useEffect(() => {
    if (selectedQuestion && selectedQuestion.imageName) {
      const convertImage = async () => {
        try {
          const file = await urlToFile(
              `${UPLOADS_URL}/${selectedQuestion.imageName}`,
              selectedQuestion.imageName || ''
          );
          setImageFile(file);
        } catch (error) {
          console.error('Failed to convert image:', error);
          setImageFile(null);
        }
      };

      convertImage();
    } else {
      setImageFile(null);
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
              {questionDetail ? (
                  questionDetail.content?.substring(0, 30) || '无标题'
              ):(
                  ""
              )}
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
              <span className="question-date">{question.createTime?.split(' ')[0] || ''}</span>
            </div>
          </div>

          <div className="question-item-body">
            <div className="question-summary">
              {questionDetail ? (
                  questionDetail.content?.substring(0, 100) || '无内容'
              ):(
                  "暂无内容"
              )}
            </div>

            <div className="question-item-tags">
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

  const renderExtractDetail = () => {
    return (
        <div className="question-management-detail-content">
          <div className="question-management-detail-header">
            笔记摘要
          </div>
          <div className={"question-detail-scroll-container"}>
            <div className="explanation-text">
              <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
              >
                {selectedQuestionDetail?.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
    )
  }


  const renderExplanationDetail = () => {
    if (!questionDetail) return null;

    return (
        <div className="question-management-detail-content">
          <div className="question-management-detail-header">
            题目讲解
          </div>
          <div className={"question-detail-scroll-container"}>
            <div className="explanation-scroll-container">
              <div className="explanation-text">
                {questionDetail.explanation ? (
                    <pre>{questionDetail.explanation}</pre>
                ) : (
                    <Empty description="暂无讲解内容"/>
                )}
              </div>
            </div>
          </div>

          <div className="explanation-scroll-container">
            <div className="explanation-text">
              {questionDetail.explanation ? (
                  <pre>{questionDetail.explanation}</pre>
              ) : (
                  <Empty description="暂无讲解内容"/>
              )}
            </div>
          </div>
        </div>
    );
  };

  const renderGradingDetail = () => {
    if (!questionDetail?.AutoScoreReport) return null;

    const report = questionDetail.AutoScoreReport;

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
              <Text>{report.error_analysis?.join(' ') || '无反馈信息'}</Text>
            </div>
          </div>

          {report.error_analysis && report.error_analysis.length > 0 && (
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
                {/*<ul>*/}
                {/*  {report.explanation?.map((step, index) => (*/}
                {/*    <li key={index}>{step}</li>*/}
                {/*  ))}*/}
                {/*</ul>*/}
              </Panel>
              <Panel header="知识点" key="2">
                <ul>
                  {report.knowledge_point?.map((point, index) => (
                      <li key={index}>{point}</li>
                  ))}
                </ul>
              </Panel>
            </Collapse>
          </div>
        </div>
    );
  };

  const renderQuestionDetailCard = () => {
    if(!selectedQuestion) return null;

    return (
        <Col span={16}>
          <Card
              className="question-detail-card"
              tabList={[
                { key: 'explanation', tab: '智能讲解' },
                { key: 'grading', tab: '批改结果' },
                { key: 'extract', tab: '摘要内容'},
              ]}
              activeTabKey={questionDetailTab}
              onTabChange={(key) => setQuestionDetailTab(key as QuestionDetailTabKey)}
              extra={
                <div style={{
                  position: 'relative', // 添加相对定位
                  zIndex: 1, // 确保按钮在层级最上方
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 0, // 移除负边距
                  marginBottom: -50 // 移除负边距
                }}>
                  <Button
                      type="primary"
                      icon={<EditOutlined/>}
                      style={{
                        height: 32,
                        padding: '0 15px',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative', // 确保按钮在层级上方
                        zIndex: 2 // 更高的层级
                      }}
                      // onClick={reEdite}
                  >
                    前往编辑
                  </Button>
                </div>
              }
          >
            <Spin>
              {questionDetailTab === 'explanation' && renderExplanationDetail()}
              {questionDetailTab === 'grading' && renderGradingDetail()}
              {questionDetailTab === 'extract' && renderExtractDetail()}
            </Spin>
          </Card>
        </Col>
    )
  }

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
            <Col span={10}>
              <Card
                  title={selectedQuestion.questionId}
                  className="question-summary-card"
                  extra={
                    <div className="note-tags-container">
                      <Tag color="blue">{selectedQuestion.type}</Tag>
                    </div>
                  }
              >
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="笔记ID">{selectedQuestion.questionId}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{selectedQuestion.createTime}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{selectedQuestion.updateTime}</Descriptions.Item>
                </Descriptions>
                {selectedQuestion.imageName && (
                    <div className="image-preview">
                      <Image
                          src={`${UPLOADS_URL}/${selectedQuestion.imageName}`}
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
                          style={{
                            maxHeight: '500px',
                            width: '100%',
                            objectFit: 'contain'
                          }}
                      />
                    </div>
                )}

                <Divider orientation="left">资源状态</Divider>
                <div className="resource-status">
                  <Tag color={selectedQuestionDetail?.content ? 'green' : 'red'}>摘要</Tag>
                  <Tag color={selectedQuestion.hasKeywords ? 'green' : 'red'}>关键词</Tag>
                  <Tag color={selectedQuestion.hasExplanation ? 'green' : 'red'}>讲解</Tag>
                  <Tag color={selectedQuestion.hasAutoScoreReport ? 'green' : 'red'}>智能讲解</Tag>
                </div>
              </Card>
            </Col>
            {renderQuestionDetailCard()}
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
            // if (key !== 'question-detail') {
            //   setSelectedQuestion(null);
            //   setQuestionDetail(null);
            // }
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
