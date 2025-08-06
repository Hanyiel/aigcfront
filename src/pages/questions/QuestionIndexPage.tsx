// QuestionIndexPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Button, Card, List, Modal, message, Row, Col } from 'antd';
import { InboxOutlined, RocketOutlined, KeyOutlined, BookOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useImageContext } from '../../contexts/ImageContext';
import '../../styles/questions/QuestionIndexPage.css';
import {useQuestionImageContext} from "../../contexts/QuestionImageContext";
import { QuestionImage } from '../../contexts/QuestionImageContext'

const { Dragger } = Upload;
const QuestionIndexPage = () => {
  const {
    images,
    addImage,
    removeImage,
    getImageFile,
    selectedImage,
    setSelectedImage
  } = useQuestionImageContext();
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();

  const uploadProps: UploadProps = {
    name: 'image',
    multiple: true,
    showUploadList: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      if (!file.type.startsWith('image/')) {
        message.error('仅支持图片文件');
        return false;
      }

      try {
        addImage(file);
        message.success(`${file.name} 已添加预览`);
      } catch (err) {
        message.error('文件添加失败');
      }
      return false;
    },
  };

  const handleAction = (action: string) => {
    if (!selectedImage) {
      message.warning('请先选择图片');
      return;
    }

    const routeMap: Record<string, string> = {
      extract: '/questions/extract',      // 路由路径变更
      analysis: '/questions/analysis',    // 新增题目分析功能
      solution: '/questions/solution',    // 解题思路功能
      save: '/questions/save'             // 保存路径变更
    };

    if (!routeMap[action]) {
      message.error('功能暂未开放');
      return;
    }

    navigate(routeMap[action], {
      state: { selectedImage },
      replace: false
    });
  };

  const handleSelectImage = (item: QuestionImage) => {
    setSelectedImage(item);
  }

  return (
    <div className="questions-page-container"> {/* 类名变更 */}
      <Row gutter={24} className="main-layout">
        <Col xs={24} md={8} lg={6}>
          <Card title="题目素材管理" className="upload-card"> {/* 标题变更 */}
            <Dragger {...uploadProps} className="custom-uploader">
              <div className="upload-content">
                <InboxOutlined className="upload-icon" />
                <p className="upload-text">点击或拖拽文件到此处添加</p>
                <p className="upload-hint">支持常见题目图片格式</p> {/* 文案变更 */}
              </div>
            </Dragger>
          </Card>
        </Col>

        <Col xs={24} md={16} lg={18}>
          <Card title="题目素材库" className="question-image-list-card"> {/* 标题变更 */}
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={images}
              renderItem={item => (
                <List.Item>
                  <div
                    className={`image-card ${selectedImage?.id === item.id ? 'selected' : ''}`}
                    onClick={() => handleSelectImage(item)}
                    onDoubleClick={() => setPreviewVisible(true)}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="thumbnail-image"
                    />

                    <div className="image-info">
                      <span className="image-name">{item.name}</span>
                      <span className="upload-time">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <Button
                        type="link"
                        danger
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(item.id);
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <div className="function-nav">
        <Button
          type="primary"
          icon={<KeyOutlined />}
          onClick={() => handleAction('extract')}
        >
          题目提取
        </Button>
        <Button
          type="primary"
          icon={<RocketOutlined />}
          onClick={() => handleAction('analysis')} // 功能变更
        >
          题目分析
        </Button>
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={() => handleAction('solution')} // 功能变更
        >
          解题思路
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => handleAction('save')}
        >
          保存题目
        </Button>
      </div>

      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="80vw"
        centered
      >
        <img
          src={selectedImage?.url}
          alt="题目预览"
          className="preview-image"
        />
      </Modal>
    </div>
  );
};

export default QuestionIndexPage;
