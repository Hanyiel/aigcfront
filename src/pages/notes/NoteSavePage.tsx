import { useState } from 'react';
import { Layout, Card, List, Checkbox, Button, Upload, Row, Col } from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  FileImageOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  TagsOutlined,
  SoundOutlined
} from '@ant-design/icons';
import '../../styles/notes/NoteSavePage.css';
const mockImages = [
  { id: '1', name: 'architecture.jpg', url: 'placeholder-1.jpg', timestamp: Date.now() },
  { id: '2', name: 'technology.jpg', url: 'placeholder-2.jpg', timestamp: Date.now() - 86400000 },
];

const NewStoragePage = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [saveOptions, setSaveOptions] = useState<string[]>([]);

  const handleUpload = (file: File) => {
    console.log('Upload file:', file);
    return false;
  };

  const renderPreviewContent = (option: string) => {
    const contentMap: Record<string, { icon: React.ReactNode; text: string; placeholder: string }> = {
      summary: {
        icon: <FileTextOutlined />,
        text: '保存摘要',
        placeholder: '摘要内容将在勾选后显示'
      },
      mindmap: {
        icon: <ApartmentOutlined />,
        text: '保存思维导图',
        placeholder: '思维导图将在勾选后生成'
      },
      keywords: {
        icon: <TagsOutlined />,
        text: '保存关键词',
        placeholder: '关键词将在分析后显示'
      },
      lecture: {
        icon: <SoundOutlined />,
        text: '保存智能讲解',
        placeholder: '讲解内容将在生成后显示'
      }
    };

    return (
      <div className="option-block">
        <Checkbox value={option} style={{ width: '100%' }}>
          {contentMap[option].icon} {contentMap[option].text}
        </Checkbox>
        <div className="preview-content">
          {saveOptions.includes(option) ? (
            <div className="preview-active">
              {option === 'summary' && '这里是自动生成的摘要文本预览...'}
              {option === 'mindmap' && '[思维导图占位区域]'}
              {option === 'keywords' && '关键词1, 关键词2, 关键词3'}
              {option === 'lecture' && '这里是智能讲解文本的预览内容...'}
            </div>
          ) : (
            <div className="preview-placeholder">
              {contentMap[option].icon} {contentMap[option].placeholder}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout className="storage-layout">
      <Row gutter={24} className="full-height-row">
        {/* 左侧设置面板 */}
        <Col flex="auto" className="preview-col">
          <Card
            title="内容设置"
            className="settings-card"
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => console.log('保存逻辑')}
              >
                保存配置
              </Button>
            }
          >
            {/* 大图预览 */}
            {selectedImage && (
              <div className="main-preview">
                <img
                  src={selectedImage.url}
                  alt="主预览"
                  className="preview-image"
                />
              </div>
            )}

            {/* 保存选项 */}
            <div className="options-section">
              <Checkbox.Group
                value={saveOptions}
                onChange={values => setSaveOptions(values as string[])}
                className="save-options"
              >
                {['summary', 'mindmap', 'keywords', 'lecture'].map(option =>
                  renderPreviewContent(option)
                )}
              </Checkbox.Group>
            </div>
          </Card>
        </Col>

        {/* 右侧图片列表 */}
        <Col flex="500px" className="image-col">
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
              dataSource={mockImages}
              renderItem={(item) => (
                <List.Item
                  className={`list-item ${selectedImage?.id === item.id ? 'selected' : ''}`}
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
    </Layout>
  );
};

export default NewStoragePage;
