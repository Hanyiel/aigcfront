import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import {
  Row,
  Col,
  Card,
  List,
  Tag,
  Alert,
  Typography,
  Spin,
  Empty,
  Upload,
  Button,
  Image,
  message,
  Input
} from 'antd';
import {
    CodeOutlined,
    SolutionOutlined,
    BulbOutlined,
    UploadOutlined,
    PlayCircleOutlined,
    ApartmentOutlined,
    EditOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { useQuestionExplanationContext } from '../../contexts/QuestionExplanationContext';
import { useQuestionImageContext } from '../../contexts/QuestionImageContext';
import '../../styles/questions/QuestionExplanationPage.css';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { QuestionExplanation } from "../../contexts/QuestionExplanationContext";
const { Title, Text } = Typography;
const { TextArea } = Input;

const QuestionExplanationPage = () => {
    const {
        explanations,
        currentExplanation,
        generating,
        error,
        generateExplanation,
        getExplanationByImage,
        updateExplanation
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

    // 编辑状态
    const [isEditing, setIsEditing] = useState(false);
    const [editingText, setEditingText] = useState('');
    const [currentExplanationForImage, setCurrentExplanationForImage] = useState<QuestionExplanation | null>(null);

    // 当选中图片变化时，更新讲解内容
    useEffect(() => {
        if (selectedImage) {
            // 获取当前图片对应的讲解
            const explanation = getExplanationByImage(selectedImage.id);
            setCurrentExplanationForImage(explanation || null);

            if (explanation) {
                setEditingText(explanation.contentMd);
            } else {
                setEditingText('');
            }
        } else {
            setCurrentExplanationForImage(null);
            setEditingText('');
        }
        setIsEditing(false); // 切换图片时退出编辑模式
    }, [selectedImage, getExplanationByImage]);

    // 当生成新讲解时更新当前图片的讲解
    useEffect(() => {
        if (currentExplanation && selectedImage && currentExplanation.imageId === selectedImage.id) {
            setCurrentExplanationForImage(currentExplanation);
            setEditingText(currentExplanation.contentMd);
        }
    }, [currentExplanation, selectedImage]);

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

    // 切换编辑模式
    const toggleEditMode = () => {
        if (isEditing) {
            // 保存编辑内容
            if (currentExplanationForImage) {
                updateExplanation(currentExplanationForImage.id, editingText);
                // 更新本地状态
                setCurrentExplanationForImage({
                    ...currentExplanationForImage,
                    contentMd: editingText
                });
                message.success('内容已保存');
            }
        }
        setIsEditing(!isEditing);
    };

    // 处理文本编辑变化
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingText(e.target.value);
    };

    const renderExplanationContent = () => {
        if (error) {
            return <Alert message="生成错误" description={error} type="error" showIcon/>;
        }

        if (generating) {
            return (
                <div className="loading-container">
                    <Spin tip="AI正在生成讲解..." size="large" />
                </div>
            );
        }

        if (!currentExplanationForImage) {
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
            <div className="explanation-content">
                {isEditing ? (
                    <TextArea
                        autoSize={{ minRows: 15, maxRows: 25 }}
                        value={editingText}
                        onChange={handleTextChange}
                        className="editing-textarea"
                    />
                ) : (
                    <div className="explanation-markdown">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {currentExplanationForImage.contentMd}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        );
    }

    const renderToolbar = () => (
        <div className="toolbar">
            <Button
                type={isEditing ? "default" : "primary"}
                icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                onClick={toggleEditMode}
                // disabled={!currentExplanationForImage}
            >
                {isEditing ? '保存内容' : '编辑模式'}
            </Button>
            <Button
                type="primary"
                icon={<PlayCircleOutlined/>}
                loading={generating}
                onClick={() => selectedImage && generateExplanation(selectedImage.id, selectedImage.file)}
                disabled={!selectedImage}
            >
                生成讲解
            </Button>
        </div>
    );

    const renderExplanationEditor = () => {
        return renderExplanationContent();
    }

    return (
        <div className="sub-container">
            <Row gutter={24} className="sub-row">
                <Col flex="auto" className="sub-col">
                    <div className="tool-section">
                        <Title level={3} className="tool-title">
                            <ApartmentOutlined/> 智能讲解
                        </Title>
                        {renderToolbar()}
                    </div>
                    <div
                        className="content-card"
                    >
                        {renderExplanationEditor()}
                    </div>
                </Col>

                {/* 右侧图片列表 */}
                <Col xs={24} md={10} lg={8}>
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
        </div>
    );
};

export default QuestionExplanationPage;
