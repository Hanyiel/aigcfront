// NoteIndexPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image, Button, Card, List, Modal, message, Row, Col } from 'antd';
import { InboxOutlined, RocketOutlined, KeyOutlined, BookOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useImageContext } from '../../contexts/ImageContext';
import '../../styles/notes/NoteIndexPage.css';

const { Dragger } = Upload;

interface UploadedImage {
  id: string;
  url: string;         // 始终使用blob URL
  name: string;
  timestamp: number;
  status: 'uploaded';  // 简化状态（仅展示用）
  file: File;          // 保留原始文件引用
}
const NoteIndexPage = () => {
  const {
    images,
    addImage,
    removeImage,
    getImageFile
  } = useImageContext();
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 简化上传属性配置
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
      extract: '/notes/extract',
      mindmap: '/notes/mind-map',
      explanation: '/notes/explanation',
      save: '/notes/save-note'
    };

    if (!routeMap[action]) {
      message.error('功能暂未开放');
      return;
    }

    // 传递完整图片数据
    navigate(routeMap[action], {
      state: { selectedImage },
      replace: false
    });
  };

  const handleSelectImage = (item: UploadedImage) => {
    setSelectedImage(prev => prev?.id === item.id ? null : item);
  }

  return (
      <div className="notes-page-container">
        <Row gutter={24} className="main-layout">
          <Col xs={24} md={8} lg={6}>
            <Card title="图片管理" className="upload-card">
              <Dragger {...uploadProps} className="custom-uploader">
                <div className="upload-content">
                  <InboxOutlined className="upload-icon" />
                  <p className="upload-text">点击或拖拽文件到此处添加</p>
                  <p className="upload-hint">支持常见图片格式</p>
                </div>
              </Dragger>
            </Card>
          </Col>

          <Col xs={24} md={16} lg={18}>
            <Card title="图片库" className="index-image-list-card">
              <List
                  grid={{ gutter: 16, column: 4 }}
                  dataSource={images}
                  renderItem={item => (
                      <List.Item>
                        <div
                            className={`image-card ${selectedImage?.id === item.id ? 'selected' : ''}`}
                            onClick={() => handleSelectImage(item)}
                            onDoubleClick={(e) => {
                              e.stopPropagation(); // 阻止事件冒泡到列表项
                              setPreviewImage(item.url); // 设置预览图片
                            }}
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

        {/*<div className="function-nav">*/}
        {/*  <Button*/}
        {/*      type="primary"*/}
        {/*      icon={<KeyOutlined />}*/}
        {/*      onClick={() => handleAction('extract')}*/}
        {/*  >*/}
        {/*    笔记提取*/}
        {/*  </Button>*/}
        {/*  <Button*/}
        {/*      type="primary"*/}
        {/*      icon={<RocketOutlined />}*/}
        {/*      onClick={() => handleAction('mindmap')}*/}
        {/*  >*/}
        {/*    思维导图*/}
        {/*  </Button>*/}
        {/*  <Button*/}
        {/*      type="primary"*/}
        {/*      icon={<BookOutlined />}*/}
        {/*      onClick={() => handleAction('explanation')}*/}
        {/*  >*/}
        {/*    智能讲解*/}
        {/*  </Button>*/}
        {/*  <Button*/}
        {/*      type="primary"*/}
        {/*      icon={<SaveOutlined />}*/}
        {/*      onClick={() => handleAction('save')}*/}
        {/*  >*/}
        {/*    保存笔记*/}
        {/*  </Button>*/}
        {/*</div>*/}

        <Modal
            open={previewVisible}
            onCancel={() => setPreviewVisible(false)}
            footer={null}
            width="80vw"
            centered
        >
          <img
              src={selectedImage?.url}
              alt="预览"
              className="preview-image"
          />
        </Modal>
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

export default NoteIndexPage;
