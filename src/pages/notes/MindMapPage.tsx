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
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

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

  interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
const checkCollision = (a: NodeBounds, b: NodeBounds): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};
  const calculateLayout = (
  node: MindNode,
  startX: number,
  startY: number,
  level: number = 0,
  occupiedAreas: NodeBounds[] = []
) => {
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 60;
  const LEVEL_VERTICAL_SPACING = 120;

  const nodeArea = {
    x: startX - NODE_WIDTH/2,
    y: startY,
    width: NODE_WIDTH,
    height: NODE_HEIGHT
  };
  // 垂直避让逻辑
  let adjustedY = startY;
  while (occupiedAreas.some(area => checkCollision(nodeArea, area))) {
    adjustedY += LEVEL_VERTICAL_SPACING/2;
    nodeArea.y = adjustedY;
  }
  node.position = {
    x: startX,
    y: adjustedY
  };
  occupiedAreas.push({...nodeArea});
  if (node.children.length > 0) {
    const SIBLING_HORIZONTAL_SPACING = 80;
    const childrenWidth = node.children.reduce((total, child) => {
      return total + NODE_WIDTH + SIBLING_HORIZONTAL_SPACING;
    }, -SIBLING_HORIZONTAL_SPACING);
    let childX = startX - childrenWidth/2;

    node.children.forEach(child => {
      calculateLayout(
        child,
        childX + NODE_WIDTH/2,
        adjustedY + LEVEL_VERTICAL_SPACING,
        level + 1,
        occupiedAreas
      );
      childX += NODE_WIDTH + SIBLING_HORIZONTAL_SPACING;
    });
  }
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

      if (rootNode) {
        const startX = 0;  // 使用相对坐标系
        const startY = 0;
        calculateLayout(rootNode, startX, startY);
        const newNodes = flattenNodes(rootNode);

        console.log('Calculated nodes:', newNodes);
        setTransform({
          x: canvasRect.width/2 - rootNode.position.x,
          y: 60,  // 顶部留白
          scale: 1
        });
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
  const calculateConnectionPath = (
      start: { x: number; y: number },
      end: { x: number; y: number }
  ) => {
    // 计算贝塞尔曲线控制点
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const cp1 = { x: start.x + dx * 0.25, y: start.y + dy * 0.1 };
    const cp2 = { x: start.x + dx * 0.75, y: start.y + dy * 0.9 };
    return `M ${start.x},${start.y} 
          C ${cp1.x},${cp1.y} 
            ${cp2.x},${cp2.y} 
            ${end.x},${end.y}`;
  };
  const handleCanvasDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 仅处理左键
    setDragging(true);
    setStartPos({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };
  const handleCanvasDrag = (e: React.MouseEvent) => {
    if (dragging) {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setTransform(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    }
  };
  const handleCanvasDragEnd = () => {
    setDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = 0.1;
    const newScale = e.deltaY < 0
        ? transform.scale * (1 + scaleFactor)
        : transform.scale * (1 - scaleFactor);
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(0.5, newScale), 3)
    }));
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
        {/*<Select*/}
        {/*    value={layoutStyle}*/}
        {/*    onChange={setLayoutStyle}*/}
        {/*    style={{ width: 120, marginRight: 12 }}*/}
        {/*>*/}
        {/*  <Option value="tree">树状布局</Option>*/}
        {/*  <Option value="radial">放射布局</Option>*/}
        {/*  <Option value="organic">自由布局</Option>*/}
        {/*</Select>*/}

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
  const renderNodes = () => (
      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
        {/* 先渲染连接线 */}
        {nodes.flatMap(node =>
            node.children.map(child => {
              const start = node.position;
              const end = child.position;
              return (
                  <path
                      key={`${node.id}-${child.id}`}
                      d={calculateConnectionPath(start, end)}
                      stroke="#4d90fe"
                      fill="none"
                      strokeWidth={2 / transform.scale} // 随缩放调整线宽
                      markerEnd={transform.scale > 0.7 ? "url(#arrow)" : undefined}
                  />
              );
            })
        )}

        {/* 后渲染节点确保盖在线上方 */}
        {nodes.map(node => (
            <g
                key={node.id}
                transform={`translate(${node.position.x},${node.position.y})`}
                className="mindmap-node"
            >
              <rect
                  width="200"
                  height="60"
                  rx="12"
                  fill="#ffffff"
                  stroke="#4d90fe"
                  strokeWidth="1.5"
              />
              <foreignObject width="200" height="60" className="node-content">
                <div className="node-label">
                  {node.link ? (
                      <a href={node.link} target="_blank" rel="noopener noreferrer">
                        {node.label}
                      </a>
                  ) : (
                      node.label
                  )}
                </div>
                {node.children.length > 0 && (
                    <div className="children-count">
                      {node.children.length}个子节点
                    </div>
                )}
              </foreignObject>      </g>
        ))}
      </g>
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
              <div
                  className="mindmap-canvas"
                  ref={canvasRef}
                  onMouseDown={handleCanvasDragStart}
                  onMouseMove={handleCanvasDrag}
                  onMouseUp={handleCanvasDragEnd}
                  onMouseLeave={handleCanvasDragEnd}
                  onWheel={handleWheel}
              >
                <svg className="canvas-svg">
                  <defs>
                    <linearGradient id="gradient-default" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4d90fe" />
                      <stop offset="100%" stopColor="#69c0ff" />
                    </linearGradient>
                    <marker
                        id="arrow"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="#4d90fe" />
                    </marker>
                  </defs>
                  {renderNodes()}
                </svg>
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
