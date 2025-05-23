// src/pages/lecture/SmartLectureLayout.tsx
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Upload,
  Spin,
  message,
  List,
  Image as AntImage,
  Typography, Image
} from 'antd';
import {
  UploadOutlined,
  PlayCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import ReactMarkdown  from 'react-markdown';
import { useImageContext } from '../../contexts/ImageContext';
import { ExplanationData, useExplanation} from '../../contexts/ExplanationContext';
import '../../styles/notes/SmartLecturePage.css';

const { Content } = Layout;
const { Text } = Typography;

const SmartLectureLayout = () => {
  const {
    images,
    addImage,
    removeImage,
    selectedImage,
    setSelectedImage
  } = useImageContext();

  const {
    explanations,
    saveExplanation,
    deleteExplanation,
    getExplanation,
    getExplanationByImage
  } = useExplanation();

  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      const exp = getExplanationByImage(selectedImage.id);
      setExplanation(exp || null);
    }
  }, [selectedImage, explanations, getExplanationByImage]);
  // 处理图片上传
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('仅支持图片文件');
      return false;
    }
    try {
      setUploading(true);
      await addImage(file);
      message.success(`${file.name} 上传成功`);
    } catch (err) {
      message.error('文件上传失败');
    } finally {
      setUploading(false);
    }
    return false;
  };

  // 生成讲解
  const generateExplanation = async () => {
    if (!selectedImage) {
      message.warning('请先选择要分析的图片');
      return;
    }
    console.log("select scucess")

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('image', selectedImage.file);
      console.log("token:", token)
      const response = await fetch('http://localhost:8000/api/notes/explanation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      console.log("response:", response)

      if (!response.ok) throw new Error('讲解生成失败');
      const result = await response.json();
      const data = result.data;
      if (data.explanation_id === "-1") throw new Error(data.content_md);
      console.log("data:", data)
      const expData: ExplanationData = {
      ...data,
      image_id: selectedImage.id
    };
      saveExplanation(expData);

      console.log('explanations:', explanations)
      console.log("explanation:", expData)
      setExplanation(expData);

      message.success('讲解生成成功');

    } catch (error: any) {
      console.error('生成失败:', error);
      message.error(error.message || '讲解生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Layout className="lecture-layout">
        <Content className="lecture-content">
          <Row gutter={24}>
            {/* 主讲解区域 */}
            <Col xs={24} md={14} lg={16}>
              <Card
                  title="AI智能讲解"
                  className="main-card"
                  extra={
                    <div className="action-bar">
                      <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          loading={loading}
                          onClick={generateExplanation}
                          disabled={!selectedImage}
                      >
                        {explanation ? '重新生成' : '开始讲解'}
                      </Button>
                    </div>
                  }
              >
                <Spin spinning={loading}>
                  {/* 讲解内容展示 */}
                  {explanation ? (
                      <div className="explanation-content">
                        <div className="markdown-body">
                          <ReactMarkdown>
                            {explanation.content_md}
                          </ReactMarkdown>
                        </div>
                      </div>
                  ) : (
                      <div className="upload-guide">
                        <Text type="secondary">
                          请从右侧图片列表选择或上传题目图片
                        </Text>
                      </div>
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
                            className={`list-item ${
                                selectedImage?.id === item.id ? 'selected' : ''
                            }`}
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
        </Content>
      </Layout>
  );
};

export default SmartLectureLayout;
