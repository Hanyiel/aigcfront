// 更新后的IndexPage组件（在QuestionPage.tsx中）
import { useState } from 'react';
import {Row, Col, Card, List, Upload, Tag, Progress, message, Button} from 'antd';
import {
  UploadOutlined,
} from '@ant-design/icons';
import QuestionPage from "./QuetionPage";
export const QuestionIndexPage = () => {
  const [previewImage, setPreviewImage] = useState<string>();
  const [questions, setQuestions] = useState([
    {
      id: 1,
      title: '二次函数综合题',
      subject: '数学',
      difficulty: 3,
      status: '已解析',
      date: '2024-03-15'
    },
    {
      id: 2,
      title: '电磁感应定律应用',
      subject: '物理',
      difficulty: 4,
      status: '待批改',
      date: '2024-03-14'
    }
  ]);

  // 处理图片上传
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      // TODO: 调用题目识别接口
      message.success('图片上传成功，开始识别题目...');
    };
    return false;
  };

  return (
    <Row gutter={24} className="index-container">
      {/* 左侧图片处理区 */}
      <Col xs={24} md={12} className="upload-panel">
        <Card title="题目识别" bordered={false}>
          <Upload.Dragger
            accept="image/*"
            showUploadList={false}
            beforeUpload={beforeUpload}
            className="image-uploader"
          >
            {previewImage ? (
              <div className="preview-wrapper">
                <img src={previewImage} alt="题目预览" className="preview-image" />
                <div className="preview-mask">
                  <p>点击更换图片</p>
                </div>
              </div>
            ) : (
              <>
                <p className="upload-icon">
                  <UploadOutlined style={{ fontSize: 48 }} />
                </p>
                <p className="upload-text">拖拽或点击上传题目图片</p>
                <p className="upload-hint">支持格式：JPG/PNG，最大5MB</p>
              </>
            )}
          </Upload.Dragger>

          <div className="analysis-progress">
            <Progress
              percent={previewImage ? 40 : 0}
              status="active"
              strokeColor={{ from: '#108ee9', to: '#87d068' }}
            />
            <p className="progress-text">
              {previewImage ? '正在解析题目内容...' : '等待上传题目图片'}
            </p>
          </div>
        </Card>
      </Col>

      {/* 右侧题目列表区 */}
      <Col xs={24} md={12} className="question-list-panel">
        <Card title="历史题目" bordered={false}>
          <List
            itemLayout="horizontal"
            dataSource={questions}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="detail">查看详情</Button>,
                  <Button key="delete" style={{ color: '#ff4d4f' }}>删除</Button>
                ]}
              >
                <List.Item.Meta
                  title={<span className="question-title">{item.title}</span>}
                  description={
                    <>
                      <Tag color="blue">{item.subject}</Tag>
                      <span className="difficulty">
                        难度：{Array(item.difficulty).fill('★').join('')}
                      </span>
                    </>
                  }
                />
                <div className="question-status">
                  <Tag color={item.status === '已解析' ? 'green' : 'orange'}>
                    {item.status}
                  </Tag>
                  <span className="date">{item.date}</span>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default QuestionIndexPage;
