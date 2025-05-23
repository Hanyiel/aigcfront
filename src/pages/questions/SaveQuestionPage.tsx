import React, { useState } from 'react';
import { Tag, Card, List, Checkbox, Button, Image, Row, Col, Typography, message } from 'antd';
import {
    SaveOutlined,
    FileTextOutlined,
    ApartmentOutlined,
    TagsOutlined,
    SoundOutlined,
    BookOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import {
    useQuestionImageContext,
} from '../../contexts/QuestionImageContext';
import '../../styles/questions/SaveQuestionPage.css'; // Note: You might need to create this CSS file
import { useQuestionExtract } from "../../contexts/QuestionExtractContext";
import { useQuestionKeywords } from "../../contexts/QuestionKeywordsContext";
import { useQuestionExplanationContext } from "../../contexts/QuestionExplanationContext";
import { useRelatedNote } from "../../contexts/RelatedNoteContext";
import { useAutoGrade } from "../../contexts/AutoGradeContext";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Text } = Typography;

interface QuestionSaveResponse {
    code: number;
    message: string;
    data: {
        question_id: string;
        storage_status: string;
    };
    timestamp: number;
}

interface QuestionData {
    question_id: string;
    storage_status: string;
}

const SaveQuestionPage = () => {
    // Context hooks
    const {
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile
    } = useQuestionImageContext();
    const { getQuestionExtractByImage } = useQuestionExtract();
    const { getKeywordsByQuestionImage } = useQuestionKeywords();
    const { getExplanationByImage } = useQuestionExplanationContext();
    const { relatedData } = useRelatedNote();
    const { gradingResults, currentGrading } = useAutoGrade();
    const [loading, setLoading] = useState(false);

    // Local state
    const [saveOptions, setSaveOptions] = useState<Record<string, boolean>>({
        extract: true,
        explanation: false,
        keywords: false,
        // autograde: false,
        related: false
    });

    // Get current content data
    const currentExtract = selectedImage ? getQuestionExtractByImage(selectedImage.id) : undefined;
    const currentKeywords = selectedImage ? getKeywordsByQuestionImage(selectedImage.id) : [];
    const currentExplanation = selectedImage ? getExplanationByImage(selectedImage.id) : null;
    const currentGradingResult = selectedImage ? gradingResults.find(result => result.imageId === selectedImage.id) : null;

    // Handle save operation
    const handleSave = async () => {
        if (!selectedImage) {
            message.warning('请选择需要保存的题目图片');
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            const image = getImageFile(selectedImage.id);
            if (!image) {
                message.error('图片数据获取失败');
                return;
            }
            formData.append('image', image);
            formData.append('options', JSON.stringify(saveOptions));

            const { data } = await saveQuestionToAPI(formData);

            message.success(`题目保存成功！ID: ${data.question_id}`);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : '未知错误';
            message.error(`保存失败: ${errorMessage}`);
        }
    };

    const saveQuestionToAPI = async (formData: FormData): Promise<QuestionSaveResponse> => {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:8000/api/questions/record', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        // Handle network errors
        if (!response.ok) {
            throw new Error(`HTTP错误 ${response.status}`);
        }
        // Parse response data
        const result = await response.json();
        console.log('完整响应:', result);
        const data = result.data;
        console.log('题目数据:', data);
        // Handle business logic errors
        if (result.code !== 200) {
            throw new Error(result.message || '服务器返回未知错误');
        }
        return result;
    };

    // Render preview content
    const renderPreviewContent = (type: string) => {
        if (!saveOptions[type]) return null;

        switch (type) {
            case 'extract':
                return (
                    <Card
                        title={<><FileTextOutlined /> 题目提取</>}
                        key="extract"
                        className="preview-card"
                    >
                        {currentExtract ? (
                            <div className="extract-content">
                                <ReactMarkdown
                                          remarkPlugins={[remarkMath]}
                                          rehypePlugins={[rehypeKatex]}
                                      >
                                {currentExtract.text_content}
                                      </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="no-content">
                                暂无题目提取内容
                            </div>
                        )}
                    </Card>
                );
            case 'explanation':
                return (
                    <Card
                        title={<><SoundOutlined /> 题目讲解</>}
                        key="explanation"
                        className="preview-card"
                    >
                        {currentExplanation ? (
                            <div className="explanation-content">
                                <ReactMarkdown
                                          remarkPlugins={[remarkMath]}
                                          rehypePlugins={[rehypeKatex]}
                                      >
                                {currentExplanation.contentMd}
                                      </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="no-content">
                                暂无题目讲解内容
                            </div>
                        )}
                    </Card>
                );
            case 'keywords':
                return (
                    <Card
                        title={<><TagsOutlined /> 知识点</>}
                        key="keywords"
                        className="preview-card"
                    >
                        {currentKeywords && currentKeywords.length > 0 ? (
                            <div className="keywords-content">
                                {currentKeywords.map((keyword, index) => (
                                    <Tag key={index} color="blue">{keyword.term}</Tag>
                                ))}
                            </div>
                        ) : (
                            <div className="no-content">
                                暂无知识点
                            </div>
                        )}
                    </Card>
                );
            // case 'autograde':
            //     return (
            //         <Card
            //             title={<><CheckCircleOutlined /> 自动批改</>}
            //             key="autograde"
            //             className="preview-card"
            //         >
            //             {currentGradingResult ? (
            //                 <div className="autograde-content">
            //                     <p>得分: {currentGradingResult.score}</p>
            //                     <p>标准答案:
            //                         <ReactMarkdown
            //                               remarkPlugins={[remarkMath]}
            //                               rehypePlugins={[rehypeKatex]}
            //                           >
            //                         {currentGradingResult.correct_answer.join(', ')}
            //                           </ReactMarkdown>
            //                     </p>
            //                     <p>您的答案:
            //                         <ReactMarkdown
            //                               remarkPlugins={[remarkMath]}
            //                               rehypePlugins={[rehypeKatex]}
            //                           >
            //                         {currentGradingResult.your_answer.join(', ')}
            //                           </ReactMarkdown>
            //                     </p>
            //                     {currentGradingResult.error_analysis.length > 0 && (
            //                         <div>
            //                             <p>错误分析:</p>
            //                             <ul>
            //                                 {currentGradingResult.error_analysis.map((analysis, index) => (
            //                                     <li key={index}>{analysis}</li>
            //                                 ))}
            //                             </ul>
            //                         </div>
            //                     )}
            //                 </div>
            //             ) : (
            //                 <div className="no-content">
            //                     暂无自动批改数据
            //                 </div>
            //             )}
            //         </Card>
            //     );
            case 'related':
                return (
                    <Card
                        title={<><BookOutlined /> 相关笔记</>}
                        key="related"
                        className="preview-card"
                    >
                        {relatedData && relatedData.related_notes.length > 0 ? (
                            <div className="related-content">
                                <List
                                    dataSource={relatedData.related_notes}
                                    renderItem={note => (
                                        <List.Item>
                                            <div>
                                                <p><strong>{note.title}</strong> - 相似度: {(note.similarity * 100).toFixed(1)}%</p>
                                                <p>{note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}</p>
                                                <div>
                                                    {note.point.map((p, i) => (
                                                        <Tag key={i} color="green">{p}</Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="no-content">
                                暂无相关笔记
                            </div>
                        )}
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <Row gutter={16} className="question-save-container">
            {/* Left side content area */}
            <Col span={16} className="content-col">
                <Card className="content-card">
                    <div className="card-header">
                        <h2>题目保存</h2>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={loading}
                        >
                            保存题目
                        </Button>
                    </div>

                    {/* Main content */}
                    {!selectedImage ? (
                        <div className="no-image-selected">
                            请从右侧选择一张题目图片
                        </div>
                    ) : (
                        <>
                            {/* Preview of the current image */}
                            <div className="selected-image-preview">
                                <Image
                                    src={selectedImage.url}
                                    alt={selectedImage.name}
                                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                                />
                            </div>

                            {/* Save options */}
                            <div className="save-options">
                                <h3>保存选项</h3>
                                <Checkbox.Group
                                    value={Object.keys(saveOptions).filter(k => saveOptions[k])}
                                    onChange={(values) => {
                                        const newOptions = { ...saveOptions };
                                        Object.keys(newOptions).forEach(k => {
                                            newOptions[k] = values.includes(k);
                                        });
                                        setSaveOptions(newOptions);
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Checkbox value="extract">
                                                <FileTextOutlined /> 题目提取
                                            </Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="explanation">
                                                <SoundOutlined /> 题目讲解
                                            </Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="keywords">
                                                <TagsOutlined /> 知识点
                                            </Checkbox>
                                        </Col>
                                        {/*<Col span={6}>*/}
                                        {/*    <Checkbox value="autograde">*/}
                                        {/*        <CheckCircleOutlined /> 自动批改*/}
                                        {/*    </Checkbox>*/}
                                        {/*</Col>*/}
                                        <Col span={8}>
                                            <Checkbox value="related">
                                                <BookOutlined /> 相关笔记
                                            </Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                            </div>

                            {/* Content previews */}
                            <div className="content-previews">
                                {Object.keys(saveOptions).map(type =>
                                    saveOptions[type] && renderPreviewContent(type)
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </Col>

            {/* Right side image list */}
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

export default SaveQuestionPage;
