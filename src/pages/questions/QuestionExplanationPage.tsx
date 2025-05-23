// src/pages/questions/QuestionExplanationPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Row, Col, Card, List, Tag, Collapse, Alert, Typography, Spin, Empty, Upload, Button, Image, message } from 'antd';
import { CodeOutlined, SolutionOutlined, BulbOutlined, UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useQuestionExplanationContext } from '../../contexts/QuestionExplanationContext';
import { useQuestionImageContext } from '../../contexts/QuestionImageContext';
import LatexRenderer from '../../components/LatexRenderer';
import '../../styles/questions/QuestionExplanationPage.css';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const QuestionExplanationPage = () => {
    const {
        explanations,
        currentExplanation,
        loading,
        generating,
        error,
        addExplanation,
        generateExplanation,
        getExplanationByImage
    } = useQuestionExplanationContext();

    const {
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile,
        getExplanationId
    } = useQuestionImageContext();

    const uploadRef = useRef<HTMLInputElement>(null);

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

    const renderExplanationContent = () => {
        if (error) {
            return <Alert message="生成错误" description={error} type="error" showIcon/>;
        }
        if (currentExplanation?.contentMd) {
            return (
                <div className="explanation-markdown">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {currentExplanation.contentMd}
                    </ReactMarkdown>
                </div>
            );
        }
        return (
            <div className="empty-state">
                <Empty description={
                    <span>
            {selectedImage ? '点击生成讲解获取解析' : '请先选择题目图片'}
          </span>
                }/>
            </div>
        );
    }

    return (
        <Row gutter={24} className="question-container">
            {/* 左侧讲解区 */}
            <Col xs={24} md={16} className="explanation-panel">
                <Card
                    title={<><SolutionOutlined /> 题目深度解析</>}
                    extra={
                        <div className="action-buttons">
                            <Tag icon={<CodeOutlined />}>解题引擎 v1.2</Tag>
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                loading={generating}
                                onClick={() => selectedImage && generateExplanation(selectedImage.id, selectedImage.file)}
                            >
                                生成讲解
                            </Button>
                        </div>
                    }
                >
                    <Spin spinning={generating} tip="正在生成解析...">
                        <div className="explanation-content">
                            {renderExplanationContent()}
                        </div>
                    </Spin>
                </Card>
            </Col>

            {/* 右侧图片列表 */}
            <Col xs={24} md={8} className="image-list-panel">
                <Card
                    title="题目图片"
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
                                className={`list-item ${selectedImage?.id === item.id ? 'selected' : ''}`}
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
                                        {getExplanationId(item.id) && (
                                            <Tag color="green" className="explanation-tag">已生成解析</Tag>
                                        )}
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

export default QuestionExplanationPage;
