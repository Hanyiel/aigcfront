// src/pages/questions/SaveQuestionPage.tsx
import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Select,
  Tag,
  List,
  Switch,
  Popconfirm,
  message
} from 'antd';
import {
  SaveOutlined,
  LinkOutlined,
  TagsOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import '../../styles/questions/SaveQuestionPage.css';

const { TextArea } = Input;
const { Option } = Select;

interface Question {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  linkedNotes: string[];
  subject: string;
  difficulty: number;
  isPublic: boolean;
}

interface Note {
  id: string;
  title: string;
}

const mockNotes: Note[] = [
  { id: '1', title: '二次函数解题技巧' },
  { id: '2', title: '电磁感应公式总结' }
];

const SaveQuestionPage = () => {
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [linkedNotes, setLinkedNotes] = useState<string[]>([]);

  const handleSave = (values: any) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      ...values,
      keywords,
      linkedNotes
    };

    setQuestions([...questions, newQuestion]);
    form.resetFields();
    setKeywords([]);
    setLinkedNotes([]);
    message.success('题目保存成功');
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    message.success('题目已删除');
  };

  return (
    <Row gutter={24} className="question-container">
      {/* 左侧编辑区 */}
      <Col xs={24} md={16} className="edit-panel">
        <Card
          title={selectedQuestion ? "编辑题目" : "新建题目"}
          extra={
            <Button
              type="link"
              onClick={() => {
                form.resetFields();
                setSelectedQuestion(null);
              }}
            >
              新建
            </Button>
          }
        >
          <Form form={form} onFinish={handleSave} layout="vertical">
            <Form.Item
              name="title"
              label="题目名称"
              rules={[{ required: true }]}
            >
              <Input placeholder="请输入题目名称" />
            </Form.Item>

            <Form.Item
              name="content"
              label="题目内容"
              rules={[{ required: true }]}
            >
              <TextArea
                rows={6}
                placeholder="输入题目内容（支持Markdown语法）"
              />
            </Form.Item>

            <Form.Item label="关键词管理">
              <Select
                mode="tags"
                placeholder="添加/选择关键词"
                value={keywords}
                onChange={setKeywords}
                dropdownRender={menu => (
                  <>
                    {menu}
                    <div className="keyword-actions">
                      <Button type="link">从内容提取</Button>
                      <Button type="link">历史关键词</Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>

            <Form.Item label="关联笔记">
              {/*<NoteSelector*/}
              {/*  notes={mockNotes}*/}
              {/*  value={linkedNotes}*/}
              {/*  onChange={setLinkedNotes}*/}
              {/*/>*/}
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="subject"
                  label="学科分类"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="选择学科">
                    <Option value="math">数学</Option>
                    <Option value="physics">物理</Option>
                    <Option value="chemistry">化学</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="difficulty"
                  label="难度等级"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="选择难度">
                    <Option value={1}>⭐ 简单</Option>
                    <Option value={2}>⭐⭐ 中等</Option>
                    <Option value={3}>⭐⭐⭐ 困难</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="isPublic"
              label="公开状态"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="公开"
                unCheckedChildren="私有"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              block
            >
              保存题目
            </Button>
          </Form>
        </Card>
      </Col>

      {/* 右侧列表区 */}
      <Col xs={24} md={8} className="list-panel">
        <Card title="已存题目列表">
          <List
            dataSource={questions}
            renderItem={item => (
              <List.Item
                className={selectedQuestion === item.id ? 'selected' : ''}
                actions={[
                  <Popconfirm
                    title="确认删除？"
                    onConfirm={() => handleDelete(item.id)}
                  >
                    <DeleteOutlined />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div onClick={() => {
                      form.setFieldsValue(item);
                      setKeywords(item.keywords);
                      setLinkedNotes(item.linkedNotes);
                      setSelectedQuestion(item.id);
                    }}>
                      {item.title}
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {item.subject}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="meta-info">
                      <div className="tags">
                        {item.keywords.slice(0, 3).map(kw => (
                          <Tag key={kw} icon={<TagsOutlined />}>{kw}</Tag>
                        ))}
                      </div>
                      <div className="links">
                        <LinkOutlined />
                        {item.linkedNotes.length} 个关联笔记
                      </div>
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

export default SaveQuestionPage;
