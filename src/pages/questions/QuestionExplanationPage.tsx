// src/pages/questions/QuestionExplanationPage.tsx
import { useState, useEffect } from 'react';
import {Row, Col, Card, List, Tag, Steps, Collapse, Alert, Typography, Spin, Empty} from 'antd';
import { CodeOutlined, SolutionOutlined, BulbOutlined } from '@ant-design/icons';
import '../../styles/questions/QuestionExplanationPage.css';

const { Step } = Steps;
const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

// 题目讲解数据结构
interface ExplanationStep {
  title: string;
  content: string;
  code?: string;
}

interface QuestionDetail {
  id: number;
  title: string;
  subject: 'math' | 'physics';
  difficulty: number;
  content: string;
  steps: ExplanationStep[];
  knowledgePoints: string[];
  answer: string;
}

// 模拟题目数据
const mockQuestions: QuestionDetail[] = [
  {
    id: 1,
    title: '二次函数综合题',
    subject: 'math',
    difficulty: 4,
    content: `已知二次函数 $y = ax^2 + bx + c$ 的图像经过点 (1, 3)，(2, 2)，且在 x=3 时取得最小值 -1，求该二次函数的解析式。`,
    steps: [
      {
        title: '建立方程',
        content: '根据已知条件建立方程组：',
        code: `1. a(1)^2 + b(1) + c = 3
2. a(2)^2 + b(2) + c = 2
3. 顶点公式：x = -b/(2a) = 3`
      },
      {
        title: '求解参数',
        content: '解三元一次方程组得到：',
        code: 'a = 1\nb = -6\nc = 8'
      },
      {
        title: '验证结果',
        content: '将参数代入顶点公式验证：',
        code: 'y = x² -6x +8\n顶点值 y(3) = 9 -18 +8 = -1'
      }
    ],
    knowledgePoints: ['二次函数一般式', '顶点坐标公式', '方程组求解'],
    answer: 'y = x² -6x +8'
  },
  {
    id: 2,
    title: '电磁感应定律应用',
    subject: 'physics',
    difficulty: 3,
    content: '长度为L的导体棒在磁感应强度为B的匀强磁场中做切割磁感线运动，速度大小为v，求导体棒两端的感应电动势。',
    steps: [
      {
        title: '确定公式',
        content: '应用法拉第电磁感应定律：',
        code: 'ε = B·L·v·sinθ'
      },
      {
        title: '分析角度',
        content: '当导体棒垂直切割磁感线时：',
        code: 'θ = 90° → sinθ = 1'
      },
      {
        title: '计算结果',
        content: '代入已知条件得到：',
        code: 'ε = B·L·v'
      }
    ],
    knowledgePoints: ['法拉第定律', '右手定则', '矢量分解'],
    answer: 'ε = BLv'
  }
];

const QuestionExplanationPage = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [detail, setDetail] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取题目详情
  const fetchQuestionDetail = (id: number) => {
    setLoading(true);
    setTimeout(() => {
      const data = mockQuestions.find(q => q.id === id) || null;
      setDetail(data);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchQuestionDetail(selectedQuestion);
  }, [selectedQuestion]);

  return (
    <Row gutter={24} className="question-container">
      {/* 左侧讲解区 */}
      <Col xs={24} md={16} className="explanation-panel">
        <Card
          title={<><SolutionOutlined /> 题目深度解析</>}
          extra={<Tag icon={<CodeOutlined />}>解题引擎 v1.2</Tag>}
        >
          <Spin spinning={loading} tip="正在加载解析...">
            {detail ? (
              <div className="explanation-content">
                {/* 题目标题区 */}
                <div className="question-header">
                  <Title level={3}>{detail.title}</Title>
                  <div className="meta-info">
                    <Tag color={detail.subject === 'math' ? 'blue' : 'purple'}>
                      {detail.subject === 'math' ? '数学' : '物理'}
                    </Tag>
                    <Tag color="gold">难度：{detail.difficulty}/5</Tag>
                  </div>
                </div>

                {/* 题目内容 */}
                <Alert
                  message="题目内容"
                  description={<Paragraph className="question-text">{detail.content}</Paragraph>}
                  type="info"
                  showIcon
                />

                {/* 解题步骤 */}
                <Collapse defaultActiveKey={['0']} ghost className="steps-collapse">
                  {detail.steps.map((step, index) => (
                    <Panel
                      key={index}
                      header={<><BulbOutlined /> 步骤 {index + 1}：{step.title}</>}
                    >
                      <Paragraph>{step.content}</Paragraph>
                      {step.code && (
                        <pre className="code-block">
                          <code>{step.code}</code>
                        </pre>
                      )}
                    </Panel>
                  ))}
                </Collapse>

                {/* 最终答案 */}
                <Alert
                  message="最终答案"
                  description={<Text strong className="final-answer">{detail.answer}</Text>}
                  type="success"
                  showIcon
                />

                {/* 关联知识点 */}
                <div className="knowledge-points">
                  <Title level={5}>相关知识点：</Title>
                  {detail.knowledgePoints.map(kp => (
                    <Tag key={kp} color="processing">{kp}</Tag>
                  ))}
                </div>
              </div>
            ) : (
              <Empty description="暂无题目数据" />
            )}
          </Spin>
        </Card>
      </Col>

      {/* 右侧题目列表 */}
      <Col xs={24} md={8} className="question-list-panel">
        <Card title="题目列表" bordered={false}>
          <List
            itemLayout="horizontal"
            dataSource={mockQuestions}
            renderItem={(item) => (
              <List.Item
                onClick={() => setSelectedQuestion(item.id)}
                className={`list-item ${selectedQuestion === item.id ? 'selected' : ''}`}
              >
                <List.Item.Meta
                  title={<span className="question-title">{item.title}</span>}
                  description={
                    <>
                      <Tag color={item.subject === 'math' ? 'blue' : 'purple'}>
                        {item.subject === 'math' ? '数学' : '物理'}
                      </Tag>
                      <Tag color="gold">难度 {item.difficulty}</Tag>
                    </>
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

export default QuestionExplanationPage;
