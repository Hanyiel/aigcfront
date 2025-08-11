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
  UploadOutlined,
  FileImageOutlined, ApartmentOutlined, DragOutlined, LoadingOutlined
} from '@ant-design/icons';
import { useImageContext } from '../../contexts/ImageContext';
import { ExtractData, useExtract} from '../../contexts/ExtractContext';
import '../../styles/notes/extract.css';
import { useAuth } from "../../contexts/AuthContext";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";
import TextArea from "antd/es/input/TextArea";

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
  const { saveExtract, getExtractByImage, updateExtract } = useExtract();
  const { isAuthenticated, logout } = useAuth();
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractData | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');


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

  // 同步处理文件上传
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

  // 直接使用存储的File对象
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

      const result = await apiResponse.json();

      const extractData = {
        extract_id: `ext_${Date.now()}`,
        image_id: selectedImage.id,
        ...result.data
      };

      saveExtract(extractData);
      setResult(extractData);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '解析失败');
    } finally {
      setExtracting(false);
    }
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    if (isEditing) {
      // 保存编辑内容
      if (result) {
        const updatedExtract = {
          ...result,
          text_content: editingContent
        };
        setResult(updatedExtract);
        updateExtract(updatedExtract); // 更新上下文中的提取结果
        message.success('内容已保存');
      }
    } else {
      // 进入编辑模式
      if (result) {
        setEditingContent(result.text_content || '');
      }
    }
    setIsEditing(!isEditing);
  };
  // 处理内容变更
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingContent(e.target.value);
  };

  const renderToolbar = () => {
    return (
        <div className="toolbar">
          <Button
              type={isEditing ? 'default' : 'primary'}
              icon={<DragOutlined/>}
              onClick={toggleEditMode}
              // disabled={!result}
          >
            {isEditing ? '保存编辑' : '编辑模式'}
          </Button>
          <Button
              type="primary"
              onClick={handleExtract}
              icon={extracting ? <LoadingOutlined/> : <ApartmentOutlined/>}
              disabled={!selectedImage}
              loading={extracting}
          >
            {extracting ? '解析中...' : '开始提取'}
          </Button>
        </div>
    )
  }

  return (
      <div className="sub-container">
          <Row gutter={24} className="sub-row">
            <Col flex="auto" className="sub-col">
              <div className="tool-section">
                <Title level={3} className="tool-title">
                  <ApartmentOutlined/> 摘要提取
                </Title>
                { renderToolbar() }
              </div>
              <div
                  className="content-card"
              >
                <Spin tip="AI正在解析内容..." spinning={extracting}>
                  {result ? (
                      <div className="result-content">
                        <div className="section">
                          <Text strong>内容摘要：</Text>
                          {isEditing ? (
                              <TextArea
                                  value={editingContent}
                                  onChange={handleContentChange}
                                  autoSize={{ minRows: 10, maxRows: 20 }}
                                  style={{ width: '100%', marginTop: 16 }}
                              />
                          ) : (
                              <Text className="summary">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                  {result.text_content || ''}
                                </ReactMarkdown>
                              </Text>
                          )}
                        </div>
                      </div>
                  ) : (
                      <div className="empty-result">
                        <FileImageOutlined className="empty-icon"/>
                        <Text type="secondary">请选择需要解析的图片</Text>
                      </div>
                  )}
                </Spin>
              </div>
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
  );
};

export default ExtractPage;
