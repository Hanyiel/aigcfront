// src/pages/questions/QuestionKeywordsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, List, Tag, Upload, Spin, message } from 'antd';
import {
  UploadOutlined,
  FileImageOutlined,
  LinkOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useQuestionImageContext } from '../../contexts/QuestionImageContext';
import '../../styles/questions/QuestionKeywordsPage.css';
import { useQuestionKeywords } from "../../contexts/QuestionKeywordsContext";
import { useAuth } from "../../contexts/AuthContext";

interface QuestionKeyword {
  term: string;
  tfidf_score: number;
  related_notes?: string[];
  related_questions?: string[];
}

const QuestionKeywordsPage = () => {
  const navigate = useNavigate();

  // Context 替换
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
  } = useQuestionKeywords();

  const [keywords, setKeywords] = useState<QuestionKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [associations, setAssociations] = useState<string[]>([]);
  const [ocrTexts, setOcrTexts] = useState<Record<string, string>>({});
  const [ocrLoading, setOcrLoading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('仅支持图片文件');
      return false;
    }
    try {
      addQuestionImage(file); // 方法替换
      message.success(`${file.name} 已添加预览`);
      if (uploadRef.current) uploadRef.current.value = '';
    } catch (err) {
      message.error('文件添加失败');
    }
    return false;
  };

  const handleExtractKeywords = async () => {
    const token = localStorage.getItem('authToken');

    if (!selectedQuestionImage) { // 变量替换
      message.warning('请先选择图片');
      return;
    }
    try {
      setLoading(true);
      const imageFile = getQuestionImageFile(selectedQuestionImage.id); // 方法替换
      console.log('token:', token)
      if (!imageFile) {
        message.error('图片文件不存在');
        return;
      }
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('max_keywords', '5');
      // 接口路径修改
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
      console.log('完整响应:', result);
      const data = result.data;
      console.log(data)

      if (!result.data?.keywords) {
        console.error('异常数据结构:', result);
        throw new Error('返回数据格式异常');
      }

      const keywords = data.keywords.map((k: any) => ({
        term: k.term,
        tfidfScore: Number(k.tfidf_score),
        subject: data.subject
      }));

      saveQuestionKeywords(selectedQuestionImage.id, keywords); // 方法替换
      setKeywords(keywords);
      message.success(`提取到${keywords.length}个关键词`);
    } catch (err) {
      console.error('提取错误详情:', err);
      message.error(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="keywords-container">
      <Row gutter={24} className="keywords-row">
        {/* 左侧关键词区域 */}
        <Col flex="auto" className="keywords-col">
          <Card
            title="关键词分析"
            extra={
              <Button
                type="primary"
                onClick={handleExtractKeywords}
                loading={loading}
              >
                提取关键词
              </Button>
            }
          >
            <div className="keywords-list">
              {selectedQuestionImage && getKeywordsByQuestionImage(selectedQuestionImage.id)?.map((k, i) => ( // 方法替换
                <Tag
                  key={i}
                  color={i % 2 ? 'geekblue' : 'cyan'}
                  className="keyword-tag"
                >
                  {k.term}
                  <span className="score">({(k.tfidfScore * 100).toFixed(1)}%)</span>
                </Tag>
              ))}
            </div>
          </Card>
        </Col>

        {/* 右侧图片列表 */}
        <Col flex="400px" className="image-col">
          <Card
            title="题目图片列表"  // 标题修改
            className="image-list-card"
            extra={
              <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传题目图片</Button> {/* 文案微调 */}
              </Upload>
            }
          >
            <List
              dataSource={questionImages} // 数据源替换
              renderItem={(item) => (
                <List.Item
                  className={`list-item ${selectedQuestionImage?.id === item.id ? 'selected' : ''}`} // 变量替换
                  onClick={() => setSelectedQuestionImage(item)} // 方法替换
                  extra={
                    <Button
                      type="link"
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestionImage(item.id); // 方法替换
                        setOcrTexts(prev => {
                          const newTexts = { ...prev };
                          delete newTexts[item.id];
                          return newTexts;
                        });
                      }}
                    >
                      删除
                    </Button>
                  }
                >
                  <div className="thumbnail-wrapper">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="thumbnail"
                    />
                    <FileImageOutlined className="file-icon" />
                  </div>
                  <div className="image-info">
                    <span className="image-name">{item.name}</span>
                    <span className="image-date">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    {ocrTexts[item.id] && (
                      <span className="text-indicator">
                        <LinkOutlined /> 已解析文本
                      </span>
                    )}
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

export default QuestionKeywordsPage;
