import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {Button, Card, Row, Col, List, Tag, Upload, Spin, message, Typography, Input, Image, Empty} from 'antd';
import {
  UploadOutlined,
  FileImageOutlined,
  LinkOutlined,
  ApartmentOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useQuestionImageContext } from '../../contexts/QuestionImageContext';
import '../../styles/questions/QuestionKeywordsPage.css';
import { useQuestionKeywords } from "../../contexts/QuestionKeywordsContext";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;
const { Search } = Input;

interface QuestionKeyword {
  term: string;
  tfidfScore: number;
  subject?: string;
  relatedNotes?: string[];
  relatedQuestions?: string[];
}

const QuestionKeywordsPage = () => {
  const navigate = useNavigate();

  const {
    images: questionImages,
    addImage: addQuestionImage,
    removeImage: removeQuestionImage,
    selectedImage: selectedQuestionImage,
    setSelectedImage: setSelectedQuestionImage,
    getImageFile: getQuestionImageFile
  } = useQuestionImageContext();

  const {
    saveQuestionKeywords,
    getKeywordsByQuestionImage,
    updateQuestionKeywords // 获取更新函数
  } = useQuestionKeywords();

  const [keywords, setKeywords] = useState<QuestionKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [ocrTexts, setOcrTexts] = useState<Record<string, string>>({});
  const uploadRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKeywordText, setNewKeywordText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 当选中图片变化时，更新关键词列表
  useEffect(() => {
    if (selectedQuestionImage) {
      const kws = getKeywordsByQuestionImage(selectedQuestionImage.id) || [];
      setKeywords(kws);
    } else {
      setKeywords([]);
    }
    // 切换图片时退出编辑状态
    setIsEditing(false);
    setEditingIndex(null);
    setIsAdding(false);
  }, [selectedQuestionImage, getKeywordsByQuestionImage]);

  const handleUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('仅支持图片文件');
      return false;
    }
    try {
      addQuestionImage(file);
      message.success(`${file.name} 已添加预览`);
      if (uploadRef.current) uploadRef.current.value = '';
    } catch (err) {
      message.error('文件添加失败');
    }
    return false;
  };

  const handleExtractKeywords = async () => {
    const token = localStorage.getItem('authToken');

    if (!selectedQuestionImage) {
      message.warning('请先选择图片');
      return;
    }
    try {
      setLoading(true);
      const imageFile = getQuestionImageFile(selectedQuestionImage.id);
      if (!imageFile) {
        message.error('图片文件不存在');
        return;
      }
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('max_keywords', '5');
      formData.append('regenerate', 'true');

      const response = await fetch('http://localhost:8000/api/questions/keywords', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP错误 ${response.status}`);
      }
      const result = await response.json();
      const data = result.data;

      if (!result.data?.keywords) {
        throw new Error('返回数据格式异常');
      }

      const keywords: QuestionKeyword[] = data.keywords.map((k: any) => ({
        term: k.term,
        tfidfScore: Number(k.tfidf_score),
        subject: data.subject
      }));

      saveQuestionKeywords(selectedQuestionImage.id, keywords);
      setKeywords(keywords);
      message.success(`提取到${keywords.length}个关键词`);
    } catch (err) {
      console.error('提取错误详情:', err);
      message.error(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    if (isEditing) {
      // 保存所有更改
      if (selectedQuestionImage) {
        updateQuestionKeywords(selectedQuestionImage.id, keywords);
        message.success('关键词已保存');
      }
    }
    setIsEditing(!isEditing);
    setEditingIndex(null);
    setIsAdding(false);
  };

  // 开始编辑关键词
  const startEditing = (index: number, term: string) => {
    if (!isEditing) return;
    setEditingIndex(index);
    setEditingText(term);
  };

  // 完成关键词编辑
  const finishEditing = (index: number) => {
    if (editingText.trim()) {
      const updatedKeywords = [...keywords];
      updatedKeywords[index] = {
        ...updatedKeywords[index],
        term: editingText
      };
      setKeywords(updatedKeywords);
    }
    setEditingIndex(null);
  };

  // 处理关键词文本变化
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  // 处理新关键词文本变化
  const handleNewKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewKeywordText(e.target.value);
  };

  // 添加新关键词
  const addNewKeyword = () => {
    if (!selectedQuestionImage) {
      message.warning('请先选择图片');
      return;
    }

    if (!isAdding) {
      setIsAdding(true);
      setNewKeywordText('');
    } else if (newKeywordText.trim()) {
      const newKeyword: QuestionKeyword = {
        term: newKeywordText.trim(),
        tfidfScore: 0.05,
        relatedNotes: [],
        relatedQuestions: []
      };
      const updatedKeywords = [...keywords, newKeyword];
      setKeywords(updatedKeywords);
      setIsAdding(false);
    }
  };

  // 保存新关键词
  const saveNewKeyword = () => {
    if (newKeywordText.trim()) {
      const newKeyword: QuestionKeyword = {
        term: newKeywordText.trim(),
        tfidfScore: 0.05,
        relatedNotes: [],
        relatedQuestions: []
      };
      const updatedKeywords = [...keywords, newKeyword];
      setKeywords(updatedKeywords);
    }
    setIsAdding(false);
  };

  // 删除关键词
  const handleDeleteKeyword = (index: number) => {
    if (!selectedQuestionImage) return;

    const updatedKeywords = [...keywords];
    updatedKeywords.splice(index, 1);
    setKeywords(updatedKeywords);

    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const renderKeywordsEditor = () => {
    if(keywords.length < 1){
      return (
          <div className="empty-state">
            <Empty description={
              <span>
                {selectedQuestionImage ? '点击生成讲解获取关键词' : '请先选择题目图片'}
              </span>
            }/>
          </div>
      );
    }

    return (
        <div className="keywords-list">
          {keywords.map((k, i) => (
              <div
                  key={i}
                  className="keyword-tag-wrapper"
                  onDoubleClick={() => startEditing(i, k.term)}
              >
                {editingIndex === i ? (
                    <Input
                        autoFocus
                        value={editingText}
                        onChange={handleKeywordChange}
                        onPressEnter={() => finishEditing(i)}
                        onBlur={() => finishEditing(i)}
                        size="small"
                        style={{ width: 120 }}
                    />
                ) : (
                    <Tag
                        color={i % 2 ? 'geekblue' : 'cyan'}
                        className="keyword-tag"
                    >
                      {k.term}
                      <span className="score">({(k.tfidfScore * 100).toFixed(1)}%)</span>
                    </Tag>
                )}
                {isEditing && editingIndex !== i && (
                    <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        className="delete-keyword-btn"
                        onClick={() => handleDeleteKeyword(i)}
                    />
                )}
              </div>
          ))}

          {isEditing && (
              <div className="add-keyword-container">
                {isAdding ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Input
                          autoFocus
                          value={newKeywordText}
                          onChange={handleNewKeywordChange}
                          onPressEnter={saveNewKeyword}
                          onBlur={saveNewKeyword}
                          size="small"
                          placeholder="输入新关键词"
                          style={{ width: 120 }}
                      />
                    </div>
                ) : (
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={addNewKeyword}
                    >
                      添加关键词
                    </Button>
                )}
              </div>
          )}
        </div>
    );
  };

  const renderToolbar = () => (
      <div className="toolbar">
        <Button
            type={isEditing ? "primary" : "default"}
            icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
            onClick={toggleEditMode}
            disabled={!selectedQuestionImage}
        >
          {isEditing ? '保存编辑' : '编辑模式'}
        </Button>
        <Button
            type="primary"
            onClick={handleExtractKeywords}
            loading={loading}
            disabled={!selectedQuestionImage}
        >
          提取关键词
        </Button>
      </div>
  );

  return (
      <div className="sub-container">
        <Row gutter={24} className="sub-row">
          <Col flex="auto" className="sub-col">
            <div className="tool-section">
              <Title level={3} className="tool-title">
                <ApartmentOutlined /> 提取关键词
              </Title>
              {renderToolbar()}
            </div>
            <div className="content-card">
              {renderKeywordsEditor()}
            </div>
          </Col>

          {/* 右侧图片列表 */}
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
                  dataSource={questionImages}
                  renderItem={(item) => (
                      <List.Item
                          className={`question-page-list-item ${selectedQuestionImage?.id === item.id ? 'selected' : ''}`}
                          onClick={() => setSelectedQuestionImage(item)}
                          extra={
                            <Button
                                type="link"
                                danger
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeQuestionImage(item.id);
                                  setOcrTexts(prev => {
                                    const newTexts = {...prev};
                                    delete newTexts[item.id];
                                    return newTexts;
                                  });
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
                              className="question-thumbnail"
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
                          <span className="question-image-name">{item.name.length > 20 ? item.name.substring(0, 20)+"..." : item.name}</span>
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

export default QuestionKeywordsPage;
