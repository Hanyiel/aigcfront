// src/pages/grading/AutoGradePage.tsx
import { useState, useEffect } from 'react';
import {Row, Col, Card, List, Tag, Progress, Collapse, Typography, Spin, Alert, Empty} from 'antd';
import { CheckCircleFilled, CloseCircleFilled, WarningFilled } from '@ant-design/icons';
import '../../styles/questions/AutoGradePage.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// 数据结构
interface GradingResult {
  questionId: number;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  errorAnalysis: string[];
  knowledgePoints: string[];
}

// 模拟数据
const mockResults: GradingResult[] = [
  {
    questionId: 1,
    studentAnswer: "函数f(x)=x²在x=2处的导数为4",
    correctAnswer: "f'(2) = 4",
    isCorrect: true,
    score: 5,
    feedback: "解题步骤完整，推导正确",
    errorAnalysis: [],
    knowledgePoints: ['导数计算', '幂函数']
  },
  {
    questionId: 2,
    studentAnswer: "sin(π/3) = 1/2",
    correctAnswer: "sin(π/3) = √3/2",
    isCorrect: false,
    score: 0,
    feedback: "常见三角函数值记忆错误",
    errorAnalysis: ['三角函数记忆错误', '角度转换不熟练'],
    knowledgePoints: ['三角函数', '特殊角']
  }
];

const AutoGradePage = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [loading, setLoading] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  // 计算总分
  useEffect(() => {
    const total = mockResults.reduce((sum, item) => sum + item.score, 0);
    setOverallScore(total);
  }, []);

  const currentResult = mockResults.find(r => r.questionId === selectedQuestion);

  return (
    <Row gutter={24} className="grade-container">
      {/* 左侧批改详情 */}
      <Col xs={24} md={16} className="grading-panel">
        <Card
          title="智能批改报告"
          extra={
            <div className="score-summary">
              <Text strong>当前得分：</Text>
              <Progress
                type="circle"
                percent={(overallScore / 10) * 100}
                width={60}
                format={() => `${overallScore}/10`}
              />
            </div>
          }
        >
          <Spin spinning={loading} tip="正在分析答案...">
            {currentResult ? (
              <div className="grading-detail">
                {/* 正确状态标识 */}
                <div className={`status-header ${currentResult.isCorrect ? 'correct' : 'wrong'}`}>
                  {currentResult.isCorrect ? (
                    <CheckCircleFilled className="status-icon" />
                  ) : (
                    <CloseCircleFilled className="status-icon" />
                  )}
                  <Title level={4} className="status-text">
                    {currentResult.isCorrect ? '答案正确' : '存在错误'}
                  </Title>
                </div>

                {/* 答案对比 */}
                <Collapse defaultActiveKey={['1']} ghost>
                  <Panel header="答案对比分析" key="1">
                    <div className="answer-compare">
                      <div className="answer-block student">
                        <Tag color="blue">你的答案</Tag>
                        <pre>{currentResult.studentAnswer}</pre>
                      </div>
                      <div className="answer-block correct">
                        <Tag color="green">参考答案</Tag>
                        <pre>{currentResult.correctAnswer}</pre>
                      </div>
                    </div>
                  </Panel>
                </Collapse>

                {/* 错因分析 */}
                {!currentResult.isCorrect && (
                  <Alert
                    type="error"
                    message={
                      <div className="error-analysis">
                        <Title level={5}><WarningFilled /> 错误原因</Title>
                        <ul>
                          {currentResult.errorAnalysis.map((err, index) => (
                            <li key={index}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    }
                    showIcon
                    closable
                  />
                )}

                {/* 知识点关联 */}
                <div className="knowledge-points">
                  <Title level={5}>📚 涉及知识点</Title>
                  <div className="tags">
                    {currentResult.knowledgePoints.map((kp, index) => (
                      <Tag key={index} color="purple">{kp}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="请选择题目查看批改详情" />
            )}
          </Spin>
        </Card>
      </Col>

      {/* 右侧题目列表 */}
      <Col xs={24} md={8} className="question-list-panel">
        <Card title="题目列表" bordered={false}>
          <List
            itemLayout="horizontal"
            dataSource={mockResults}
            renderItem={(item) => (
              <List.Item
                onClick={() => setSelectedQuestion(item.questionId)}
                className={`list-item ${selectedQuestion === item.questionId ? 'selected' : ''}`}
              >
                <List.Item.Meta
                  title={
                    <div className="question-meta">
                      <span className="question-title">第 {item.questionId} 题</span>
                      <Tag color={item.isCorrect ? "green" : "red"}>
                        {item.score}分
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="status-tags">
                      {item.isCorrect ? (
                        <Tag icon={<CheckCircleFilled />} color="success">
                          正确
                        </Tag>
                      ) : (
                        <Tag icon={<CloseCircleFilled />} color="error">
                          错误
                        </Tag>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default AutoGradePage;
