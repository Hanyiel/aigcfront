// src/pages/notes/MindMapPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Modal,
  Input,
  Typography,
  Row,
  Col,
  List,
  Image,
  Upload,
  Layout,
  Select,
  message, Space
} from 'antd';
import {
  ApartmentOutlined,
  PlusOutlined,
  UploadOutlined,
  LoadingOutlined, SaveOutlined, EditOutlined, DragOutlined, FileImageOutlined
} from '@ant-design/icons';
import { useImageContext } from '../../contexts/ImageContext';
import { useMindMapContext, MindNode, MindMapData } from '../../contexts/MindMapContext';
import '../../styles/notes/MindMapPage.css';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

interface MindMapResponse {
  code: number;
  data: {
    mindmap_id: string;
    layout_type: string;
    root_node: MindNode;
  };
  message: string;
  timestamp: number;
}

interface MindMap {
  mindmap_id: string;
  layout_type: string;
  mindMapData: MindMapData;
  svg_url?: string;
}

const MindMapPage = () => {
  const {
    images,
    addImage,
    removeImage,
    selectedImage,
    setSelectedImage,
    getImageFile
  } = useImageContext();

  const { mindMaps, saveMindMap, clearMindMap, updateMindMap } = useMindMapContext();

  const [generating, setGenerating] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState('tree');
  const uploadRef = useRef<HTMLInputElement>(null);

  // 编辑模式状态
  const [isEditing, setIsEditing] = useState(false);
  // 当前编辑的节点ID
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  // 拖拽中的节点ID
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  // 拖拽偏移量
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // 画布缩放
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  // 画布拖拽
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragCanvasStart, setDragCanvasStart] = useState({ x: 0, y: 0 });
  const [startTransform, setStartTransform] = useState(transform);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [mindMapData, setMindMapData] = useState<MindMapData>({
    nodes: [],
    generatedAt: Date.now()
  });

  const [editingText, setEditingText] = useState('');
  const [isTextModalVisible, setIsTextModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null );

  // 当选择的图片改变时，更新思维导图数据
  useEffect(() => {
    if (selectedImage && mindMaps[selectedImage.id]) {
      setMindMapData(mindMaps[selectedImage.id]);
    } else {
      setMindMapData({
        nodes: [],
        generatedAt: Date.now()
      });
    }
  }, [selectedImage, mindMaps])

  // 图片上传逻辑
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

  // 递归转换后端数据结构为节点格式
  const transformBackendNode = (node: any): MindNode => {
    return {
      id: node.id,
      label: node.label,
      color: node.color || '#1890ff',
      position: node.position || { x: 0, y: 0 },
      children: node.children ? node.children.map(transformBackendNode) : []
    };
  };

  // 生成思维导图
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

      // 转换后端数据为前端节点结构
      const transformedRoot = transformBackendNode(data.root_node);

      // 为节点添加初始位置
      const positionNodes = (node: MindNode, depth: number, parentX: number, parentY: number) => {
        // 基础间距设置
        const horizontalSpacing = 300 - 10 * Math.log2(16 * depth + 1); // 水平间距
        const verticalSpacing = 200 - 10 * Math.log2(16 * depth + 1);   // 垂直间距

        // 计算节点的初始位置
        if (depth === 0) {
          // 根节点位置
          node.position = { x: 400, y: 100 };
        } else {
          // 子节点位置 - 基于父节点位置计算
          node.position = { x: parentX, y: parentY + verticalSpacing };
        }
        // 计算子节点布局
        const totalChildren = node.children.length;
        const startX = node.position.x - (horizontalSpacing * (totalChildren - 1)) / 2;

        // 递归定位所有子节点
        node.children.forEach((child, index) => {
          const childX = startX + index * horizontalSpacing;
          positionNodes(child, depth + 1, childX + 80 * Math.random(), node.position.y + 60 * Math.random());
        });
      };

      positionNodes(transformedRoot, 0, 0, 0);

      const newMindMapData: MindMapData = {
        nodes: [transformedRoot],
        generatedAt: Date.now()
      };

      setMindMapData(newMindMapData);
      saveMindMap(selectedImage.id, newMindMapData);
      message.success('思维导图生成成功');
    } catch (error: any) {
      message.error(error.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 添加子节点
  const addChildNode = (parentId: string) => {
    if (!selectedImage) return;

    const newNodeId = `node-${Date.now()}`; // 生成唯一ID

    updateMindMap(selectedImage.id, (prev) => {
      const addNode = (nodes: MindNode[]): MindNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            const parentPosition = node.position;
            const newNode: MindNode = {
              id: newNodeId,
              label: '新节点',
              position: {
                x: parentPosition.x + 100,
                y: parentPosition.y + (node.children.length * 50)
              },
              children: []
            };
            return {
              ...node,
              children: [...node.children, newNode]
            };
          }
          if (node.children.length > 0) {
            return { ...node, children: addNode(node.children) };
          }
          return node;
        });
      };

      return {
        ...prev,
        nodes: addNode(prev.nodes)
      };
    });
    setMindMapData(prev => {
      const addNode = (nodes: MindNode[]): MindNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            const parentPosition = node.position;
            const newNode: MindNode = {
              id: newNodeId,
              label: '新节点',
              position: {
                x: parentPosition.x + 100,
                y: parentPosition.y + (node.children.length * 50)
              },
              children: []
            };
            return {
              ...node,
              children: [...node.children, newNode]
            };
          }
          if (node.children.length > 0) {
            return { ...node, children: addNode(node.children) };
          }
          return node;
        });
      };

      return {
        ...prev,
        nodes: addNode(prev.nodes)
      };
    });

    // 关闭模态框
    setIsTextModalVisible(false);
    // // 选中新节点并进入编辑模式
    // setEditingNodeId(newNodeId);
    // setEditingText('新节点');
    //
    // // 短暂延迟后重新打开编辑模态框
    // setTimeout(() => {
    //   setIsTextModalVisible(true);
    // }, 100);
  };

  // 查找节点
  const findNode = (nodes: MindNode[], id: string): MindNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children.length > 0) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 更新节点标签
  const updateNodeLabel = (id: string, newLabel: string) => {

    if (!selectedImage) return;

    updateMindMap(selectedImage.id, (prev) => {
      const updateNode = (nodes: MindNode[]): MindNode[] => {
        return nodes.map(node => {
          if (node.id === id) {
            return { ...node, label: newLabel };
          }
          if (node.children.length > 0) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };

      return {
        ...prev,
        nodes: updateNode(prev.nodes)
      };
    });

    const updateNode = (nodes: MindNode[]): MindNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, label: newLabel };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    setMindMapData(prev => ({
      ...prev,
      nodes: updateNode(prev.nodes)
    }));

  };

  // 更新节点位置
  const updateNodePosition = (id: string, newPosition: { x: number; y: number }) => {

    if (!selectedImage) return;

    updateMindMap(selectedImage.id, (prev) => {
      const updateNode = (nodes: MindNode[]): MindNode[] => {
        return nodes.map(node => {
          if (node.id === id) {
            return { ...node, position: newPosition };
          }
          if (node.children.length > 0) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };

      return {
        ...prev,
        nodes: updateNode(prev.nodes)
      };
    });

    const updateNode = (nodes: MindNode[]): MindNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, position: newPosition };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    setMindMapData(prev => ({
      ...prev,
      nodes: updateNode(prev.nodes)
    }));
  };

  // 处理鼠标按下事件（开始拖拽）
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!isEditing) {
      e.preventDefault();
      setIsDraggingCanvas(true);
      setDragCanvasStart({ x: e.clientX, y: e.clientY });
      setStartTransform(transform);
    }

    e.stopPropagation();
    setDraggingNodeId(nodeId);

    const node = findNode(mindMapData.nodes, nodeId);
    if (!node) return;

    // 计算鼠标相对于节点中心的偏移量
    if (svgRef.current) {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const cursorPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

      setDragOffset({
        x: cursorPoint.x - node.position.x,
        y: cursorPoint.y - node.position.y
      });
    }
  };

  // 处理鼠标移动事件（拖拽中）
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      e.preventDefault();
      const dx = e.clientX - dragCanvasStart.x;
      const dy = e.clientY - dragCanvasStart.y;

      setTransform({
        ...startTransform,
        x: startTransform.x + dx,
        y: startTransform.y + dy
      });
    } else if (isEditing && draggingNodeId && svgRef.current) {

      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const cursorPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

      // 计算节点新位置
      const newPosition = {
        x: cursorPoint.x - dragOffset.x,
        y: cursorPoint.y - dragOffset.y
      };
      updateNodePosition(draggingNodeId, newPosition);
    }
  };

  // 处理鼠标松开事件（结束拖拽）
  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsDraggingCanvas(false);
  };

  // 处理双击事件（编辑节点文本）
  const handleDoubleClick = (nodeId: string, label: string) => {
    if (!isEditing) return;
    setEditingNodeId(nodeId);
    setEditingText(label);
    setIsTextModalVisible(true);
  };

  // 处理鼠标滚轮事件（缩放画布）
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaY;
      const scaleFactor = 0.001; // 缩放因子

      // 计算新的缩放比例
      const factor = Math.exp(-delta * scaleFactor);
      const newScale = transform.scale * factor;

      // 限制缩放范围
      const clampedScale = Math.max(0.1, Math.min(5, newScale));

      // 计算鼠标位置相对于SVG的坐标
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const point = svgRef.current.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const cursor = point.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

        // 计算缩放中心
        const scaleCenter = {
          x: (cursor.x - transform.x) / transform.scale,
          y: (cursor.y - transform.y) / transform.scale
        };

        // 计算平移偏移量
        const translate = {
          x: transform.x + (scaleCenter.x * (transform.scale - clampedScale)),
          y: transform.y + (scaleCenter.y * (transform.scale - clampedScale))
        };

        setTransform({
          x: translate.x,
          y: translate.y,
          scale: clampedScale
        });
      }
    }
  };

  // 渲染节点和连接线
  const renderNode = (node: MindNode) => {
    // 应用缩放和平移变换到节点位置
    const transformedPosition = {
      x: node.position.x * transform.scale + transform.x,
      y: node.position.y * transform.scale + transform.y
    };
    // 渲染子节点
    const childNodes = node.children.map(child => renderNode(child));

    // 渲染连接到子节点的线
    const connections = node.children.map(child => {
      const childPosition = {
        x: child.position.x * transform.scale + transform.x,
        y: child.position.y * transform.scale + transform.y
      };

      return (
          <line
              key={`${node.id}-${child.id}`}
              x1={transformedPosition.x}
              y1={transformedPosition.y}
              x2={childPosition.x}
              y2={childPosition.y}
              stroke="#999"
              strokeWidth={isEditing ? 2 : 1.5}
          />
      );
    });

    const nodeWidth = 180;
    const nodeHeight = 50;

    return (
        <React.Fragment key={node.id}>
          {connections}
          <g
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onDoubleClick={() => handleDoubleClick(node.id, node.label)}
              style={{ cursor: isEditing ? 'move' : 'default' }}
          >
            <rect
                x={transformedPosition.x - nodeWidth / 2}
                y={transformedPosition.y - nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
                rx={8}
                ry={8}
                fill="#e6f7ff" // 背景
                stroke="#1890ff" // 边框
                strokeWidth={2} // 边框宽度
            />
            <text
                x={transformedPosition.x}
                y={transformedPosition.y + 5}
                textAnchor="middle"
                fill="#333" // 深色文字
                fontWeight={node.children.length > 0 ? 'bold' : 'normal'}
                fontSize={node.children.length > 0 ? 13 : 13}
            >
              { node.label.length > 10 ? node.label.substring(0, 9) + '...' : node.label }
            </text>
          </g>
          {childNodes}
        </React.Fragment>
    );
  };

  // 渲染所有节点
  const renderMindMap = () => {
    return mindMapData.nodes.map(rootNode => renderNode(rootNode));
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setEditingNodeId(null);
    setDraggingNodeId(null);
  };

  // 保存文本编辑
  const handleTextSave = () => {
    if (editingNodeId) {
      updateNodeLabel(editingNodeId, editingText);
      message.success('节点内容已更新');
    }
    setIsTextModalVisible(false);
  };

  const renderMindMapEditor = () => {
    return (
        <div style={{position: 'relative', height: 'calc(100vh - 200px)'}}>
          <svg
              ref={svgRef}
              width="100%"
              height="100%"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{backgroundColor: '#f9f9f9', borderRadius: 8}}
          >
            { renderMindMap() }
          </svg>
        </div>
    )
  }

  const renderToolbar = () => (
      <div className="toolbar">

        <Button
            type={isEditing ? 'default' : 'primary'}
            icon={<DragOutlined/>}
            onClick={toggleEditMode}
            // disabled={!images}
        >
          {isEditing ? '保存编辑' : '编辑模式'}
        </Button>
        <Button
            type="primary"
            icon={generating ? <LoadingOutlined/> : <ApartmentOutlined/>}
            onClick={generateMindmap}
            disabled={!selectedImage}
            loading={generating}
        >
          {generating ? '生成中...' : '生成导图'}
        </Button>
      </div>
  );

  return (
      <div className="sub-container">
        <Row gutter={24} className="sub-row">
          <Col flex="auto" className="sub-col">
            <div className="tool-section">
              <Title level={3} className="tool-title">
                <ApartmentOutlined/> 思维导图
              </Title>
              { renderToolbar() }
            </div>
            <div
                className="content-card"
            >
              { renderMindMapEditor() }
            </div>
          </Col>

          {/* 右侧图片列表 */}
          <Col xs={24} md={10} lg={8}>
            <Card
                title="图片列表"
                className="note-image-list-card"
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
                          className={`note-page-list-item ${selectedImage?.id === item.id ? 'selected' : ''}`}
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
                              {item.name}
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

        <Modal
            title="编辑节点内容"
            open={isTextModalVisible}
            onOk={handleTextSave}
            onCancel={() => setIsTextModalVisible(false)}
            okText="保存"
            cancelText="取消"
            width={600}
            footer={
              [
                <Button
                    key="add-child"
                    type="dashed"
                    onClick={() => editingNodeId && addChildNode(editingNodeId)}
                    icon={<PlusOutlined />}
                >
                  添加子节点
                </Button>,
                <Button key="back" onClick={() => setIsTextModalVisible(false)}>
                  取消
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleTextSave}
                    icon={<SaveOutlined />}
                >
                  保存
                </Button>,
              ]}
        >
          <div style={{ margin: '20px 0' }}>
            <Input.TextArea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                autoSize={{ minRows: 6, maxRows: 12 }}
                style={{ width: '100%' }}
                placeholder="输入节点内容..."
            />
          </div>
        </Modal>
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


export default MindMapPage;
