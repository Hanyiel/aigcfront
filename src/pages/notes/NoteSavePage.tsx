import React, { useState, useContext } from 'react';
import { Tag, Card, List, Checkbox, Button, Image, Row, Col, Typography, message } from 'antd';
import {
    SaveOutlined,
    FileTextOutlined,
    ApartmentOutlined,
    TagsOutlined,
    SoundOutlined
} from '@ant-design/icons';
import {
    ImageContextType, useImageContext,
} from '../../contexts/ImageContext';
import '../../styles/notes/NoteSavePage.css';
import {useExtract} from "../../contexts/ExtractContext";
import {useMindMapContext} from "../../contexts/MindMapContext";
import {useKeywords} from "../../contexts/NoteKeywordsContext";
import {useExplanation} from "../../contexts/ExplanationContext";
import LatexRenderer from "../../components/LatexRenderer";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Text } = Typography;

interface NoteSaveResponse {
    code: number;
    message: string;
    data: {
        note_id: string;
        storage_status: string;
    };
    timestamp: number;
}
interface NoteData {
    note_id: string;
    storage_status: string;
}
const NoteSavePage = () => {
    // Context hooks
    const {
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile
    } = useImageContext();
    const { getExtractByImage } = useExtract();
    const { currentMindMap } = useMindMapContext();
    const { getKeywordsByImage } = useKeywords();
    const { getExplanationByImage } = useExplanation();
    const [loading, setloading] = useState(false)
    // Local state
    const [saveOptions, setSaveOptions] = useState<Record<string, boolean>>({
        summary: true,
        mindmap: false,
        knowledge: false,
        lecture: false
    });

    // 获取当前内容数据
    const currentExtract = selectedImage ? getExtractByImage(selectedImage.id) : undefined;
    const currentKeywords = selectedImage ? getKeywordsByImage(selectedImage.id) : [];
    const currentExplanation = selectedImage ? getExplanationByImage(selectedImage.id) : undefined;

    // 处理保存操作
    const handleSave = async () => {
        if (!selectedImage) {
            message.warning('请选择需要保存的图片');
            return;
        }
        try {
            setloading(true)
            const formData = new FormData();
            const image = getImageFile(selectedImage.id);
            if (!image) {
                message.error('图片数据获取失败');
                return;
            }
            formData.append('image', image);
            if(!image)
                formData.append('options', JSON.stringify(saveOptions));

            const { data } = await saveNoteToAPI(formData);

            message.success(`笔记保存成功！ID: ${data.note_id}`);
            setloading(false)
        } catch (err) {
            setloading(false);
            const errorMessage = err instanceof Error ? err.message : '未知错误';
            message.error(`保存失败: ${errorMessage}`);
        }
    };
    const saveNoteToAPI = async (formData: FormData): Promise<NoteSaveResponse> => {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:8000/api/notes/record', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        // 处理网络层错误
        if (!response.ok) {
            throw new Error(`HTTP错误 ${response.status}`);
        }
        // 解析响应数据
        const result = await response.json();
        console.log('完整响应:', result);
        const data = result.data;
        console.log('笔记数据:', data);
        // 处理业务逻辑错误（code非200情况）
        if (result.code !== 200) {
            throw new Error(result.message || '服务器返回未知错误');
        }
        return result;
    };
// 渲染预览内容
    const renderPreviewContent = (type: string) => {
        if (!saveOptions[type]) return null;

        switch (type) {
            case 'summary':
                return currentExtract ? (
                    <div className="preview-section">
                        <Text className="preview-title">摘要内容</Text>
                        <div className="preview-content"><LatexRenderer content={currentExtract.text_content} /></div>
                    </div>
                ) : <Text type="secondary">未找到相关摘要内容</Text>;

            case 'mindmap':
                return currentMindMap?.svgUrl ? (
                    <div className="preview-section">
                        <Text className="preview-title">思维导图预览</Text>
                        <img src={currentMindMap.svgUrl} alt="思维导图" className="mindmap-preview" />
                    </div>
                ) : <Text type="secondary">未生成思维导图</Text>;

            case 'knowledge':
                return currentKeywords.length > 0 ? (
                    <div className="preview-section">
                        <Text className="preview-title">关联知识点</Text>
                        <div className="keywords-list">
                            {currentKeywords.map((k, i) => (
                                <Tag key={i} color="processing">{k.term}</Tag>
                            ))}
                        </div>
                    </div>
                ) : <Text type="secondary">未检测到关键词</Text>;

            case 'lecture':
                return currentExplanation ? (
                    <div className="preview-section">
                        <Text className="preview-title">智能讲解</Text>
                        <div className="preview-content"><LatexRenderer content={currentExplanation.content_md} /></div>
                    </div>
                ) : <Text type="secondary">未生成讲解内容</Text>;

            default:
                return null;
        }
    };

    return (
        <Row gutter={24} className="note-save-container">
            {/* 左侧保存面板 */}
            <Col span={16} className="save-panel">
                <Card
                    title={selectedImage?.name || "请选择图片"}
                    extra={
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            disabled={!selectedImage}
                            loading={loading}
                        >
                            保存笔记
                        </Button>
                    }
                >
                    {selectedImage && (
                        <>
                            {/* 主图预览 */}
                            <div className="main-preview">
                                <Image
                                    src={selectedImage.url}
                                    alt="主预览"
                                    className="preview-image"
                                />
                            </div>

                            {/* 保存选项 */}
                            <div className="save-options">
                                <Checkbox.Group
                                    value={Object.keys(saveOptions).filter(k => saveOptions[k])}
                                    onChange={values => {
                                        const newOptions = { ...saveOptions };
                                        Object.keys(newOptions).forEach(k => {
                                            newOptions[k] = values.includes(k);
                                        });
                                        setSaveOptions(newOptions);
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Checkbox value="summary">
                                                <FileTextOutlined /> 保存摘要
                                            </Checkbox>
                                        </Col>
                                        <Col span={6}>
                                            <Checkbox value="mindmap">
                                                <ApartmentOutlined /> 思维导图
                                            </Checkbox>
                                        </Col>
                                        <Col span={6}>
                                            <Checkbox value="knowledge">
                                                <TagsOutlined /> 知识点
                                            </Checkbox>
                                        </Col>
                                        <Col span={6}>
                                            <Checkbox value="lecture">
                                                <SoundOutlined /> 智能讲解
                                            </Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                            </div>

                            {/* 内容预览区 */}
                            <div className="content-previews">
                                <Text type="secondary">预览内容：</Text>
                                <Text type="secondary">

                                    {Object.keys(saveOptions).map(type =>
                                    saveOptions[type] && renderPreviewContent(type)
                                )}
                                </Text>

                            </div>
                        </>
                    )}
                </Card>
            </Col>

            {/* 右侧图片列表 */}
            <Col span={8} className="image-list-col">
                <Card className="image-list-card" bodyStyle={{ padding: 0 }}>
                    <List
                        dataSource={images}
                        renderItem={item => (
                            <List.Item
                                className={`list-item ${selectedImage?.id === item.id ? 'selected' : ''}`}
                                onClick={() => setSelectedImage(item)}
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

export default NoteSavePage;
