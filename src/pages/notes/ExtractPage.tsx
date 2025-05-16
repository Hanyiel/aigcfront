// src/pages/notes/extract/index.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Button,
  Upload,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  List,
  Image
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useImageContext } from '../../contexts/ImageContext';
import '../../styles/notes/extract.css';

const { Content } = Layout;
const { Title, Text } = Typography;

interface ExtractResult {
  summary: string;
  keywords: string[];
  structure: any[];
}

const ExtractPage = () => {
  const navigate = useNavigate();
  const { images } = useImageContext();
  const [selectedImage, setSelectedImage] = useState<string>();
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);

  const mockResult = {
    summary: '这张图片展示了深度学习的核心概念...',
    keywords: ['神经网络', '卷积层', '激活函数'],
    structure: [
      { title: '核心概念', key: '0' },
      { title: '网络结构', key: '1' },
      { title: '训练方法', key: '2' }
    ],
  };

  const handleUpload = (file: File) => {
    const newImage = {
      id: Date.now().toString(),
      url: URL.createObjectURL(file),
      name: file.name,
      timestamp: Date.now(),
    };
    // 需要更新useImageContext中的setImages
    return false;
  };

  const handleExtract = () => {
    if (!selectedImage) return;
    setExtracting(true);
    setTimeout(() => {
      setResult(mockResult);
      setExtracting(false);
    }, 1500);
  };

  return (
    <Layout className="extract-layout">
      <Content className="extract-content">
        <div className="content-wrapper">
          <Title level={3} className="main-title">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="back-btn"
            />
            笔记提取
          </Title>

          <Row gutter={24} className="content-row">
            {/* 左侧结果区域 */}
            <Col xs={24} md={14} lg={16}>
              <Card
                title="提取结果"
                className="result-card"
                extra={
                  <Button
                    type="primary"
                    onClick={handleExtract}
                    disabled={!selectedImage}
                    loading={extracting}
                  >
                    {extracting ? '解析中...' : '开始提取'}
                  </Button>
                }
              >
                <Spin tip="AI正在解析内容..." spinning={extracting}>
                  {result ? (
                    <div className="result-content">
                      <div className="section">
                        <Text strong>内容摘要：</Text>
                        <Text className="summary">{result.summary}</Text>
                      </div>
                      <div className="section">
                        <Text strong>关键信息：</Text>
                        <div className="keywords">
                          {result.keywords.map((word, i) => (
                            <Text key={i} className="keyword-tag">
                              #{word}
                            </Text>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-result">
                      <FileImageOutlined className="empty-icon" />
                      <Text type="secondary">请选择需要解析的图片</Text>
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
                    <Button icon={<UploadOutlined />}>上传图片</Button>
                  </Upload>
                }
              >
                <List
                  dataSource={images}
                  renderItem={(item) => (
                    <List.Item
                      className={`list-item ${selectedImage === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedImage(item.id)}
                    >
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
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default ExtractPage;
