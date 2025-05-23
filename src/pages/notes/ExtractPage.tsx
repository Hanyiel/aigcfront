// src/pages/notes/extract/index.tsx
import React, { useEffect, useRef, useState } from 'react';
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
  Image,
  message
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useImageContext } from '../../contexts/ImageContext';
import { ExtractData, useExtract} from '../../contexts/ExtractContext';
import '../../styles/notes/extract.css';
import { useAuth } from "../../contexts/AuthContext";
import LatexRenderer from "../../components/LatexRenderer";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Content } = Layout;
const { Title, Text } = Typography;

const ExtractPage = () => {
  const navigate = useNavigate();
  const {
    images,
    addImage,
    removeImage,
    selectedImage,
    setSelectedImage,
    getImageFile
  } = useImageContext();
  const { saveExtract, getExtractByImage } = useExtract();
  const { isAuthenticated, logout } = useAuth();
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractData | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
//当选择图片时加载历史记录
  useEffect(() => {
    if (selectedImage) {
      const historyExtract = getExtractByImage(selectedImage.id);
      setResult(historyExtract || null);
    }
  }, [selectedImage, getExtractByImage]);

  // 修改1: 同步处理文件上传
  const handleUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('仅支持图片文件');
      return false;
    }

    try {
      addImage(file);
      message.success(`${file.name} 已添加预览`);
      if (uploadRef.current) uploadRef.current.value = '';
    } catch (err) {
      message.error('文件添加失败');
    }
    return false;
  };

  // 修改2: 直接使用存储的File对象
  const handleExtract = async () => {
    if (!selectedImage) {
      message.warning('请选择需要解析的图片');
      return;
    }

    try {
      setExtracting(true);
      const token = localStorage.getItem('authToken');
      const file = getImageFile(selectedImage.id);
      console.log('token', token)
      if (!file) {
        message.error('图片数据获取失败');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const apiResponse = await fetch('http://localhost:8000/api/notes/extract', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (apiResponse.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!apiResponse.ok) {
        throw new Error(`请求失败: ${apiResponse.statusText}`);
      }

      const data = await apiResponse.json();
      const extractData = {
        extract_id: `ext_${Date.now()}`,
        image_id: selectedImage.id,
        ...data.data
      };

      saveExtract(extractData);
      setResult(extractData);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '解析失败');
    } finally {
      setExtracting(false);
    }
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
                            <Text className="summary">
                              <ReactMarkdown
                                  remarkPlugins={[remarkMath]}
                                  rehypePlugins={[rehypeKatex]}
                              >
                                {result?.text_content}
                              </ReactMarkdown>
                            </Text>
                          </div>
                          {/*<div className="section">*/}
                          {/*  <Text strong>关键信息：</Text>*/}
                          {/*  <div className="keywords">*/}
                          {/*    {result?.text_content?.split('\n').map((line, i) => (*/}
                          {/*        <Text key={i}>{line}</Text>*/}
                          {/*    ))}*/}
                          {/*  </div>*/}
                          {/*</div>*/}
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
          </div>
        </Content>
      </Layout>
  );
};

export default ExtractPage;
