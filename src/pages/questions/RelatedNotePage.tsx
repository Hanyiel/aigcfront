import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    List,
    Tag,
    Upload,
    Button,
    Image,
    Spin,
    Typography,
    Collapse,
    Empty, message
} from 'antd';
import {
    UploadOutlined,
    FileTextOutlined,
    QuestionCircleOutlined,
    LinkOutlined, ApartmentOutlined, FileImageOutlined
} from '@ant-design/icons';
import { useQuestionImageContext } from '../../contexts/QuestionImageContext';
import {RelatedData, useRelatedNote} from '../../contexts/RelatedNoteContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/questions/RelatedNotePage.css';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const RelatedNotePage = () => {
    const navigate = useNavigate();
    const {
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile
    } = useQuestionImageContext();
    const {
        saveRelatedNotes,
        getRelatedNotesByImage,
        updateRelatedNotes
    } = useRelatedNote();
    const { isAuthenticated } = useAuth();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [currentRelatedData, setCurrentRelatedData] = useState<RelatedData | null >(null);
    const [loading, setLoading] = useState(false);
    const uploadRef = useRef<HTMLInputElement>(null);

    // 监听选择的图片变化
    useEffect(() => {
        if (selectedImage) {
            // 根据图片ID获取关联数据
            const relatedData = getRelatedNotesByImage(selectedImage.id);
            setCurrentRelatedData(relatedData);
        } else {
            // 没有选择图片时清空当前数据
            setCurrentRelatedData(null);
        }
    }, [selectedImage, getRelatedNotesByImage]);

    const handleUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            message.error('仅支持图片文件');
            return false;
        }
        addImage(file);
        return false;
    };

    const handleSearchRelated = async () => {
        if (!selectedImage) {
            message.warning('请先选择图片');
            return;
        }

        const file = getImageFile(selectedImage.id);
        if (!file) {
            message.error('图片文件不存在');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://localhost:8000/api/questions/relate', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '获取关联数据失败');
            }

            const responseData = await response.json();
            const result = responseData.data;
            console.log('result', result);

            // 保存数据到Context
            saveRelatedNotes(selectedImage.id, result);
            setCurrentRelatedData(result);
            message.success('成功获取关联数据');
        } catch (err) {
            message.error(err instanceof Error ? err.message : '获取关联数据失败');
        } finally {
            setLoading(false);
        }
    };

    const renderToolbar = () => (
        <div className="toolbar">
            <Button
                type="primary"
                onClick={handleSearchRelated}
                loading={loading}
                disabled={!selectedImage}
            >
                查找相关资源
            </Button>
        </div>
    );

    const renderRelatedResourceEditor = () => {
        return (
            <Spin spinning={loading} tip="正在查找关联内容...">
                {currentRelatedData ? (
                    <div className="related-content">
                        {/* 知识点图谱 */}
                        <div className="knowledge-graph">
                            <Title level={4}><LinkOutlined/> 知识图谱关联</Title>
                            <div className="tags">
                                {currentRelatedData.knowledge_graph.map((kg, index) => (
                                    <Tag key={index} color="geekblue">{kg}</Tag>
                                ))}
                            </div>
                        </div>

                        {/* 相关笔记 */}
                        <Collapse defaultActiveKey={['notes']} ghost>
                            <Panel header={<>
                                <FileTextOutlined/> 关联笔记（{currentRelatedData.related_notes.length}）</>}
                                   key="notes">
                                <List
                                    itemLayout="vertical"
                                    dataSource={currentRelatedData.related_notes}
                                    renderItem={note  => (
                                        <List.Item className="note-item">
                                            <div className="note-header">
                                                <Tag color="blue">{note.subject}</Tag>
                                                <Title level={5}>{note.title}</Title>
                                            </div>
                                            <Text className="related-note-content">
                                                {typeof note.content === 'string'
                                                    ? note.content
                                                    : JSON.stringify(note.content)}
                                            </Text>
                                            <div className="note-points">
                                                {note.point.map((p, i) => (
                                                    <Tag key={i} color="cyan">{p}</Tag>
                                                ))}
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Panel>
                        </Collapse>
                    </div>
                ) : (
                    <Empty description="选择图片后查询关联内容"/>
                )}
            </Spin>
        )
    }

    return (
        <div className="sub-container">
            <Row gutter={24} className="sub-row">
                <Col flex="auto" className="sub-col">
                    <div className="tool-section">
                        <Title level={3} className="tool-title">
                            <ApartmentOutlined/> 相关学习资料
                        </Title>
                        {renderToolbar()}
                    </div>
                    <div
                        className="content-card"
                    >
                        {renderRelatedResourceEditor()}
                    </div>
                </Col>

                {/* 右侧图片列表 */}
                <Col xs={24} md={10} lg={8}>
                    <Card
                        title="图片列表"
                        className="question-image-list-card"
                        extra={
                            <Upload
                                beforeUpload={handleUpload}
                                showUploadList={false}
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined/>}>上传图片</Button>
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
                                    <div className="question-thumbnail-wrapper">
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="question-thumbnail"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage(item.url);
                                            }}
                                            style={{cursor: 'pointer'}}
                                        />
                                        <FileImageOutlined
                                            className="question-file-icon"
                                            style={item.has_saved
                                                ? {backgroundColor: 'mediumseagreen'}
                                                : {backgroundColor: 'darkorange'}}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage(item.url);
                                            }}
                                        />
                                    </div>
                                    <div className="question-image-info">
                                        <span className="question-image-name">
                                            {item.name.length > 20 ? item.name.substring(0, 20)+"..." : item.name}
                                        </span>
                                        <span className="question-image-date">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
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

export default RelatedNotePage;
