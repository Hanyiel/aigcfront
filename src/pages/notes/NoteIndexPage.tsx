// NoteIndexPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Button, Card, List, Modal, message, Row, Col } from 'antd';
import { InboxOutlined, RocketOutlined, KeyOutlined, BookOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useImageContext } from '../../contexts/ImageContext';
import '../../styles/notes/NoteIndexPage.css';

const { Dragger } = Upload;

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  timestamp: number;
}

const NoteIndexPage = () => {
  const {
    images,
    setImages,
    selectedImage,
    setSelectedImage
  } = useImageContext();
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();

  const uploadProps: UploadProps = {
    name: 'image',
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('仅支持图片文件上传');
        return false;
      }
      const url = URL.createObjectURL(file);
    const newImage = {
      id: Date.now().toString(),
      url: url,
      name: file.name,
      timestamp: Date.now(),
      _file: file // 保留文件引用
    };

    setImages(prev => [newImage, ...prev]);
    message.success(`${file.name} 上传成功（本地模式）`);

    return false; // 阻止默认上
    },
    // onChange: (info) => {
    //   const { file } = info;
    //   if (file.status === 'done') {
    //     const fileObj = file.originFileObj as File;
    //     const newImage = {
    //       id: Date.now().toString(),
    //       url: URL.createObjectURL(fileObj),
    //       name: file.name,
    //       timestamp: Date.now(),
    //       // 添加原始文件引用（可选）
    //       _file: fileObj
    //     };
    //     setImages(prev => [newImage, ...prev]);
    //     message.success(`${file.name} 上传成功`);
    //   }
    // },
  };

  const handleAction = (action: string) => {
    console.log('--- handleAction被触发 ---'); // 先确认函数是否被调用
    // 使用绝对路径映射
    const routeMap: Record<string, string> = {
      extract: '/notes/extract',       // 完整路径
      mindmap: '/notes/mind-map',      // 完整路径
      explanation: '/notes/explanation',
      save: '/notes/save-note'
    };
    if (!routeMap[action]) {
      message.error('功能暂未开放');
      return;
    }
    console.log('尝试跳转到：', routeMap[action]);

    navigate(routeMap[action], {
      state: { selectedImage },
      replace: false // 改为false保留浏览器历史记录
    });
  };

  const handleSelectImage = (item: UploadedImage) => {
    setSelectedImage(prev =>
      prev?.id === item.id ? null : item
    );
  }


  return (
      <div className="notes-page-container">
        {/* 保持原有布局结构不变 */}
        <Row gutter={24} className="main-layout">
          {/* 上传区域 */}
          <Col xs={24} md={8} lg={6}>
            <Card title="图片上传区" className="upload-card">
              <Dragger {...uploadProps} className="custom-uploader">
                <div className="upload-content">
                  <InboxOutlined className="upload-icon" />
                  <p className="upload-text">点击或拖拽文件到此处上传</p>
                  <p className="upload-hint">支持 JPG/PNG 格式</p>
                </div>
              </Dragger>
            </Card>
          </Col>

          {/* 图片列表 */}
          <Col xs={24} md={16} lg={18}>
            <Card title="图片列表" className="image-list-card">
              <List
                  grid={{ gutter: 16, column: 4 }}
                  dataSource={images}
                  renderItem={item => (
                      <List.Item>
                        <div
                            className={`image-card ${selectedImage?.id === item.id ? 'selected' : ''}`}
                            onClick={() => setSelectedImage(item)}
                        >
                          <img
                              src={item.url}
                              alt={item.name}
                              className="thumbnail-image"
                              onDoubleClick={() => setPreviewVisible(true)}
                          />
                          <div className="image-info">
                            <span className="image-name">{item.name}</span>
                            <span className="upload-time">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                          </div>
                        </div>
                      </List.Item>
                  )}
              />
            </Card>
          </Col>
        </Row>

        {/* 功能导航栏 */}
        <div className="function-nav">
          <Button
              type="primary"
              icon={<KeyOutlined />}
              onClick={() => {
                console.log('笔记提取按钮被点击'); // 直接测试点击事件
                handleAction('extract');
              }}
          >
            笔记提取
          </Button>
          <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={() => handleAction('mindmap')}
          >
            思维导图
          </Button>

          <Button
              type="primary"
              icon={<BookOutlined />}
              onClick={() => handleAction('explanation')}
          >
            智能讲解
          </Button>
          <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => handleAction('save')}
          >
            保存笔记
          </Button>
        </div>

        {/* 图片预览模态框 */}
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
      </div>
  );
};

export default NoteIndexPage;
