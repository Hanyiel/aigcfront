// src/pages/grading/AutoGradePage.tsx
import React, {useEffect, useRef, useState} from 'react';
import {
  Row,
  Col,
  Card,
  List,
  Tag,
  Progress,
  Collapse,
  Typography,
  Spin,
  Alert,
  Empty,
  Upload,
  Button,
  Image,
  message,
  Badge,
  Space
} from 'antd';
import { CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  InboxOutlined,
  UploadOutlined,
  QuestionCircleFilled,
  EditOutlined,
  WarningOutlined,
  ReadOutlined,
  TagOutlined
} from '@ant-design/icons';
import {GradingResult, useAutoGrade} from '../../contexts/AutoGradeContext';
import { useImageContext } from '../../contexts/ImageContext';
import type { UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../../styles/questions/AutoGradePage.css';
import {useQuestionImageContext} from "../../contexts/QuestionImageContext";
import {useAuth} from "../../contexts/AuthContext";
import {QuestionExtractData} from "../../contexts/QuestionExtractContext";
import LatexRenderer from "../../components/LatexRenderer";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Dragger } = Upload;

const AutoGradePage = () => {
  const navigate = useNavigate();
  const {
    currentGrading,
    loading,
    submitForGrading,
  } = useAutoGrade();
  const {
    images,
    addImage,
    removeImage,
    selectedImage,
    setSelectedImage,
    getImageFile
  } = useQuestionImageContext();
  const [overallScore, setOverallScore] = useState(0);
  const {isAuthenticated, logout} = useAuth();
  const [result, setResult] = useState<GradingResult | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);


  // 图片上传处理
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

  const handleGrade = async () => {
    if (!selectedImage) {
      message.warning('请选择需要解析的图片');
      return;
    }
    try {
      const file = getImageFile(selectedImage.id);
      if (!file) {
        message.error('图片数据获取失败');
        return;
      }
      // 使用context中的submit方法
      await submitForGrading(file, selectedImage.id);

    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          logout();
          navigate('/login');
          return;
        }
        message.error(err.message);
      }
    }
  };
  const getStatusConfig = (code: number) => {
    switch (code) {
      case 0:
        return {
          icon: <CloseCircleFilled className="status-icon"/>,
          text: '答案错误',
          color: '#ff4d4f',
          description: '存在关键性错误需要订正'
        };
      case 1:
        return {
          icon: <WarningFilled className="status-icon"/>,
          text: '部分正确',
          color: '#faad14',
          description: '部分答案符合要求'
        };
      case 2:
        return {
          icon: <CheckCircleFilled className="status-icon"/>,
          text: '答案正确',
          color: '#52c41a',
          description: '完全符合标准答案'
        };
      default:
        return {
          icon: <QuestionCircleFilled className="status-icon"/>,
          text: '未知状态',
          color: '#bfbfbf',
          description: '未能识别的批改状态'
        };
    }

  };
  const safeArray = (arr: any[] | undefined) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(item => item !== undefined && item !== null);
  };

  // 渲染答案块
  const renderAnswerBlock = (title: string, answers: any[]) => {
    const validAnswers = safeArray(answers);
    return (
        <div className="answer-section">
          <div className="answer-title">
            <Text strong>{title}</Text>
          </div>
          <div className="answer-content">
            {validAnswers.length > 0 ? (
                validAnswers.map((answer, idx) => (
                    <Tag key={idx} className="answer-tag">
                      <LatexRenderer content={answer} />
                    </Tag>
                ))
            ) : (
                <Text type="secondary">无内容</Text>
            )}
          </div>
        </div>
    );
  };

  return (
      <Row gutter={24} className="grade-container">
        {/* 左侧批改详情 */}
        <Col xs={24} md={14} lg={16} className="grading-panel">
          <Card
              title="智能批改报告"
              extra={
                <div className="header-actions">
                  <Button
                      type="primary"
                      onClick={handleGrade}
                      disabled={!selectedImage}
                      loading={loading}
                  >
                    立即批改
                  </Button>
                </div>
              }
          >
            <Spin spinning={loading} tip="正在智能批改...">
              {currentGrading ? (
                  <div className="grading-detail">
                    {/* 状态标识增强 */}
                    <div className="status-header" style={{
                      background: `linear-gradient(15deg, ${getStatusConfig(currentGrading.code).color}10, #ffffff)`,
                      borderLeft: `4px solid ${getStatusConfig(currentGrading.code).color}`
                    }}>
                      <div className="status-icon-wrapper">
                        {getStatusConfig(currentGrading.code).icon}
                      </div>
                      <div className="status-info">
                        <Title
                            level={3}
                            style={{ color: getStatusConfig(currentGrading.code).color, margin: 0 }}
                        >
                          {getStatusConfig(currentGrading.code).text}
                        </Title>
                        <Text type="secondary">
                          {getStatusConfig(currentGrading.code).description}
                        </Text>
                      </div>
                      {currentGrading.score !== undefined && (
                          <div className="score-badge">
                            <Text strong style={{ fontSize: 24 }}>
                              {currentGrading.score}
                            </Text>
                            <Text type="secondary">分</Text>
                          </div>
                      )}
                    </div>
                    {/* 答案对比重构 */}
                    <Collapse defaultActiveKey={['answers']} ghost>
                      <Panel header={<><EditOutlined /> 答案对比分析</>} key="answers">
                        <div className="answer-compare">
                          {renderAnswerBlock('你的答案', currentGrading.your_answer)}
                          {renderAnswerBlock('参考答案', currentGrading.correct_answer)}
                        </div>
                      </Panel>
                    </Collapse>
                    {/* 错误分析优化 */}
                    {currentGrading.code !== 2 && (
                        <Collapse defaultActiveKey={['errors']} ghost>
                          <Panel header={<><WarningOutlined /> 错误分析</>} key="errors">
                            <div className="error-analysis">
                              {safeArray(currentGrading.error_analysis).length > 0 ? (
                                  <div className="error-analysis">
                                    {safeArray(currentGrading.error_analysis).map((item, idx) => (
                                        <div key={idx} className="analysis-item">
                                          <WarningOutlined className="warning-icon" />
                                          <span><ReactMarkdown
                                              remarkPlugins={[remarkMath]}
                                              rehypePlugins={[rehypeKatex]}
                                          >
                                            {item}
                                          </ReactMarkdown>
                                          </span>
                                        </div>
                                    ))}
                                  </div>
                              ) : (
                                  <Alert message="本次批改未记录具体错误信息" type="info" showIcon />
                              )}
                            </div>
                          </Panel>
                        </Collapse>
                    )}
                    {/* 知识点展示优化 */}
                    <Collapse defaultActiveKey={['knowledge']} ghost>
                      <Panel header={<><ReadOutlined /> 关联知识点</>} key="knowledge">
                        <div className="knowledge-points">
                          {safeArray(currentGrading.knowledge_point).length > 0 ? (
                              <Space size={[8, 16]} wrap>
                                {safeArray(currentGrading.knowledge_point).map((kp, index) => (
                                    <Tag
                                        key={index}
                                        icon={<TagOutlined />}
                                        color="geekblue"
                                        className="knowledge-tag"
                                    >
                                      <LatexRenderer content={kp} />
                                    </Tag>
                                ))}
                              </Space>
                          ) : (
                              <Alert message="未关联到知识点体系" type="info" showIcon />
                          )}
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
              ) : (
                  <Empty description="请先上传题目进行批改" imageStyle={{ height: 60 }} />
              )}
            </Spin>
          </Card>
        </Col>
        {/* 右侧图片列表 */}
        <Col xs={24} md={10} lg={8}>
          <Card
              title="图片列表"
              className="image-list-card"
              extra={
                <Upload
                    beforeUpload={handleUpload}
                    showUploadList={false}
                    accept="image/*"
                >
                  <Button icon={<UploadOutlined/>}>添加图片</Button>
                </Upload>
              }
          >
            <List
                dataSource={images}
                renderItem={(item) => (
                    <List.Item
                        className={`list-item ${
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
                      <div className="image-content">
                        <Image
                            src={item.url}
                            alt={item.name}
                            preview={false}
                            width={80}
                            height={60}
                            className="thumbnail"
                        />
                        <div className="image-info">
                          <Text ellipsis className="image-name">
                            {item.name}
                          </Text>
                          <Text type="secondary" className="image-date">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                )}
            />
          </Card>
        </Col>
      </Row>
  );
};

export default AutoGradePage;
