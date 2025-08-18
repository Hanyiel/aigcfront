// src/pages/lecture/SmartLectureLayout.tsx
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Image,
  Row,
  Col,
  Button,
  Upload,
  Spin,
  message,
  List,
  Image as AntImage,
  Typography,
  Input
} from 'antd';
import {
  UploadOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined, ApartmentOutlined, LoadingOutlined, FileImageOutlined
} from '@ant-design/icons';
import ReactMarkdown  from 'react-markdown';
import { useImageContext } from '../../contexts/ImageContext';
import { ExplanationData, useExplanation} from '../../contexts/ExplanationContext';
import '../../styles/notes/SmartLecturePage.css';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

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
    getExplanationByImage,
    updateExplanation // 添加更新方法
  } = useExplanation();

  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 添加编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedImage) {
      const exp = getExplanationByImage(selectedImage.id);
      if (exp) {
        setExplanation(exp);
        setEditingContent(exp.content_md || '');
      } else {
        setExplanation(null);
        setEditingContent('');
      }
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

      if (!response.ok) throw new Error('讲解生成失败');
      const result = await response.json();
      console.log('result:', result);
      const data = result.data;
      if (data.explanation_id === "-1") throw new Error(data.content_md);
      console.log("data:", data)
      const expData: ExplanationData = {
        ...data,
        note_id: selectedImage.id
      };
      saveExplanation(expData);

      console.log('explanations:', explanations)
      console.log("explanation:", expData)
      setExplanation(expData);
      setEditingContent(expData.content_md || ''); // 设置编辑内容
      setIsEditing(false); // 退出编辑模式

      message.success('讲解生成成功');

    } catch (error: any) {
      console.error('生成失败:', error);
      message.error(error.message || '讲解生成失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    if (isEditing) {
      // 保存编辑内容
      if (explanation) {
        const updatedExplanation = {
          ...explanation,
          content_md: editingContent
        };
        setExplanation(updatedExplanation);
        updateExplanation(updatedExplanation); // 更新上下文
        message.success('讲解内容已保存');
      }
    } else {
      // 进入编辑模式
      if (explanation) {
        setEditingContent(explanation.content_md || '');
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
          {/* 添加编辑按钮 */}
          <Button
              type={isEditing ? 'default' : 'primary'}
              icon={isEditing ? <SaveOutlined/> : <EditOutlined/>}
              onClick={toggleEditMode}
              // disabled={!explanation}
          >
            {isEditing ? '保存编辑' : '编辑模式'}
          </Button>
          <Button
              type="primary"
              icon={loading ? <LoadingOutlined/> : <PlayCircleOutlined/>}
              loading={loading}
              onClick={generateExplanation}
              disabled={!selectedImage}
          >
            {explanation ? '重新生成' : '开始讲解'}
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
                <ApartmentOutlined/> 智能讲解
              </Title>
              { renderToolbar() }
            </div>
            <div
                className="content-card"
            >
              <Spin spinning={loading}>
                {/* 讲解内容展示 */}
                {explanation ? (
                    <div className="explanation-content">
                      <div className="markdown-body">
                        {isEditing ? (
                            <TextArea
                                value={editingContent}
                                onChange={handleContentChange}
                                autoSize={{minRows: 15, maxRows: 30}}
                                style={{width: '100%'}}
                                placeholder="输入Markdown格式的讲解内容..."
                            />
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                              {explanation.content_md}
                            </ReactMarkdown>
                        )}
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
            </div>
          </Col>

          {/* 右侧图片列表 */}
          <Col xs={24} md={10} lg={8}>
            <Card
                title="图片列表"
                className="note-image-list-card"
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
                          className={`note-page-list-item ${
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
                        <div className="note-thumbnail-wrapper">
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
                              className="note-file-icon"
                              style={item.has_saved ? {backgroundColor: 'mediumseagreen'} : {backgroundColor: 'darkorange'}}
                              onClick={(e) => {
                                e.stopPropagation(); // 阻止事件冒泡到列表项
                                setPreviewImage(item.url); // 设置预览图片
                              }}
                          />
                        </div>
                        <div className="note-image-info">
                            <span className="note-image-name">
                              {item.name}
                            </span>
                          <span className="note-image-date">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          {item.has_saved ? (
                              <Text type="secondary" className="note-image-date">
                                {"   --saved"}
                              </Text>
                          ) : (
                              <div></div>
                          )}
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

export default SmartLectureLayout;
