// src/pages/notes/RelatedNotesPage.tsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Input, Tag, Empty, Spin, Typography } from 'antd';
import { SearchOutlined, FileTextOutlined, TagsOutlined } from '@ant-design/icons';
import '../../styles/questions/RelatedNotePage.css';

const { Text } = Typography;

// 笔记数据结构
interface StudyNote {
  id: number;
  questionId: number;
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: string;
  highlights: string[];
}

// 模拟数据
const mockNotes: StudyNote[] = [
  {
    id: 1,
    questionId: 1,
    title: '二次函数解题技巧',
    content: `在解二次函数问题时，需要注意顶点坐标公式的应用：$x = -\\frac{b}{2a}$...`,
    tags: ['公式推导', '易错点'],
    author: '王老师',
    createdAt: '2023-03-15',
    highlights: ['顶点坐标', '方程组']
  },
  {
    id: 2,
    questionId: 1,
    title: '我的错题总结',
    content: '容易忽略题目中隐藏的顶点信息，需要特别注意题目中的极值条件...',
    tags: ['错题分析'],
    author: '学生A',
    createdAt: '2023-04-01',
    highlights: ['极值条件']
  },
  {
    id: 3,
    questionId: 2,
    title: '电磁感应公式速记',
    content: '切割磁感线时的三要素：B、L、v方向需互相垂直...',
    tags: ['公式记忆'],
    author: '李老师',
    createdAt: '2023-03-20',
    highlights: ['B-L-v']
  }
];

const RelatedNotesPage = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(false);

  // 过滤笔记
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const filtered = mockNotes.filter(note =>
        note.questionId === selectedQuestion &&
        (note.title.toLowerCase().includes(searchText.toLowerCase()) ||
         note.content.includes(searchText) ||
         note.tags.some(tag => tag.includes(searchText)))
      );
      setFilteredNotes(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, selectedQuestion]);

  return (
    <Row gutter={24} className="note-container">
      {/* 左侧笔记区 */}
      <Col xs={24} md={16} className="note-panel">
        <Card
          title={<><FileTextOutlined /> 关联学习笔记</>}
          extra={
            <Input
              placeholder="搜索笔记内容..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
          }
        >
          <Spin spinning={loading} tip="正在搜索笔记...">
            {filteredNotes.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={filteredNotes}
                renderItem={note => (
                  <List.Item className="note-item">
                    {/* 笔记标题区 */}
                    <div className="note-header">
                      <Text strong style={{ fontSize: 16 }}>{note.title}</Text>
                      <div className="meta-info">
                        <Tag icon={<TagsOutlined />} color="processing">
                          {note.tags.join(' / ')}
                        </Tag>
                        <Text type="secondary">{note.author} · {note.createdAt}</Text>
                      </div>
                    </div>

                    {/* 内容预览 */}
                    <div className="note-content">
                      {note.highlights.map((hl, index) => (
                        <Tag key={index} color="gold" className="highlight-tag">
                          {hl}
                        </Tag>
                      ))}
                      <Text line-clamp={{ rows: 2 }} style={{ color: '#666' }}>
                        {note.content}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="未找到相关笔记" />
            )}
          </Spin>
        </Card>
      </Col>

      {/* 右侧题目列表（复用原有结构） */}
      <Col xs={24} md={8} className="question-list-panel">
        <Card title="题目列表" bordered={false}>
          <List
            itemLayout="horizontal"
            dataSource={mockNotes}
            renderItem={(item) => (
              <List.Item
                onClick={() => setSelectedQuestion(item.id)}
                className={`list-item ${selectedQuestion === item.id ? 'selected' : ''}`}
              >
                <List.Item.Meta
                  title={<span className="question-title">{item.title}</span>}
                  description={
                    <>

                      <Tag color="gold">tag {item.tags[0]}</Tag>
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

export default RelatedNotesPage;
