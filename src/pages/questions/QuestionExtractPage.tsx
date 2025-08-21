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
  message,
  Input, Empty
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  FileImageOutlined,
  ApartmentOutlined,
  EditOutlined,
  SaveOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import { useQuestionImageContext } from "../../contexts/QuestionImageContext";
import { QuestionExtractData, useQuestionExtract } from '../../contexts/QuestionExtractContext';
import '../../styles/questions/extract.css';
import { useAuth } from "../../contexts/AuthContext";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const QuestionExtractPage = () => {
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
    saveQuestionExtract,
    getQuestionExtractByImage,
    updateQuestionExtract // 从上下文中获取更新函数
  } = useQuestionExtract();
  const { isAuthenticated, logout } = useAuth();
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<QuestionExtractData | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (selectedImage) {
      const historyExtract = getQuestionExtractByImage(selectedImage.id);
      setResult(historyExtract || null);
      if (historyExtract) {
        setEditingText(historyExtract.text_content);
      }
    } else {
      setResult(null);
      setEditingText('');
    }
    setIsEditing(false); // 切换图片时退出编辑模式
  }, [selectedImage, getQuestionExtractByImage]);

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

  const handleExtract = async () => {
    if (!selectedImage) {
      message.warning('请选择需要解析的图片');
      return;
    }

    try {
      setExtracting(true);
      const token = localStorage.getItem('authToken');
      const file = getImageFile(selectedImage.id);

      if (!file) {
        message.error('图片数据获取失败');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      if(result)
        formData.append('regenerate', 'true');
      else {
        formData.append('regenerate', 'false');
      }

      const apiResponse = await fetch('http://localhost:8000/api/questions/extract', {
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

      console.log("quesre", data)
      const extractData: QuestionExtractData = {
        extract_id: `q_${Date.now()}`,
        image_id: selectedImage.id,
        ...data.data
      };

      saveQuestionExtract(extractData);
      setResult(extractData);
      setEditingText(extractData.text_content);
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
        updateQuestionExtract(result.extract_id, editingText);
        setResult({
          ...result,
          text_content: editingText
        });
        message.success('内容已保存');
      }
    }
    setIsEditing(!isEditing);
  };

  // 处理文本编辑变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingText(e.target.value);
  };

  const renderToolbar = () => {
    return (
        <div className="toolbar">
          <Button
              type={isEditing ? "default" : "primary"}
              icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
              onClick={toggleEditMode}
              // disabled={!result}
          >
            {isEditing ? '保存内容' : '编辑模式'}
          </Button>
          <Button
              type="primary"
              icon={<PlayCircleOutlined/>}
              onClick={handleExtract}
              disabled={!selectedImage}
              loading={extracting}
          >
            {extracting ? '解析中...' : '开始提取'}
          </Button>
        </div>
    )
  }

  const renderExtractEditor = () => {
    if (extracting) {
      return (
          <div className="loading-container">
            <Spin tip="AI正在解析题目..." size="large" />
          </div>
      );
    }

    if(!result){
      return (
                <div className="empty-state">
                    <Empty description={
                        <span>
                            {selectedImage ? '点击右上角生成摘要' : '请先选择题目图片'}
                        </span>
                    }/>
                </div>
            );
    }

    return (
        <div className="result-content">
          <div className="section">
            <Text strong>内容摘要：</Text>
            {isEditing ? (
                <TextArea
                    autoSize={{ minRows: 6, maxRows: 12 }}
                    value={editingText}
                    onChange={handleTextChange}
                    className="editing-textarea"
                />
            ) : (
                <div className="summary">
                  <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                  >
                    {result.text_content}
                  </ReactMarkdown>
                </div>
            )}
          </div>
        </div>
    );
  };

  return (
      <div className="sub-container">
        <Row gutter={24} className="sub-row">
          <Col flex="auto" className="sub-col">
            <div className="tool-section">
              <Title level={3} className="tool-title">
                <ApartmentOutlined/>
                题目提取
              </Title>
              {renderToolbar()}
            </div>
            <div className="content-card">
              {renderExtractEditor()}
            </div>
          </Col>

          <Col xs={24} md={10} lg={8}>
            <Card
                title="图片列表"
                className="question-image-list-card"
                extra={
                  <Upload
                      beforeUpload={handleUpload}
                      showUploadList={false}
                      accept="image/*"
                  >
                    <Button icon={<UploadOutlined/>}>上传图片</Button>
                  </Upload>
                }
            >
              <List
                  dataSource={images}
                  renderItem={(item) => (
                      <List.Item
                          className={`question-page-list-item ${
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
                        <div className="question-thumbnail-wrapper">
                          <img
                              src={item.url}
                              alt={item.name}
                              className="note-thumbnail"
                              onClick={(e) => {
                                e.stopPropagation(); // 阻止事件冒泡到列表项
                                setPreviewImage(item.url); // 设置预览图片
                              }}
                              style={{cursor: 'pointer'}} // 添加指针样式表示可点击
                          />
                          <FileImageOutlined
                              className="question-file-icon"
                              style={item.has_saved ? {backgroundColor: 'mediumseagreen'} : {backgroundColor: 'darkorange'}}
                              onClick={(e) => {
                                e.stopPropagation(); // 阻止事件冒泡到列表项
                                setPreviewImage(item.url); // 设置预览图片
                              }}
                          />
                        </div>
                        <div className="question-image-info">
                          <span className="question-image-name">
                            {item.name.length > 20 ? item.name.substring(0, 20)+"..." : item.name}
                          </span>
                          <span className="question-image-date">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                      </List.Item>
                  )}
              />
            </Card>
          </Col>
        </Row>
        {/* 图片预览组件 */}
        {previewImage && (
            <Image
                width={0}
                height={0}
                style={{ display: 'none' }}
                src={previewImage}
                preview={{
                  visible: !!previewImage,
                  onVisibleChange: (visible) => {
                    if (!visible) setPreviewImage(null);
                  }
                }}
            />
        )}
      </div>
  );
};

export default QuestionExtractPage;
