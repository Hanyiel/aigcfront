// src/pages/notes/MindMapPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  Card,
  Typography,
  Row,
  Col,
  List,
  Image,
  Upload,
  Layout,
  Select,
  message
} from 'antd';
import {
  ApartmentOutlined,
  PlusOutlined,
  UploadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useImageContext } from '../../contexts/ImageContext';
import { useMindMapContext, MindNode } from '../../contexts/MindMapContext';
import '../../styles/notes/MindMapPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

interface MindMapResponse {
  code: number;
  data: MindMapData;
  message: string;
  timestamp: number;
}

interface ApiMindNode {
  id: string;
  label: string;
  color?: string;
  link?: string;
  position?: {
    x: number;
    y: number;
  };
  children?: ApiMindNode[];
}

interface MindMapData {
  mindmap_id: string;
  layout_type: string;
  root_node: ApiMindNode;
  svg_url?: string;
}

// 优化后的工具函数
const convertApiNode = (apiNode?: ApiMindNode): MindNode | null => {
  if (!apiNode?.id) return null;

  const defaultPosition = {
    x: Math.random() * 400,
    y: Math.random() * 300
  };

  return {
    ...apiNode,
    label: apiNode.label || '未命名节点',
    color: apiNode.color || '#4d90fe',
    position: apiNode.position || defaultPosition,
    children: (apiNode.children || [])
        .map(convertApiNode)
        .filter(Boolean) as MindNode[]
  };
};

const calculateConnectionPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
) => {
  const deltaY = end.y - start.y;
  const controlY = start.y + deltaY * 0.2;
  return `M ${start.x} ${start.y}
          Q ${start.x} ${controlY}, ${(start.x + end.x)/2} ${end.y}
          T ${end.x} ${end.y}`;
};

const MindMapPage = () => {
  const {
    images,
    addImage,
    removeImage,
    selectedImage,
    setSelectedImage,
    getImageFile
  } = useImageContext();

  const { mindMaps, saveMindMap, clearMindMap } = useMindMapContext();
  const currentMindMap = selectedImage ? mindMaps[selectedImage.id] : undefined;

  const [nodes, setNodes] = useState<MindNode[]>(currentMindMap?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState('tree');
  const uploadRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  // 同步画布位置和导图数据
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasRect({
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height
        });
      }
    };
    updateCanvasRect();
    window.addEventListener('scroll', updateCanvasRect);
    window.addEventListener('resize', updateCanvasRect);
    return () => {
      window.removeEventListener('scroll', updateCanvasRect);
      window.removeEventListener('resize', updateCanvasRect);
    };
  }, []);

  const calculateLayout = (
      node: MindNode,
      startX: number,
      startY: number,
      level: number = 0
  ) => {
    const NODE_WIDTH = 300;
    const LEVEL_HEIGHT = 200;
    const SIBLING_SPACING = 100;
    // 确保节点位置在可视区域内
    node.position = {
      x: Math.max(50, Math.min(canvasRect.width - 250, startX)),
      y: Math.max(50, startY + level * LEVEL_HEIGHT)
    };
    let childX = startX - (node.children.length * NODE_WIDTH) / 2;
    node.children.forEach(child => {
      childX = Math.max(50, childX); // 防止子节点溢出左侧
      calculateLayout(child, childX, startY, level + 1);
      childX += NODE_WIDTH + SIBLING_SPACING;
    });
  };

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
  const generateMindmap = async () => {
    if (!selectedImage) {
      message.warning('请先选择图片');
      return;
    }

    const imageFile = getImageFile(selectedImage.id);
    if (!imageFile) {
      message.error('获取图片文件失败');
      return;
    }

    setGenerating(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('style', layoutStyle);

      const response = await fetch('http://localhost:8000/api/notes/mindmap', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('请求失败');

      const { data } = await response.json() as MindMapResponse;
      console.log('Data:', data);
      const rootNode = convertApiNode(data.root_node);
      console.log('Raw root node:', data.root_node);
      console.log('Converted root node:', rootNode);

      // 动态计算起始位置
      const startX = (canvasRect.width || 800) / 2;
      const startY = 100;

      if (rootNode) {
        calculateLayout(rootNode, startX, startY);
        const newNodes = flattenNodes(rootNode);

        console.log('Calculated nodes:', newNodes);
        saveMindMap(selectedImage.id, {
          nodes: newNodes,
          svgUrl: data.svg_url || '',
          generatedAt: Date.now()
        });
        setNodes([...newNodes]); // 使用展开运算符创建新数组
        // 自动滚动到中心点
        if (canvasRef.current) {
          canvasRef.current.scrollTo({
            left: startX - 400,
            top: 0,
            behavior: 'smooth'
          });
        }
        setNodes(newNodes);
      }

      message.success('思维导图生成成功');
    } catch (error: any) {
      message.error(error.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleNodeDrag = (id: string, e: React.MouseEvent) => {
    const updatedNodes = nodes.map(node =>
        node.id === id
            ? {
              ...node,
              position: {
                x: e.pageX - canvasRect.left,
                y: e.pageY - canvasRect.top
              }
            }
            : node
    );
    setNodes(updatedNodes);
  };

  const renderToolbar = () => (
      <div className="toolbar">
        <Select
            value={layoutStyle}
            onChange={setLayoutStyle}
            style={{ width: 120, marginRight: 12 }}
        >
          <Option value="tree">树状布局</Option>
          <Option value="radial">放射布局</Option>
          <Option value="organic">自由布局</Option>
        </Select>

        <Button
            type="primary"
            icon={generating ? <LoadingOutlined /> : <ApartmentOutlined />}
            onClick={generateMindmap}
            disabled={generating}
            className="generate-btn"
        >
          {generating ? '生成中...' : '生成导图'}
        </Button>
      </div>
  );

  return (
      <div className="mindmap-container">
        <Row gutter={24} className="mindmap-row">
          <Col flex="auto" className="mindmap-col">
            <div className="header-section">
              <Title level={3} className="panel-title">
                <ApartmentOutlined/> 智能思维导图
              </Title>
              {renderToolbar()}
            </div>
            <Card className="mindmap-card">
              <div className="mindmap-canvas" ref={canvasRef}>
                <div className="canvas-grid"/>
                {nodes.map(node => (
                    <div
                        key={node.id}
                        className={`mindmap-node ${selectedNode === node.id ? 'selected' : ''}`}
                        style={{
                          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
                          background: node.color || (node.id === 'root' ? '#f0faff' : '#fff'),
                          borderColor: node.color ? `${node.color}33` : '#4d90fe'
                        }}
                        onMouseDown={(e) => handleNodeDrag(node.id, e)}
                    >
                      <div className="node-content">
                        {node.link ? (
                            <a href={node.link} className="node-link">
                              <span className="node-label">{node.label}</span>
                              <span className="link-indicator">↗</span>
                            </a>
                        ) : (
                            <span className="node-label">{node.label}</span>
                        )}
                      </div>
                      {node.children.length > 0 && (
                          <div className="node-children-indicator">
                            <span className="children-count">{node.children.length}</span>
                          </div>
                      )}
                    </div>
                ))}
                {nodes.map(node =>
                    node.children.map(child => (
                        <svg
                            key={`${node.id}-${child.id}`}
                            className="connection-line"
                            style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              pointerEvents: 'none'
                            }}
                        >
                          <path
                              d={calculateConnectionPath(node.position, child.position)}
                              stroke={node.color || '#4d90fe'}
                              fill="none"
                              strokeWidth="1.5"
                          />
                        </svg>
                    )) ?? null
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={10} lg={8}>
          <Card
                title="图片列表"
                className="image-list-card"
                extra={
                  <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
                    <Button icon={<UploadOutlined />}>添加图片</Button>
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
                                  clearMindMap(item.id);
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
                            {mindMaps[item.id]?.nodes?.length ? (
                                <Text type="secondary" className="mindmap-status">
                                  已生成导图（{mindMaps[item.id].nodes.length}节点）
                                </Text>
                            ) : null}
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

// 辅助函数放在最后
const flattenNodes = (node: MindNode): MindNode[] => {
  return [
    node,
    ...(node.children?.flatMap(n => flattenNodes(n)) || [])
  ];
};

export default MindMapPage;
