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
  EditOutlined, ReloadOutlined
} from '@ant-design/icons';
import '../../styles/userCenter/QuestionsMangementPage.css';
import { useNavigate } from "react-router-dom";
import { UserQuestionContext } from '../../contexts/userCenter/UserQuestionContext';
import { logout } from "../../services/auth";
import { Question, QuestionDetail } from "../../contexts/userCenter/UserQuestionContext"
import { QuestionManagementContext, CountContext} from "./UserCenter";
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
type QuestionDetailTabKey = 'extract' | 'explanation' | 'related-notes' | 'auto-score-report';

const QuestionsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [questionsSubTab, setQuestionsSubTab] = useState<QuestionsSubTabKey>('all-questions');
  const [questionDetailTab, setQuestionDetailTab] = useState<QuestionDetailTabKey>('extract');

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

  const countContext = useContext(CountContext);
  const {
    keywords_count,
    setKeywords_count
  }=countContext

  const [searchForm] = Form.useForm();
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
  const reEdit = () => {
    if (selectedQuestion && selectedQuestionDetail && imageFile) {
      questionContext.prepareQuestionRegenerate(selectedQuestion, selectedQuestionDetail, imageFile);
      navigate('/questions/index');
    } else {
      message.warning('无法重新编辑，请确保题目信息已加载完成');
    }
  };

  // 从题目列表中提取科目和题型数据
  const extractSubjectsAndTypesFromQuestions = (questions: Question[]) => {
    const subjects = new Set<string>();
    const types = new Set<string>();

    questions.forEach(question => {
      if (question.subject) subjects.add(question.subject);
      if (question.type) types.add(question.type);
    });

    return {
      subjects: Array.from(subjects),
      types: Array.from(types)
    };
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
        setQuestionSubjects(result.data.subject);
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
  const getAllQuestions = async (isWrongOnly: boolean = false) => {
    try {
      setLoading(prev => ({ ...prev, questions: true }));
      const token = localStorage.getItem('authToken');

      if(!keywords_count){
        //获取关键词数据
        const keywordsRes = await fetch(`http://localhost:8000/keywords_num`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!keywordsRes.ok) {
          message.error(`请求关键词数据失败: ${keywordsRes.statusText}`);
        }

        const keywords_result = await keywordsRes.json();
        setKeywords_count(keywords_result.keywords_num);
      }


      const formValues = searchForm.getFieldsValue();

      // 确保我们使用表单中的筛选条件
      const requestBody = {
        isWrong: isWrongOnly ? true : undefined,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        subject: formValues.subject || undefined,
        type: formValues.type || undefined,
        keyword: formValues.keyword || undefined
      };
      // 使用 Object.fromEntries 和 Object.entries 过滤掉空值
      const filteredRequestBody = Object.fromEntries(
          Object.entries(requestBody).filter(([_, value]) =>
              value !== undefined && value !== ''
          )
      );
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
        // 正确映射后端数据到 Question 接口
        const mappedQuestions = (result.data.questions || []).map((q: any) => ({
          questionId: q.questionId,
          type: q.type,
          subject: q.subject,
          isWrong: q.isWrong,
          hasExtract: !!q.content,
          hasKeywords: q.hasKeywords,
          hasExplanation: q.hasExplanation,
          hasAutoScoreReport: q.hasAutoScoreReport,
          hasRelatedItems: q.hasRelatedItems,
          imageName: q.imageName,
          createTime: q.createTime,
          updateTime: q.updateTime,
          content: q.content
        }));

        setQuestions(mappedQuestions);
        setPagination(prev => ({
          ...prev,
          total: result.data.total || 0
        }));

        // 从题目列表中提取科目和题型
        const { subjects, types } = extractSubjectsAndTypesFromQuestions(mappedQuestions);

        // 更新科目和题型状态
        if (subjects.length > 0) {
          // 将 Set 转换为数组，然后合并去重
          setQuestionSubjects(prev => {
            const combined = [...prev, ...subjects];
            return Array.from(new Set(combined));
          });
        }

        if (types.length > 0) {
          // 将 Set 转换为数组，然后合并去重
          setQuestionTypes(prev => {
            const combined = [...prev, ...types];
            return Array.from(new Set(combined));
          });
        }

      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取题目失败');
    } finally {
      setLoading(prev => ({ ...prev, questions: false }));
    }
  };

  // 获取题目详情
  const fetchQuestionDetails = async (questionId: string) => {
    if (!questionId) {
      message.warning("请选择题目");
      return;
    }

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
        const scoreResponse = await fetch(`${API_URL}/questions/${questionId}/auto-score`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (scoreResponse.ok) {
          const scoreResult = await scoreResponse.json();
          autoScoreReport = scoreResult.data?.autoScoreReport || null;

          // 确保数组字段是数组类型
          if (autoScoreReport) {
            autoScoreReport.correct_answer = Array.isArray(autoScoreReport.correct_answer)
                ? autoScoreReport.correct_answer
                : [autoScoreReport.correct_answer || ''];

            autoScoreReport.your_answer = Array.isArray(autoScoreReport.your_answer)
                ? autoScoreReport.your_answer
                : [autoScoreReport.your_answer || ''];

            autoScoreReport.error_analysis = Array.isArray(autoScoreReport.error_analysis)
                ? autoScoreReport.error_analysis
                : [autoScoreReport.error_analysis || ''];

            autoScoreReport.knowledge_point = Array.isArray(autoScoreReport.knowledge_point)
                ? autoScoreReport.knowledge_point
                : [autoScoreReport.knowledge_point || ''];
          }
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

      // 获取关键词
      let keywordsData = null;
      try {
        const keywordsResponse = await fetch(`${API_URL}/questions/${questionId}/keywords`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (keywordsResponse.ok) {
          const keywordsResult = await keywordsResponse.json();
          keywordsData = keywordsResult.data?.keywords || null;
        }
      } catch (keywordsError) {
        console.warn('获取关键词失败:', keywordsError);
      }

      // 获取相关笔记
      let relatedItemsData = null;
      try {
        const relatedItemsResponse = await fetch(`${API_URL}/questions/${questionId}/related-items`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (relatedItemsResponse.ok) {
          const relatedItemsResult = await relatedItemsResponse.json();
          relatedItemsData = relatedItemsResult.data?.relatedItems || null;

          console.log("相关笔记获取", relatedItemsResult);
        }
      } catch (relatedItemsError) {
        console.warn('获取相关笔记失败:', relatedItemsError);
      }

      // 组合所有数据
      setSelectedQuestionDetail({
        questionId,
        title: basicData.title || '无标题',
        content: basicData.content || '无内容',
        explanation: explanationData,
        AutoScoreReport: autoScoreReport,
        keywords: keywordsData,
        relatedItems: relatedItemsData
      });

    } catch (error) {
      console.error('获取题目详情失败:', error);
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
    getAllQuestions(questionsSubTab === 'incorrect-questions');
  };

  const resetSearch = () => {
    searchForm.resetFields();
    getAllQuestions(questionsSubTab === 'incorrect-questions');
  };

  // 生成不同颜色的标签
  const getTagColor = (index: number) => {
    const colors = [
      'magenta', 'red', 'volcano', 'orange', 'gold',
      'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'
    ];
    return colors[index % colors.length];
  };

  // 渲染题目列表项
  const renderQuestionItem = (question: Question) => (
      <List.Item className="question-list-item">
        <div className="question-item-content">
          <div className="question-item-header">
            <div className="question-item-title">
              <QuestionCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              {question.content?.substring(0, 30) || '无标题'}
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
              <Tag color="geekblue">{question.subject}</Tag>
              <span className="question-date">{question.createTime?.split(' ')[0] || ''}</span>
            </div>
          </div>

          <div className="question-item-body">
            <div className="question-summary">
              {question.content?.substring(0, 100) || '无内容'}
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
              <Menu.Item danger>删除</Menu.Item>
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
              <Form form={searchForm} layout="inline" onFinish={() => getAllQuestions(false)}>
                {/*<Form.Item name="keyword" style={{ marginBottom: 16 }}>*/}
                {/*  <Input*/}
                {/*      placeholder="搜索题目内容..."*/}
                {/*      prefix={<SearchOutlined />}*/}
                {/*      style={{ width: 300, marginRight: 16 }}*/}
                {/*  />*/}
                {/*</Form.Item>*/}
                <Form.Item name="subject" style={{ marginBottom: 16 }}>
                  <Select placeholder="学科" style={{ width: 120, marginRight: 16 }}>
                    <Select.Option value="">全部</Select.Option>
                    {questionSubjects.map((subject) => (
                        <Select.Option key={subject} value={subject}>
                          {subject}
                        </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="type" style={{ marginBottom: 16 }}>
                  <Select placeholder="题型" style={{ width: 120, marginRight: 16 }}>
                    <Select.Option value="">全部</Select.Option>
                    {questionTypes.map((type) => (
                        <Select.Option key={type} value={type}>
                          {type}
                        </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                      type="primary"
                      htmlType="submit"
                      icon={questions.length > 0 ? <ReloadOutlined /> : <SearchOutlined />}
                  >
                    {questions.length > 0 ? '刷新' : '查询'}
                  </Button>
                  {/* 筛选按钮现在也使用表单提交 */}
                  <Button
                      icon={<FilterOutlined />}
                      onClick={() => getAllQuestions(false)}
                      style={{ marginLeft: 8 }}
                  >
                    筛选
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
                    description="暂无题目数据"
                    style={{ margin: '40px 0' }}
                >
                  <p>
                    请刷新或者新建问题
                  </p>
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
            <div className="notes-filter">
              <Form form={searchForm} layout="inline" onFinish={() => getAllQuestions(true)}>
                {/*<Form.Item name="keyword" style={{ marginBottom: 16 }}>*/}
                {/*  <Input*/}
                {/*      placeholder="搜索题目内容..."*/}
                {/*      prefix={<SearchOutlined />}*/}
                {/*      style={{ width: 300, marginRight: 16 }}*/}
                {/*  />*/}
                {/*</Form.Item>*/}
                <Form.Item name="subject" style={{ marginBottom: 16 }}>
                  <Select placeholder="学科" style={{ width: 120, marginRight: 16 }}>
                    <Select.Option value="">全部</Select.Option>
                    {questionSubjects.map((subject) => (
                        <Select.Option key={subject} value={subject}>
                          {subject}
                        </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="type" style={{ marginBottom: 16 }}>
                  <Select placeholder="题型" style={{ width: 120, marginRight: 16 }}>
                    <Select.Option value="">全部</Select.Option>
                    {questionTypes.map((type) => (
                        <Select.Option key={type} value={type}>
                          {type}
                        </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                      type="primary"
                      htmlType="submit"
                      icon={questions.length > 0 ? <ReloadOutlined /> : <SearchOutlined />}
                  >
                    {questions.length > 0 ? '刷新' : '查询'}
                  </Button>
                  <Button
                      icon={<FilterOutlined />}
                      onClick={() => getAllQuestions(true)}
                      style={{ marginLeft: 8 }}
                  >
                    筛选
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
                  <p>
                    请刷新或者新建问题
                  </p>
                </Empty>
            )}
          </div>
        </Spin>
    );
  };
  // 摘要页面
  const renderExtractDetail = () => {
    return (
        <div className="question-management-detail-content">
          <div className="question-management-detail-header">
            题目摘要
          </div>
          <div className={"question-detail-scroll-container"}>
            <div className="explanation-text">
              <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
              >
                {selectedQuestionDetail?.content || '暂无内容'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
    )
  }

  // 讲解页面
  const renderExplanationDetail = () => {
    if (!selectedQuestionDetail) return null;

    return (
        <div className="question-management-detail-content">
          <div className="question-management-detail-header">
            题目讲解
          </div>
          <div className={"question-detail-scroll-container"}>
            <div className="explanation-scroll-container">
              <div className="explanation-text">
                {selectedQuestionDetail.explanation ? (
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                      {selectedQuestionDetail.explanation}
                    </ReactMarkdown>
                ) : (
                    <Empty description="暂无讲解内容"/>
                )}
              </div>
            </div>
          </div>
        </div>
    );
  };

  // 自动批改结果页面
  const renderGradingDetail = () => {
    if (!selectedQuestionDetail?.AutoScoreReport) return (
        <div className="question-management-detail-content">
          <div className="question-management-detail-header">
            批改结果
          </div>
          <Empty description="暂无批改结果" />
        </div>
    );

    const report = selectedQuestionDetail.AutoScoreReport;

    // 确保所有字段都是数组类型
    const correctAnswer = Array.isArray(report.correct_answer)
        ? report.correct_answer
        : [report.correct_answer || ''];

    const yourAnswer = Array.isArray(report.your_answer)
        ? report.your_answer
        : [report.your_answer || ''];

    const errorAnalysis = Array.isArray(report.error_analysis)
        ? report.error_analysis
        : [report.error_analysis || ''];

    const knowledgePoints = Array.isArray(report.knowledge_point)
        ? report.knowledge_point
        : [report.knowledge_point || ''];

    return (
        <div className="question-management-detail-content">
          <div className="question-management-detail-header">
            批改结果
          </div>
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

            <div className="answers-section">
              <h4>答案对比</h4>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="标准答案">
                  {correctAnswer.join('; ') || '无'}
                </Descriptions.Item>
                <Descriptions.Item label="你的答案">
                  {yourAnswer.join('; ') || '无'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {errorAnalysis.length > 0 && errorAnalysis[0] && (
                <div className="mistakes-section">
                  <h4>错误分析</h4>
                  <List
                      size="small"
                      dataSource={errorAnalysis}
                      renderItem={(mistake, index) => (
                          <List.Item>
                            <Text>{index + 1}. {mistake}</Text>
                          </List.Item>
                      )}
                  />
                </div>
            )}

            {knowledgePoints.length > 0 && knowledgePoints[0] && (
                <div className="knowledge-points-section">
                  <h4>涉及知识点</h4>
                  <div className="knowledge-points">
                    {knowledgePoints.map((point, index) => (
                        <Tag key={index} color="blue">{point}</Tag>
                    ))}
                  </div>
                </div>
            )}
          </div>
        </div>
    );
  };

  // 相关笔记页面
  const renderRelatedNotesDetail = () => {
    if (!selectedQuestionDetail?.relatedItems) {
      return (
          <div className="question-management-detail-content">
            <div className="question-management-detail-header">
              相关笔记
            </div>
            <Empty description="暂无相关笔记" />
          </div>
      );
    }

    const { related_notes, related_questions } = selectedQuestionDetail.relatedItems;

    return (
        <div className="question-management-detail-content">
          <div className="question-management-detail-header">
            相关笔记
          </div>
          <div className="question-detail-scroll-container">
            <div className="related-notes-container">
              <h3>相关笔记</h3>
              {related_notes && related_notes.length > 0 ? (
                  <List
                      itemLayout="horizontal"
                      dataSource={related_notes}
                      renderItem={note => (
                          <List.Item>
                            <List.Item.Meta
                                title={<a>{note.title}</a>}
                                description={
                                  <div>
                                    <div>{note.content.substring(0, 100)}...</div>
                                    <div>相似度: {(note.similarity * 100).toFixed(2)}%</div>
                                  </div>
                                }
                            />
                          </List.Item>
                      )}
                  />
              ) : (
                  <Empty description="暂无相关笔记" />
              )}

              {/*<h3>相关题目</h3>*/}
              {/*{related_questions && related_questions.length > 0 ? (*/}
              {/*    <List*/}
              {/*        itemLayout="horizontal"*/}
              {/*        dataSource={related_questions}*/}
              {/*        renderItem={question => (*/}
              {/*            <List.Item>*/}
              {/*              <List.Item.Meta*/}
              {/*                  title={<a>题目 {question.question_id}</a>}*/}
              {/*                  description={*/}
              {/*                    <div>*/}
              {/*                      <div>{question.content.substring(0, 100)}...</div>*/}
              {/*                      <div>相似度: {(question.similarity * 100).toFixed(2)}%</div>*/}
              {/*                    </div>*/}
              {/*                  }*/}
              {/*              />*/}
              {/*            </List.Item>*/}
              {/*        )}*/}
              {/*    />*/}
              {/*) : (*/}
              {/*    <Empty description="暂无相关题目" />*/}
              {/*)}*/}
            </div>
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
                { key: 'extract', tab: '摘要内容'},
                { key: 'explanation', tab: '智能讲解' },
                { key: 'auto-score-report', tab: '批改结果' },
                { key: 'related-notes', tab: '相关笔记' },
              ]}
              activeTabKey={questionDetailTab}
              onTabChange={(key) => setQuestionDetailTab(key as QuestionDetailTabKey)}
              extra={
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 0,
                  marginBottom: -50
                }}>
                  <Button
                      type="primary"
                      icon={<EditOutlined/>}
                      style={{
                        height: 32,
                        padding: '0 15px',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 2
                      }}
                      onClick={reEdit}
                  >
                    前往编辑
                  </Button>
                </div>
              }
          >
            <Spin spinning={loading.detail}>
              {questionDetailTab === 'extract' && renderExtractDetail()}
              {questionDetailTab === 'explanation' && renderExplanationDetail()}
              {questionDetailTab === 'auto-score-report' && renderGradingDetail()}
              {questionDetailTab === 'related-notes' && renderRelatedNotesDetail()}
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
          <Row gutter={24}>
            <Col span={8}>
              <Card
                  title={selectedQuestion.questionId}
                  className="question-summary-card"
                  extra={
                    <div className="note-tags-container">
                      <Tag color="blue">{selectedQuestion.type}</Tag>
                      <Tag color="geekblue">{selectedQuestion.subject}</Tag>
                    </div>
                  }
              >
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="题目ID">{selectedQuestion.questionId}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{selectedQuestion.createTime}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{selectedQuestion.updateTime}</Descriptions.Item>
                </Descriptions>
                {selectedQuestion.imageName && (
                    <div className="image-preview">
                      <Image
                          src={`${UPLOADS_URL}/${selectedQuestion.imageName}`}
                          alt="题目原图"
                          placeholder={
                            <div style={{
                              background: '#f5f5f5',
                              height: 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <span>加载题目原图...</span>
                            </div>
                          }
                          style={{
                            maxHeight: '340px',
                            width: '100%',
                            objectFit: 'contain'
                          }}
                      />
                    </div>
                )}

                <Divider orientation="left">资源状态</Divider>
                <div className="resource-status">
                  <Tag color={selectedQuestion.hasExtract ? 'green' : 'red'}>摘要</Tag>
                  <Tag color={selectedQuestion.hasKeywords ? 'green' : 'red'}>关键词</Tag>
                  <Tag color={selectedQuestion.hasExplanation ? 'green' : 'red'}>讲解</Tag>
                  <Tag color={selectedQuestion.hasAutoScoreReport ? 'green' : 'red'}>批改报告</Tag>
                  <Tag color={selectedQuestion.hasRelatedItems ? 'green' : 'red'}>相关笔记</Tag>
                </div>

                <Divider orientation="left">关键词</Divider>
                <div className="management-keywords-container">
                  {selectedQuestionDetail?.keywords && selectedQuestionDetail.keywords.length > 0 ? (
                      <div className="management-keywords-list">
                        {selectedQuestionDetail.keywords.map((keyword, index) => (
                            <Tag
                                key={index}
                                color={getTagColor(index)}
                                className="keyword-tag"
                            >
                              {keyword.term}
                            </Tag>
                        ))}
                      </div>
                  ) : (
                      <div className="no-keywords">暂无关键词</div>
                  )}
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
            if (key !== 'question-detail') {
              setSelectedQuestion(null);
              setSelectedQuestionDetail(null);
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
