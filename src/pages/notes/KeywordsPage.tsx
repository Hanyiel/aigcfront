import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import {Button, Card, Row, Col, List, Tag, Upload, Spin, message, Input, Typography} from 'antd';
import {
    CloseOutlined,
    EditOutlined,
    SaveOutlined,
    UploadOutlined,
    FileImageOutlined,
    LinkOutlined,
    PlusOutlined, ApartmentOutlined
} from '@ant-design/icons';
import { useImageContext } from '../../contexts/ImageContext';
import '../../styles/notes/KeywordsPage.css';
import { useKeywords } from "../../contexts/NoteKeywordsContext";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;


// 修正接口定义以匹配上下文
interface Keyword {
    term: string;
    tfidfScore: number; // 修正为 tfidfScore
    subject?: string;
    relatedNotes?: string[];
    relatedQuestions?: string[];
}

const KeywordsPage = () => {
    const navigate = useNavigate();
    const {
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile
    } = useImageContext();
    const {
        saveKeywords,
        getKeywordsByImage,
        updateKeywords // 从上下文中获取更新函数
    } = useKeywords();
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(false);
    const [ocrTexts, setOcrTexts] = useState<Record<string, string>>({});
    const uploadRef = useRef<HTMLInputElement>(null);
    const { isAuthenticated } = useAuth();

    // 编辑状态
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newKeywordText, setNewKeywordText] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // 监听选中的图片变化，更新关键词列表
    useEffect(() => {
        if (selectedImage) {
            const kws = getKeywordsByImage(selectedImage.id) || [];
            setKeywords(kws);
        } else {
            setKeywords([]);
        }
        // 切换图片时退出编辑状态
        setIsEditing(false);
        setEditingIndex(null);
        setIsAdding(false);
    }, [selectedImage, getKeywordsByImage]);

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

    const handleExtractKeywords = async () => {
        const token = localStorage.getItem('authToken');

        if (!selectedImage) {
            message.warning('请先选择图片');
            return;
        }
        try {
            setLoading(true);
            const imageFile = getImageFile(selectedImage.id);
            if (!imageFile) {
                message.error('图片文件不存在');
                return;
            }
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('max_keywords', '5');
            const response = await fetch('http://localhost:8000/api/notes/keywords', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP错误 ${response.status}`);
            }
            const result = await response.json();
            const data = result.data;
            if (!result.data?.keywords) {
                throw new Error('返回数据格式异常');
            }
            // 转换数据结构以匹配上下文
            const extractedKeywords: Keyword[] = data.keywords.map((k: any) => ({
                term: k.term,
                tfidfScore: Number(k.tfidf_score),
                subject: data.subject,
                relatedNotes: [],
                relatedQuestions: []
            }));
            saveKeywords(selectedImage.id, extractedKeywords);
            setKeywords(extractedKeywords);
            message.success(`提取到${extractedKeywords.length}个关键词`);
        } catch (err) {
            console.error('提取错误详情:', err);
            message.error(err instanceof Error ? err.message : '未知错误');
        } finally {
            setLoading(false);
        }
    };

    // 切换编辑模式
    const toggleEditMode = () => {
        if (isEditing) {
            // 保存所有更改
            if (selectedImage) {
                updateKeywords(selectedImage.id, keywords); // 使用更新函数
                message.success('关键词已保存');
            }
        }
        setIsEditing(!isEditing);
        setEditingIndex(null);
        setIsAdding(false);
    };

    // 开始编辑关键词
    const startEditing = (index: number, term: string) => {
        if (!isEditing) return;
        setEditingIndex(index);
        setEditingText(term);
    };

    // 完成关键词编辑
    const finishEditing = (index: number) => {
        if (editingText.trim()) {
            const updatedKeywords = [...keywords];
            updatedKeywords[index] = {
                ...updatedKeywords[index],
                term: editingText
            };
            setKeywords(updatedKeywords);
        }
        setEditingIndex(null);
    };

    // 处理关键词文本变化
    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingText(e.target.value);
    };

    // 处理新关键词文本变化
    const handleNewKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewKeywordText(e.target.value);
    };

    // 添加新关键词
    const addNewKeyword = () => {
        if (!selectedImage) {
            message.warning('请先选择图片');
            return;
        }

        if (!isAdding) {
            setIsAdding(true);
            setNewKeywordText('');
        } else if (newKeywordText.trim()) {
            const newKeyword: Keyword = {
                term: newKeywordText.trim(),
                tfidfScore: 0.05,
                relatedNotes: [],
                relatedQuestions: []
            };
            const updatedKeywords = [...keywords, newKeyword];
            setKeywords(updatedKeywords);
            setIsAdding(false);
        }
    };

    // 删除关键词
    const handleDeleteKeyword = (index: number) => {
        if (!selectedImage) return;

        const updatedKeywords = [...keywords];
        updatedKeywords.splice(index, 1);
        setKeywords(updatedKeywords);

        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };

    // 保存新关键词
    const saveNewKeyword = () => {
        if (newKeywordText.trim()) {
            const newKeyword: Keyword = {
                term: newKeywordText.trim(),
                tfidfScore: 0.05,
                relatedNotes: [],
                relatedQuestions: []
            };
            const updatedKeywords = [...keywords, newKeyword];
            setKeywords(updatedKeywords);
        }
        setIsAdding(false);
    };

    const renderKeywordsEditor = () => {
        return (
            <div className="keywords-list">
                {keywords.map((k, i) => (
                    <div
                        key={i}
                        className="keyword-tag-wrapper"
                        onDoubleClick={() => startEditing(i, k.term)}
                    >
                        {editingIndex === i ? (
                            <Input
                                autoFocus
                                value={editingText}
                                onChange={handleKeywordChange}
                                onPressEnter={() => finishEditing(i)}
                                onBlur={() => finishEditing(i)}
                                size="small"
                                style={{width: 120}}
                            />
                        ) : (
                            <Tag
                                color={i % 2 ? 'geekblue' : 'cyan'}
                                className="keyword-tag"
                            >
                                {k.term}
                                <span className="score">({(k.tfidfScore * 100).toFixed(1)}%)</span>
                            </Tag>
                        )}
                        {isEditing && editingIndex !== i && (
                            <Button
                                type="text"
                                danger
                                icon={<CloseOutlined/>}
                                className="delete-keyword-btn"
                                onClick={() => handleDeleteKeyword(i)}
                            />
                        )}
                    </div>
                ))}

                {isEditing && (
                    <div className="add-keyword-container">
                        {isAdding ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <Input
                                    autoFocus
                                    value={newKeywordText}
                                    onChange={handleNewKeywordChange}
                                    onPressEnter={saveNewKeyword}
                                    onBlur={saveNewKeyword}
                                    size="small"
                                    placeholder="输入新关键词"
                                    style={{width: 120}}
                                />
                            </div>
                        ) : (
                            <Button
                                type="dashed"
                                icon={<PlusOutlined/>}
                                size="small"
                                onClick={addNewKeyword}
                            >
                                添加关键词
                            </Button>
                        )}
                    </div>
                )}
            </div>
        )
    }

    const renderToolbar = () => {
        return (
            <div className="toolbar">
                <Button
                    type={isEditing ? 'primary' : 'default'}
                    icon={isEditing ? <SaveOutlined/> : <EditOutlined/>}
                    onClick={toggleEditMode}
                    // disabled={!selectedImage}
                >
                    {isEditing ? '保存编辑' : '编辑模式'}
                </Button>
                <Button
                    type="primary"
                    onClick={handleExtractKeywords}
                    loading={loading}
                >
                    提取关键词
                </Button>
            </div>
        )
    }

    return (
        <div className="sub-container">
            <Row gutter={24} className="sub-row">
                <Col flex="auto" className="sub-col">
                    <div className="tool-section">
                        <Title level={3} className="tool-title">
                            <ApartmentOutlined/> 关键词提取
                        </Title>
                        {renderToolbar()}
                    </div>
                    <div
                        className="content-card"
                    >
                        {renderKeywordsEditor()}
                    </div>
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
                                                setOcrTexts(prev => {
                                                    const newTexts = {...prev};
                                                    delete newTexts[item.id];
                                                    return newTexts;
                                                });
                                            }}
                                        >
                                            删除
                                        </Button>
                                    }
                                >
                                    <div className="thumbnail-wrapper">
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="thumbnail"
                                        />
                                        <FileImageOutlined className="file-icon"/>
                                    </div>
                                    <div className="image-info">
                                        <span className="image-name">{item.name}</span>
                                        <span className="image-date">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                                        {ocrTexts[item.id] && (
                                            <span className="text-indicator">
                        <LinkOutlined/> 已解析文本
                      </span>
                                        )}
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
