// src/pages/questions/RelatedNotePage.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  List,
  Tag,
  Upload,
  Button,
  Image,
  Spin,
  Typography,
  Collapse,
  Empty, message
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { useQuestionImageContext } from '../../contexts/QuestionImageContext';
import { useRelatedNote } from '../../contexts/RelatedNoteContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/questions/RelatedNotePage.css';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const RelatedNotePage = () => {
  const navigate = useNavigate();
  const {
    images,
    addImage,
    removeImage,
    selectedImage,
    setSelectedImage,
    getImageFile
  } = useQuestionImageContext();
  const {
    relatedData,
    loading,
    fetchRelatedData
  } = useRelatedNote();
  const { isAuthenticated } = useAuth();
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('仅支持图片文件');
      return false;
    }
    addImage(file);
    return false;
  };

  const handleSearchRelated = async () => {
    if (!selectedImage) {
      message.warning('请先选择图片');
      return;
    }
    const file = getImageFile(selectedImage.id);
    if (file) {
      await fetchRelatedData(file);
    }
  };

  return (
      <Row gutter={24} className="related-container">
        {/* 左侧关联内容区域 */}
        <Col xs={24} md={14} lg={16}>
          <Card
              title="关联学习资源"
              extra={
                <Button
                    type="primary"
                    onClick={handleSearchRelated}
                    loading={loading}
                    disabled={!selectedImage}
                >
                  查询关联内容
                </Button>
              }
          >
            <Spin spinning={loading} tip="正在查找关联内容...">
              {relatedData ? (
                  <div className="related-content">
                    {/* 知识点图谱 */}
                    <div className="knowledge-graph">
                      <Title level={4}><LinkOutlined /> 知识图谱关联</Title>
                      <div className="tags">
                        {relatedData.knowledge_graph.map((kg, index) => (
                            <Tag key={index} color="geekblue">{kg}</Tag>
                        ))}
                      </div>
                    </div>

                    {/* 相关笔记 */}
                    <Collapse defaultActiveKey={['notes']} ghost>
                      <Panel header={<><FileTextOutlined /> 关联笔记（{relatedData.related_notes.length}）</>} key="notes">
                        <List
                            itemLayout="vertical"
                            dataSource={relatedData.related_notes}
                            renderItem={note => (
                                <List.Item className="note-item">
                                  <div className="note-header">
                                    <Tag color="blue">{note.subject}</Tag>
                                    <Title level={5}>{note.title}</Title>
                                    {/*<Text type="secondary">相似度：{(note.similarity * 100).toFixed(1)}%</Text>*/}
                                  </div>
                                  <Text className="note-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                      {note.content}
                                    </ReactMarkdown>
                                  </Text>
                                  <div className="note-points">
                                    {note.point.map((p, i) => (
                                        <Tag key={i} color="cyan">{p}</Tag>
                                    ))}
                                  </div>
                                </List.Item>
                            )}
                        />
                      </Panel>
                    </Collapse>

                    {/* 相关问题 */}
                    <Collapse defaultActiveKey={['questions']} ghost>
                      <Panel header={<><QuestionCircleOutlined /> 关联问题（{relatedData.related_questions.length}）</>} key="questions">
                        <List
                            dataSource={relatedData.related_questions}
                            renderItem={question => (
                                <List.Item className="question-item">
                                  <div className="question-header">
                                    <Tag color="orange">{question.subject_id}</Tag>
                                    <Text strong>{question.content}</Text>
                                    {/*<Text type="secondary">相似度：{(question.similarity * 100).toFixed(1)}%</Text>*/}
                                  </div>
                                  <div className="question-answer">
                                    <Text type="secondary">参考答案：</Text>
                                    <Text>
                                      <ReactMarkdown
                                          remarkPlugins={[remarkMath]}
                                          rehypePlugins={[rehypeKatex]}
                                      >
                                        {question.answer}
                                      </ReactMarkdown>
                                    </Text>
                                  </div>
                                </List.Item>
                            )}
                        />
                      </Panel>
                    </Collapse>
                  </div>
              ) : (
                  <Empty description="选择图片后查询关联内容" />
              )}
            </Spin>
          </Card>
        </Col>

        {/* 右侧图片列表 */}
        <Col xs={24} md={10} lg={8}>
          <Card
              title="图片列表"
              className="image-list-card"
              extra={
                <Upload
                    beforeUpload={handleUpload}
                    showUploadList={false}
                    accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>添加图片</Button>
                </Upload>
              }
          >
            <List
                dataSource={images}
                renderItem={(item) => (
                    <List.Item
                        className={`list-item ${selectedImage?.id === item.id ? 'selected' : ''}`}
                        onClick={() => setSelectedImage(item)}
                        extra={
                          <Button
                              type="link"
                              danger
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(item.id);
                              }}
                          >
                            删除
                          </Button>
                        }
                    >
                      <div className="image-content">
                        <Image
                            src={item.url}
                            alt={item.name}
                            preview={false}
                            width={80}
                            height={60}
                            className="thumbnail"
                        />
                        <div className="image-info">
                          <Text ellipsis className="image-name">
                            {item.name}
                          </Text>
                          <Text type="secondary" className="image-date">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                )}
            />
          </Card>
        </Col>
      </Row>
  );
};

export default RelatedNotePage;
