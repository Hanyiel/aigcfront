import React, { useState, useContext } from 'react';
import {Tag, Card, List, Checkbox, Button, Image, Row, Col, Typography, message, Upload} from 'antd';
import {
    SaveOutlined,
    FileTextOutlined,
    ApartmentOutlined,
    TagsOutlined,
    SoundOutlined, DragOutlined, LoadingOutlined, UploadOutlined, FileImageOutlined
} from '@ant-design/icons';
import {
    ImageContextType, useImageContext,
} from '../../contexts/ImageContext';
import '../../styles/notes/NoteSavePage.css';
import {ExtractData, useExtract} from "../../contexts/ExtractContext";
import {MindMapData, useMindMapContext, MindNode} from "../../contexts/MindMapContext";
import {KeywordData, useKeywords} from "../../contexts/NoteKeywordsContext";
import {ExplanationData, useExplanation} from "../../contexts/ExplanationContext";
import LatexRenderer from "../../components/LatexRenderer";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;

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

interface SaveData {
    extract?: ExtractData;
    mindMap?: MindMapData;
    keywords?: KeywordData[];
    explanation?: ExplanationData;
}
const NoteSavePage = () => {
    // Context hooks
    const {
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile,
        setSaved
    } = useImageContext();
    const { getExtractByImage } = useExtract();
    const { currentMindMap } = useMindMapContext();
    const { getKeywordsByImage } = useKeywords();
    const { getExplanationByImage } = useExplanation();
    const [loading, setloading] = useState(false)
    // Local state
    const [saveOptions, setSaveOptions] = useState<Record<string, boolean>>({
        summary: false,
        mindmap: false,
        knowledge: false,
        lecture: false
    });

    // 获取当前内容数据
    const currentExtract = selectedImage ? getExtractByImage(selectedImage.id) : undefined;
    const currentKeywords = selectedImage ? getKeywordsByImage(selectedImage.id) : [];
    const currentExplanation = selectedImage ? getExplanationByImage(selectedImage.id) : undefined;
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

            const saveData: SaveData = {};

            if(currentExtract)
                saveData.extract = currentExtract;

            if(currentMindMap)
                saveData.mindMap = currentMindMap;
            if(currentKeywords)
                saveData.keywords = currentKeywords;
            if(currentExplanation)
                saveData.explanation = currentExplanation;

            formData.append('extra', JSON.stringify(saveData));
            console.log(formData)
            const { data } = await saveNoteToAPI(formData);

            setSaved(selectedImage.id)

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

    const renderMindMapPreview = (mindMap: MindMapData | undefined, isEditing: boolean = false) => {
        if (!mindMap || !mindMap.nodes.length) return null;

        return (
            <div className="mindmap-preview-container">
                {mindMap.nodes.map(rootNode => renderMindMapNode(rootNode, isEditing))}
            </div>
        );
    };
    const renderMindMapNode = (node: MindNode, isEditing: boolean) => {
        return (
            <div key={node.id} className="mindmap-node">
                <div className="node-content">
                    <div className="node-label">{node.label}</div>
                </div>
                {node.children.length > 0 && (
                    <div className="node-children">
                        {node.children.map(child => renderMindMapNode(child, isEditing))}
                    </div>
                )}
            </div>
        );
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
                return (
                    <div className="preview-section">
                        {/*<Text className="preview-title">思维导图预览</Text>*/}
                        <div className="mindmap-preview-co  ntainer">
                            暂不支持思维导图的预览
                            {/*{renderMindMapPreview(currentMindMap)}*/}
                        </div>
                    </div>
                );


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

    const renderToolbar = () => {
        return (
            <div className="toolbar">
                <Button
                    type="primary"
                    icon={<SaveOutlined/>}
                    onClick={handleSave}
                    disabled={!selectedImage}
                    loading={loading}
                >
                    保存笔记
                </Button>
            </div>
        )
    }

    return (
        <div className="sub-container">
            <Row gutter={24} className="sub-row">
                {/* 左侧保存面板 */}
                <Col flex="auto" className="sub-col">
                    <div className="tool-section">
                        <Title level={3} className="tool-title">
                            <ApartmentOutlined/> 笔记保存
                        </Title>
                        {renderToolbar()}
                    </div>
                    <Card
                        title={selectedImage?.name || "请选择图片"}
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
                                            const newOptions = {...saveOptions};
                                            Object.keys(newOptions).forEach(k => {
                                                newOptions[k] = values.includes(k);
                                            });
                                            setSaveOptions(newOptions);
                                        }}
                                    >
                                        <Row gutter={24}>
                                            <Col span={10}>
                                                <Checkbox value="summary">
                                                    <FileTextOutlined/> 保存摘要
                                                </Checkbox>
                                            </Col>
                                            <Col span={10}>
                                                <Checkbox value="mindmap">
                                                    <ApartmentOutlined /> 思维导图
                                                </Checkbox>
                                            </Col>
                                            <Col span={10}>
                                                <Checkbox value="knowledge">
                                                    <TagsOutlined/> 知识点
                                                </Checkbox>
                                            </Col>
                                            <Col span={10}>
                                                <Checkbox value="lecture">
                                                    <SoundOutlined/> 智能讲解
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
                <Col xs={24} md={10} lg={8}>
                    <Card
                        title="图片列表"
                        className="note-image-list-card"
                    >
                        <List
                            dataSource={images}
                            renderItem={item => (
                                <List.Item
                                    className={`note-page-list-item ${selectedImage?.id === item.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedImage(item)}
                                >
                                    <div className="note-thumbnail-wrapper">
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="note-thumbnail"
                                            onClick={(e) => {
                                                e.stopPropagation(); // 阻止事件冒泡到列表项
                                                setPreviewImage(item.url); // 设置预览图片
                                            }}
                                            style={{cursor: 'pointer'}} // 添加指针样式表示可点击
                                        />
                                        <FileImageOutlined
                                            className="note-file-icon"
                                            style={item.has_saved ? {backgroundColor: 'mediumseagreen'} : {backgroundColor: 'darkorange'}}
                                            onClick={(e) => {
                                                e.stopPropagation(); // 阻止事件冒泡到列表项
                                                setPreviewImage(item.url); // 设置预览图片
                                            }}
                                        />
                                    </div>
                                    <div className="note-image-info">
                                            <span className="note-image-name">
                                                {item.name.length > 20 ? item.name.substring(0, 20)+"..." : item.name}
                                            </span>
                                        <span className="note-image-date">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        {item.has_saved ? (
                                            <Text type="secondary" className="note-image-date">
                                                {"   --saved"}
                                            </Text>
                                        ) : (
                                            <div></div>
                                        )}
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

export default NoteSavePage;
