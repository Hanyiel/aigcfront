// src/pages/questions/QuestionKeywordsPage.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Tag, Spin, Empty, Alert } from 'antd';
import { PieChartOutlined, RocketOutlined, LinkOutlined } from '@ant-design/icons';
import '../../styles/questions/QuestionKeywordsPage.css';

interface Keyword {
  name: string;
  weight: number;
  relation: string;
}

// 模拟知识点数据
const mockKeywords = {
  math: [
    { name: '二次函数', weight: 9, relation: '核心概念' },
    { name: '抛物线', weight: 7, relation: '图像特征' },
    { name: '顶点坐标', weight: 8, relation: '关键参数' },
    { name: '对称轴', weight: 6, relation: '图像特征' }
  ],
  physics: [
    { name: '电磁感应', weight: 9, relation: '核心定律' },
    { name: '法拉第定律', weight: 8, relation: '计算公式' },
    { name: '楞次定律', weight: 7, relation: '判断方法' }
  ]
};

const QuestionKeywordsPage = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟题目列表数据
  const questions = [
    {
      id: 1,
      title: '二次函数综合题',
      subject: 'math',
      status: '已解析',
      date: '2024-03-15'
    },
    {
      id: 2,
      title: '电磁感应定律应用',
      subject: 'physics',
      status: '已解析',
      date: '2024-03-14'
    }
  ];

  // 获取关键词数据
  const fetchKeywords = (questionId: string) => {
    return false;
    // setLoading(true);
    // setTimeout(() => {
    //   const subject = questions.find(q => q.id === questionId).subject;
    //   setKeywords(mockKeywords[subject]);
    //   setLoading(false);
    // }, 800);
  };
  //
  // useEffect(() => {
  //   fetchKeywords(selectedQuestion);
  // }, [selectedQuestion]);

  return (
      <Row gutter={24} className="keywords-container">
        {/* 左侧关键词展示区 */}
        <Col xs={24} md={16} className="keywords-panel">
          <Card
              title={<><RocketOutlined /> 知识点图谱分析</>}
              extra={<Tag icon={<LinkOutlined />}>知识点关联系统 v2.1</Tag>}
          >
            <Spin spinning={loading} tip="正在生成知识图谱...">
              {keywords.length > 0 ? (
                  <div className="keywords-visualization">
                    <div className="main-concept">
                      <Tag icon={<PieChartOutlined />} className="core-tag">
                        {keywords[0].name}
                      </Tag>
                      <div className="relation-lines" />
                    </div>

                    <div className="related-concepts">
                      {keywords.slice(1).map((kw, index) => (
                          <div
                              key={kw.name}
                              className={`concept-node depth-${index % 3}`}
                              data-relation={kw.relation}
                          >
                            <Tag
                                className="kw-tag"
                                color={index % 2 ? 'processing' : 'success'}
                            >
                              {kw.name}
                              <span className="weight-badge">{kw.weight}</span>
                            </Tag>
                          </div>
                      ))}
                    </div>

                    <Alert
                        message="知识图谱说明"
                        description={
                          <ul className="legend-list">
                            <li><Tag color="processing">蓝色标签</Tag>代表计算方法类知识点</li>
                            <li><Tag color="success">绿色标签</Tag>代表概念定义类知识点</li>
                            <li>数字表示知识点重要程度 (1-10分)</li>
                          </ul>
                        }
                        type="info"
                        showIcon
                    />
                  </div>
              ) : (
                  <Empty description="暂无知识点数据" />
              )}
            </Spin>
          </Card>
        </Col>

        {/* 右侧题目列表 */}
        <Col xs={24} md={8} className="question-list-panel">
          <Card title="题目列表" bordered={false}>
            <List
                itemLayout="horizontal"
                dataSource={questions}
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
                              <span className="date">{item.date}</span>
                            </>
                          }
                      />
                      <Tag color={item.status === '已解析' ? 'green' : 'orange'}>
                        {item.status}
                      </Tag>
                    </List.Item>
                )}
            />
          </Card>
        </Col>
      </Row>
  );
};

export default QuestionKeywordsPage;
