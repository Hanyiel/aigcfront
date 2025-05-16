// src/pages/notes/KeywordsPage.tsx
import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, List, Tag, Upload, Spin, message } from 'antd';
import {
  UploadOutlined,
  FileImageOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { useImageContext } from '../../contexts/ImageContext';
import '../../styles/notes/KeywordsPage.css';

interface Keyword {
  name: string;
  confidence: number;
  associations?: string[];
}

const KeywordsPage = () => {
  const { images, selectedImage, setSelectedImage } = useImageContext();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [associations, setAssociations] = useState<string[]>([]);

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

  const fetchKeywords = async (imageId: string) => {
    try {
      setLoading(true);
      // 模拟API调用
      const mockResponse: Keyword[] = [
        {
          name: "人工智能",
          confidence: 0.92,
          associations: ["机器学习", "深度学习", "神经网络"]
        },
        {
          name: "计算机视觉",
          confidence: 0.87,
          associations: ["图像识别", "目标检测", "OpenCV"]
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setKeywords(mockResponse);
      updateAssociations(mockResponse);
    } catch (error) {
      message.error('提取关键词失败');
    } finally {
      setLoading(false);
    }
  };

  const updateAssociations = (keywords: Keyword[]) => {
    const allAssociations = keywords
      .flatMap(k => k.associations || [])
      .filter((v, i, a) => a.indexOf(v) === i);
    setAssociations(allAssociations);
  };

  useEffect(() => {
    if (selectedImage) {
      fetchKeywords(selectedImage.id);
    }
  }, [selectedImage]);

  return (
    <div className="keywords-container">
      <Row gutter={24} className="keywords-row">
        {/* 左侧关键词区域 */}
        <Col flex="auto" className="keywords-col">
          <Card
            title="关键词提取结果"
            className="keywords-card"
            extra={
              <Tag icon={<LinkOutlined />} color="processing">
                共检测到 {keywords.length} 个关键词
              </Tag>
            }
          >
            <Spin spinning={loading}>
              <div className="keywords-section">
                <h3>核心关键词</h3>
                <div className="keywords-list">
                  {keywords.map((keyword, index) => (
                    <Tag
                      key={index}
                      className="keyword-tag"
                      color={index % 2 === 0 ? 'geekblue' : 'cyan'}
                    >
                      {keyword.name}
                      <span className="confidence">
                        ({Math.round(keyword.confidence * 100)}%)
                      </span>
                    </Tag>
                  ))}
                </div>
              </div>

              <div className="associations-section">
                <h3>关联概念图谱</h3>
                <div className="associations-cloud">
                  {associations.map((term, index) => (
                    <Tag
                      key={index}
                      className="association-tag"
                      color={index % 3 === 0 ? 'purple' : 'magenta'}
                    >
                      {term}
                    </Tag>
                  ))}
                </div>
              </div>
            </Spin>
          </Card>
        </Col>

        {/* 右侧图片列表 */}
        <Col flex="400px" className="image-col">
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
                  className={`list-item ${selectedImage?.name === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedImage(item)}
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

export default KeywordsPage;
