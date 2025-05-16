// src/pages/notes/MindMapPage.tsx
import React, { useState } from 'react';
import {
  Button,
  Card,
  Typography,
  Row,
  Col,
  List,
  Image,
  Upload, Layout
} from 'antd';
import {
  ApartmentOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useImageContext } from '../../contexts/ImageContext';
import '../../styles/notes/MindMapPage.css';

const { Title, Text } = Typography;
const { Content } = Layout;

interface MindNode {
  id: string;
  content: string;
  x: number;
  y: number;
  connections: string[];
}

const initialNodes: MindNode[] = [
  { id: 'root', content: '中心主题', x: 400, y: 300, connections: [] },
  { id: 'node1', content: '分支主题1', x: 200, y: 200, connections: ['root'] },
  { id: 'node2', content: '分支主题2', x: 600, y: 200, connections: ['root'] },
  { id: 'node3', content: '子主题1', x: 150, y: 100, connections: ['node1'] }
];

const MindMapPage = () => {
  const { images } = useImageContext();
  const [nodes, setNodes] = useState<MindNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>();

  const handleUpload = (file: File) => {
    const newImage = {
      id: Date.now().toString(),
      url: URL.createObjectURL(file),
      name: file.name,
      timestamp: Date.now(),
    };
    // 需要更新useImageContext中的setImages
    return false;
  };

  const addNode = (parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const newNode: MindNode = {
      id: `node${Date.now()}`,
      content: '新节点',
      x: parentNode.x + 100,
      y: parentNode.y + 100,
      connections: [parentId]
    };

    setNodes([...nodes, newNode]);
  };

  const handleNodeDrag = (id: string, e: globalThis.MouseEvent) => {
    const updatedNodes = nodes.map(node =>
      node.id === id
        ? { ...node, x: e.clientX, y: e.clientY }
        : node
    );
    setNodes(updatedNodes);
  };

  return (
    <div className="mindmap-container">
      <Row gutter={24} className="mindmap-row">
        {/* 左侧思维导图区域 */}
        <Col flex="auto" className="mindmap-col">
          <Title level={3} className="panel-title">
            <ApartmentOutlined /> 思维导图
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="add-root-btn"
              onClick={() => addNode('root')}
            >
              添加分支
            </Button>
          </Title>

          <Card className="mindmap-card">
            <div className="mindmap-canvas">
              {/* 连接线 */}
              {nodes.flatMap(node =>
                node.connections.map(connId => {
                  const connNode = nodes.find(n => n.id === connId);
                  if (!connNode) return null;

                  return (
                    <svg
                      key={`${node.id}-${connId}`}
                      className="connection-line"
                      style={{
                        top: Math.min(node.y, connNode.y),
                        left: Math.min(node.x, connNode.x),
                        width: Math.abs(node.x - connNode.x),
                        height: Math.abs(node.y - connNode.y)
                      }}
                    >
                      <line
                        x1={node.x < connNode.x ? 0 : Math.abs(node.x - connNode.x)}
                        y1={node.y < connNode.y ? 0 : Math.abs(node.y - connNode.y)}
                        x2={node.x > connNode.x ? 0 : Math.abs(node.x - connNode.x)}
                        y2={node.y > connNode.y ? 0 : Math.abs(node.y - connNode.y)}
                        stroke="#1890ff"
                        strokeWidth="2"
                      />
                    </svg>
                  );
                })
              )}

              {/* 节点 */}
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`mindmap-node ${selectedNode === node.id ? 'selected' : ''}`}
                  style={{
                    top: node.y,
                    left: node.x,
                    background: node.id === 'root' ? '#e6f7ff' : '#fff'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedNode(node.id);
                    const onMouseMove = (moveEvent: MouseEvent) =>
                      handleNodeDrag(node.id, moveEvent);
                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                    };
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                  }}
                >
                  <div className="node-content">{node.content}</div>
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    className="add-child-btn"
                    onClick={() => addNode(node.id)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 右侧图片列表 */}
        <Col flex="400px" className="image-col">
          <Card
            title="相关图片"
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
                  className={`list-item ${selectedImage === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedImage(item.id)}
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    preview={false}
                    width={100}
                    height={75}
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
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MindMapPage;
