import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Tooltip,
  Empty,
  List,
  Dropdown,
  Menu,
  Tabs,
  Descriptions,
  Divider,
  Image,
  message,
  Spin,
  Modal,
  Form
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  TagsOutlined,
  ClusterOutlined,
  AudioOutlined,
  FileTextFilled,
  LinkOutlined,
  FileOutlined,
  EyeOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  EditOutlined,
  DragOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/userCenter/NotesManagementPage.css';
import {NoteManagementContext} from "./UserCenter";
import { logout } from "../../services/auth";
import {MindNode, MindMapData} from "../../contexts/MindMapContext"
import {Note, NoteDetail, useUserNoteContext} from "../../contexts/userCenter/UserNoteContext"
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import ReactMarkdown from "react-markdown";

const API_URL = 'http://localhost:8000/api';
const UPLOADS_URL = 'http://localhost:8000/uploads';

// 笔记管理子标签类型
type NotesSubTabKey = 'all-notes' | 'specific';

// 资源类型
type ResourceType = 'keywords' | 'mindmap' | 'explanation' | 'summary';

// 具体笔记子标签类型
type NoteDetailTabKey = 'original' | 'mindmap' | 'explanation';

const NotesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [notesSubTab, setNotesSubTab] = useState<NotesSubTabKey>('all-notes');
  const [noteDetailTab, setNoteDetailTab] = useState<NoteDetailTabKey>('original');
  const [searchForm] = Form.useForm();

  const noteManagementContext = useContext(NoteManagementContext);

  const{
    selectedNote = null,
    setSelectedNote = () => {},
    selectedNoteDetail = null,
    setSelectedNoteDetail = () => {},
    selectedSubject = null,
    setSelectedSubject = () => {},
    subjects = [],
    setSubjects = () => {},
    notes = [],
    setNotes = () => {}
  } = noteManagementContext || {};

  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0
  });
  const [loading, setLoading] = useState({
    notes: false,
    subjects: false,
    detail: false
  });
  const {
    prepareReloadNote
  }=useUserNoteContext()

  // 思维导图编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isNodeContentModalVisible, setIsNodeContentModalVisible] = useState(false);
  const [currentNodeContent, setCurrentNodeContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startTransform, setStartTransform] = useState({ x: 0, y: 0, scale: 1 });


  // 从笔记列表中提取科目数据
  const extractSubjectsAndTypesFromNotes = (notes: Note[]) => {
    const subjects = new Set<string>();

    notes.forEach(note => {
      if (note.subject) subjects.add(note.subject);
    });

    return {
      subjects: Array.from(subjects),
    };
  };
  // 获取学科列表 (POST)
  const getSubjects = async () => {
    try {
      setLoading(prev => ({ ...prev, subjects: true }));
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/notes/subject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.code === 200 && result.data?.subject) {
        setSubjects(result.data.subject);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取学科失败');
    } finally {
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  // 获取所有笔记 (POST)
  const getAllNotes = async (isFilter: boolean = false) => {
    try {
      setLoading(prev => ({ ...prev, notes: true }));
      const token = localStorage.getItem('authToken');

      // 获取表单值
      const formValues = searchForm.getFieldsValue();

      // 构建请求体
      const requestData = {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        subject: formValues.subject || undefined,
        keyword: formValues.keyword || undefined
      };

      // 过滤掉空值
      const filteredRequestBody = Object.fromEntries(
        Object.entries(requestData).filter(([_, value]) =>
          value !== undefined && value !== '' && value !== null
        )
      );

      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filteredRequestBody)
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`);
      }

      const result = await response.json();

      console.log("传来笔记数据", result.data)
      if (result.code === 200 && result.data) {
        setNotes(result.data.notes || []);
        setPagination(prev => ({
          ...prev,
          total: result.data.total || 0
        }));

        // 从笔记列表中提取科目数据
        const { subjects: extractedSubjects } = extractSubjectsAndTypesFromNotes(result.data.notes || []);

        // 更新科目状态，合并去重
        if (extractedSubjects.length > 0) {
          setSubjects(prev => {
            const combined = [...prev, ...extractedSubjects];
            return Array.from(new Set(combined));
          });
        }
      }
      console.log("note: ", result.data)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取笔记失败');
    } finally {
      setLoading(prev => ({ ...prev, notes: false }));
    }
  };

  // 获取笔记详情
  const getNoteDetail = async (noteId: string) => {
    if (!noteId) {
      message.warning("请选择笔记");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, detail: true }));
      const token = localStorage.getItem('authToken');

      // 获取基本信息
      const basicResponse = await fetch(`${API_URL}/notes/${noteId}/basic`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!basicResponse.ok) {
        throw new Error(`获取基本信息失败: ${basicResponse.statusText}`);
      }

      const basicResult = await basicResponse.json();
      const basicData = basicResult.data || {};

      // 获取思维导图
      let mindMapData: MindMapData | undefined = undefined;
      try {
        const mindMapResponse = await fetch(`${API_URL}/notes/${noteId}/mindmap`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (mindMapResponse.ok) {
          const mindMapResult = await mindMapResponse.json();
          const backendMindMap = mindMapResult.data?.mindMap || null;
          // 转换数据结构：将后端的 root_node 转换为前端的 nodes 数组
          if (backendMindMap && backendMindMap.root_node) {
            mindMapData = {
              nodes: [backendMindMap.root_node], // 将 root_node 包装成数组
              generatedAt: Date.now() // 添加生成时间
            };

            // 检查并计算节点位置
            const hasPosition = (node: MindNode): boolean => {
              if (!node.position) return false;
              for (const child of node.children || []) {
                if (!hasPosition(child)) return false;
              }
              return true;
            };
            // 如果位置不存在，计算节点位置
            if (!hasPosition(mindMapData.nodes[0])) {
              mindMapData.nodes[0] = calculateNodePositions(mindMapData.nodes[0]);
            }
          }
        }
      } catch (mindMapError) {
        console.warn('获取思维导图失败:', mindMapError);
      }

      // 获取关键词
      let keywordsData = null;
      try {
        const keywordsResponse = await fetch(`${API_URL}/notes/${noteId}/keywords`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (keywordsResponse.ok) {
          const keywordsResult = await keywordsResponse.json();
          keywordsData = keywordsResult.data?.keywords || null;
        }
      } catch (keywordsError) {
        console.warn('获取关键词失败:', keywordsError);
      }

      // 获取讲解
      let explanationData = null;
      try {
        const explanationResponse = await fetch(`${API_URL}/notes/${noteId}/explanation`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (explanationResponse.ok) {
          const explanationResult = await explanationResponse.json();
          explanationData = explanationResult.data?.explanation || null;
          console.log("explanation: ", explanationResult.data)
        }
      } catch (explanationError) {
        console.warn('获取讲解失败:', explanationError);
      }

      // 组合所有数据
      setSelectedNoteDetail({
        noteId,
        title: basicData.title || '无标题',
        content: basicData.content || '无内容',
        createTime: basicData.createTime || '',
        updateTime: basicData.updateTime || '',
        mindMap: mindMapData,
        keywords: keywordsData,
        explanation: explanationData
      });
    } catch (err) {
      message.error(err instanceof Error ? err.message : '获取笔记详情失败');
    } finally {
      setLoading(prev => ({ ...prev, detail: false }));
    }
  };

  // 当选择笔记时获取详情
  useEffect(() => {
    if (selectedNote) {
      getNoteDetail(selectedNote.noteId);
    }
  }, [selectedNote])

  useEffect(() => {
    if (selectedNote && selectedNote.imageName) {
      // 转换图片为 File 对象
      const convertImage = async () => {
        try {
          const file = await urlToFile(
              `${UPLOADS_URL}/${selectedNote.imageName}`,
              selectedNote.imageName || ''
          );
          setImageFile(file);
        } catch (error) {
          console.error('Failed to convert image:', error);
          setImageFile(null);
        }
      };

      convertImage();
    } else {
      setImageFile(null);
    }
  }, [selectedNote]);

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error converting URL to File:', error);
      throw error;
    }
  };

  // 选择重新编辑
  const reEdite = () => {
    if(selectedNote && selectedNoteDetail && imageFile){
      prepareReloadNote(selectedNote, selectedNoteDetail, imageFile);
      navigate('/notes/index')
    }
  }

  const getTagColor = (index: number) => {
    const colors = [
      'magenta', 'red', 'volcano', 'orange', 'gold',
      'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'
    ];
    return colors[index % colors.length];
  };

  /* ======== 思维导图 ======== */

  // 计算节点位置
  const calculateNodePositions = (rootNode: MindNode) => {
    // 深度优先遍历计算位置
    const positionNodes = (node: MindNode, depth: number, parentX: number, parentY: number) => {
      // 确保 children 总是数组（即使是空数组）
      if (!node.children) {
        node.children = [];
      }
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
    positionNodes(rootNode, 0, 0, 0);
    return rootNode;
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

  // 处理鼠标按下事件（开始拖拽）
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // 只响应左键
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    // 记录拖拽开始时的变换状态
    setStartTransform({ ...transform });
  };

  // 处理鼠标移动事件（更新位置）
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;

    // 计算移动距离
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    // 更新变换
    setTransform({
      ...startTransform,
      x: startTransform.x + dx / transform.scale,
      y: startTransform.y + dy / transform.scale
    });
  };

  // 处理鼠标释放事件（结束拖拽）
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理节点双击事件
  const handleNodeDoubleClick = (content: string) => {
    setCurrentNodeContent(content);
    setIsNodeContentModalVisible(true);
  };

  // 渲染节点和连接线
  const renderNode = (node: MindNode) => {
    const children = node.children || [];
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
              style={{ cursor: isEditing ? 'move' : 'default' }}
              onDoubleClick={() => handleNodeDoubleClick(node.label)}
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
    if (selectedNoteDetail?.mindMap?.nodes) {
      return selectedNoteDetail.mindMap.nodes.map(rootNode => renderNode(rootNode));
    }
    return null;
  };

  const renderMindMapEditor = () => {
    return (
        <div style={{position: 'relative', height: 'calc(60vh - 100px)', overflow: "hidden"}}>
          <svg
              ref={svgRef}
              width="100%"
              height="100%"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp} // 防止鼠标离开后拖拽状态未清除
              style={{
                backgroundColor: '#f9f9f9',
                borderRadius: 8,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
          >
            { renderMindMap() }
          </svg>
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '5px 10px',
            borderRadius: 4,
            fontSize: 12
          }}>
            <span>缩放: {(transform.scale * 100).toFixed(0)}%</span>
            <Button
                size="small"
                style={{marginLeft: 10}}
                onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            >
              重置视图
            </Button>
          </div>
        </div>
    )
  }

  const handleResourceClick = (noteId: string, resourceType: ResourceType) => {
    console.log(`打开笔记 ${noteId} 的 ${resourceType} 资源`);
  };

  const renderResourceMenu = (note: Note) => (
      <Menu>
        <Menu.Item
            disabled={!note.hasKeywords}
            onClick={() => handleResourceClick(note.noteId, 'keywords')}
        >
          <LinkOutlined /> 关键词
        </Menu.Item>
        <Menu.Item
            disabled={!note.hasMindMap}
            onClick={() => handleResourceClick(note.noteId, 'mindmap')}
        >
          <ClusterOutlined /> 思维导图
        </Menu.Item>
        <Menu.Item
            disabled={!note.hasExplanation}
            onClick={() => handleResourceClick(note.noteId, 'explanation')}
        >
          <AudioOutlined /> 笔记讲解
        </Menu.Item>
        <Menu.Item
            disabled={!note.hasExtract}
            onClick={() => handleResourceClick(note.noteId, 'summary')}
        >
          <FileOutlined /> 笔记摘要
        </Menu.Item>
      </Menu>
  );

  // 渲染笔记列表项
  const renderNoteItem = (note: Note) => (
      <List.Item className="note-list-item">
        <div className="note-item-content">
          <div className="note-item-header">
            <div className="note-item-title">
              <FileTextFilled style={{ color: '#1890ff', marginRight: 8 }} />
              {note.title}
            </div>
            <div className="note-item-meta">
              <span className="note-date">{note.createTime.split(' ')[0]}</span>
              <span className="note-category">{note.subject}</span>
            </div>
          </div>

          <div className="note-item-body">
            <div className="note-summary">
              {note.subject} · {note.createTime}
            </div>

            <div className="note-item-tags">
              <Tag icon={<TagsOutlined />} color="blue">{note.subject}</Tag>
              <Tag color={note.hasExtract ? 'green' : 'default'}>摘要</Tag>
              <Tag color={note.hasMindMap ? 'green' : 'default'}>思维导图</Tag>
              <Tag color={note.hasKeywords ? 'green' : 'default'}>关键词</Tag>
              <Tag color={note.hasExplanation ? 'green' : 'default'}>讲解</Tag>
            </div>

            {note.imageName && (
                <div className="note-item-image">
                  <Image
                      src={`${UPLOADS_URL}/${note.imageName}`}
                      alt="笔记图片"
                      width={80}
                      height={60}
                      style={{ objectFit: 'cover' }}
                  />
                </div>
            )}
          </div>
        </div>

        <div className="note-item-actions">
          <Tooltip title="查看详情">
            <Button
                type="primary"
                icon={<EyeOutlined />}
                size="middle"
                onClick={() => {
                  setSelectedNote(note);
                  setNotesSubTab('specific');
                }}
            />
          </Tooltip>

          <Dropdown overlay={renderResourceMenu(note)} trigger={['click']}>
            <Button icon={<MoreOutlined />} size="middle" />
          </Dropdown>
        </div>
      </List.Item>
  );

  // 处理搜索
  const handleNoteSearch = () => {
    getAllNotes(false);
  };

  // 重置搜索
  const resetSearch = () => {
    searchForm.resetFields();
    getAllNotes(false);
  };

  const renderAllNodePage = () => {
    return (
        <Spin spinning={loading.notes || loading.subjects}>
          <div className="notes-grid">
            <div className="notes-filter">
              <Form form={searchForm} layout="inline" onFinish={handleNoteSearch}>
                {/*<Form.Item name="keyword" style={{ marginBottom: 16 }}>*/}
                {/*  <Input*/}
                {/*    placeholder="搜索笔记标题或内容..."*/}
                {/*    prefix={<SearchOutlined />}*/}
                {/*    style={{ width: 300, marginRight: 16 }}*/}
                {/*  />*/}
                {/*</Form.Item>*/}
                <Form.Item name="subject" style={{ marginBottom: 16 }}>
                  <Select
                    placeholder="全部学科"
                    style={{ width: 200, marginRight: 16 }}
                    allowClear
                    loading={loading.subjects}
                  >
                    {subjects.map((subject) => (
                        <Select.Option key={subject} value={subject}>
                          {subject}
                        </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={notes.length > 0 ? <ReloadOutlined /> : <SearchOutlined />}
                  >
                    {notes.length > 0 ? '刷新' : '查询'}
                  </Button>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => getAllNotes(true)}
                    style={{ marginLeft: 8 }}
                  >
                    筛选
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={resetSearch}
                  >
                    重置
                  </Button>
                </Form.Item>
              </Form>
            </div>
            {notes.length > 0 ? (
                <div className="notes-list-container">
                  <List
                      className="notes-list"
                      itemLayout="horizontal"
                      dataSource={notes}
                      renderItem={renderNoteItem}
                      pagination={{
                        current: pagination.pageNum,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        onChange: (page, pageSize) => {
                          setPagination(prev => ({ ...prev, pageNum: page, pageSize }));
                          getAllNotes(false);
                        },
                        showSizeChanger: true,
                        showTotal: total => `共 ${total} 条笔记`
                      }}
                  />
                </div>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无笔记数据"
                    style={{ margin: '40px 0' }}
                >
                  <Button type="primary" icon={<PlusOutlined />}>创建新笔记</Button>
                </Empty>
            )}
          </div>
        </Spin>
    );
  };

  const renderExtractDetail = () => {
    if (!selectedNoteDetail || !selectedNote) return null;

    return (
        <div className="note-explanation-content">
          <div className="note-detail-explanation-header">
            <h3>笔记内容</h3>
          </div>
          <div className="note-explanation-scroll-container">
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
              {selectedNoteDetail.content}
            </ReactMarkdown>
          </div>
        </div>
    );
  };

  const renderMindMapdetail = () => {
    if (!selectedNoteDetail?.mindMap) return (
        <Empty
            description="该笔记暂无思维导图"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary">生成思维导图</Button>
        </Empty>
    );

    return (
        <div className="note-explanation-content">
          <div className="note-detail-explanation-header">
            <h3>思维导图解析</h3>
          </div>
          <div className="note-explanation-scroll-container">
            {renderMindMapEditor()}
          </div>
        </div>
    );
  };

  const renderExplanationDetail = () => {
    if (!selectedNoteDetail) return null;

    return (
        <div className="note-explanation-content">
          <div className="note-detail-explanation-header">
            {/*<AudioOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 10 }} />*/}
            <h3>智能讲解：{selectedNoteDetail.title}</h3>
          </div>

          {selectedNoteDetail.explanation ? (
              <div className="note-explanation-scroll-container">
                <div className="explanation-text">
                  <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                  >
                    {selectedNoteDetail.explanation}
                  </ReactMarkdown>
                </div>
              </div>
          ) : (
              <Empty
                  description="该笔记暂无讲解内容"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary">生成讲解</Button>
              </Empty>
          )}
        </div>
    );
  };

  const renderNodeDetail = () => {
    if (!selectedNote) return null;

    return (
        <Col span={16}>
          <Card
              className="note-detail-card"
              tabList={[
                { key: 'original', tab: '笔记内容' },
                { key: 'mindmap', tab: '思维导图' },
                { key: 'explanation', tab: '智能讲解' },
              ]}
              activeTabKey={noteDetailTab}
              onTabChange={(key) => setNoteDetailTab(key as NoteDetailTabKey)}
              extra={
                <div style={{
                  position: 'relative', // 添加相对定位
                  zIndex: 1, // 确保按钮在层级最上方
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 0, // 移除负边距
                  marginBottom: -50 // 移除负边距
                }}>
                  <Button
                      type="primary"
                      icon={<EditOutlined/>}
                      style={{
                        height: 32,
                        padding: '0 15px',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative', // 确保按钮在层级上方
                        zIndex: 2 // 更高的层级
                      }}
                      onClick={reEdite}
                  >
                    前往编辑
                  </Button>
                </div>
              }
          >
            <Spin spinning={loading.detail}>
              {noteDetailTab === 'original' && renderExtractDetail()}
              {noteDetailTab === 'mindmap' && renderMindMapdetail()}
              {noteDetailTab === 'explanation' && renderExplanationDetail()}
            </Spin>
          </Card>
        </Col>
    );
  };

  const renderSpecificNote = () => {
    if (!selectedNote) {
      return (
          <div className="note-detail-empty">
            <Empty
                description="请先选择一个笔记"
                imageStyle={{height: 80}}
            >
              <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setNotesSubTab('all-notes')}
              >
                返回笔记列表
              </Button>
            </Empty>
          </div>
      );
    }

    return (
        <div className="note-detail-container">
          <Row gutter={24}>
            <Col span={8}>
              <Card
                  title={selectedNote.title}
                  className="note-summary-card"
                  extra={
                    <div className="note-tags-container">
                      <Tag color="blue">{selectedNote.subject}</Tag>
                    </div>
                  }
              >
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="笔记ID">{selectedNote.noteId}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{selectedNote.createTime}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{selectedNote.updateTime}</Descriptions.Item>
                </Descriptions>
                {selectedNote.imageName && (
                    <div className="image-preview">
                      <Image
                          src={`${UPLOADS_URL}/${selectedNote.imageName}`}
                          alt="笔记原图"
                          placeholder={
                            <div style={{
                              background: '#f5f5f5',
                              height: 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <span>加载笔记原图...</span>
                            </div>
                          }
                          style={{
                            maxHeight: '340px',
                            width: '100%',
                            objectFit: 'contain'
                          }}
                      />
                    </div>
                )}

                <Divider orientation="left">资源状态</Divider>
                <div className="resource-status">
                  <Tag color={selectedNoteDetail?.content ? 'green' : 'red'}>摘要</Tag>
                  <Tag color={selectedNote.hasMindMap ? 'green' : 'red'}>思维导图</Tag>
                  <Tag color={selectedNote.hasKeywords ? 'green' : 'red'}>关键词</Tag>
                  <Tag color={selectedNote.hasExplanation ? 'green' : 'red'}>讲解</Tag>
                </div>
                <Divider orientation="left">关键词</Divider>
                <div className="management-keywords-container">
                  {selectedNoteDetail?.keywords && selectedNoteDetail.keywords.length > 0 ? (
                      <div className="management-keywords-list">
                        {selectedNoteDetail.keywords.map((keyword, index) => (
                            <Tag
                                key={index}
                                color={getTagColor(index)}
                                className="keyword-tag"
                            >
                              {keyword.term}
                            </Tag>
                        ))}
                      </div>
                  ) : (
                      <div className="no-keywords">暂无关键词</div>
                  )}
                </div>
              </Card>
            </Col>
            {renderNodeDetail()}
          </Row>
        </div>
    );
  };

  return (
      <>
        <Card
            title="笔记管理"
            tabList={[
              { key: 'all-notes', tab: '所有笔记' },
              { key: 'specific', tab: '笔记详情' }
            ]}
            activeTabKey={notesSubTab}
            onTabChange={(key) => setNotesSubTab(key as NotesSubTabKey)}
            extra={
                notesSubTab === 'all-notes' && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/notes/index')}
                    >新建笔记</Button>
                )
            }
        >
          {notesSubTab === 'all-notes' ? renderAllNodePage() : renderSpecificNote()}
        </Card>

        {/* 节点内容模态框 */}
        <Modal
            title="节点内容"
            open={isNodeContentModalVisible}
            onOk={() => setIsNodeContentModalVisible(false)}
            onCancel={() => setIsNodeContentModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setIsNodeContentModalVisible(false)}>
                关闭
              </Button>
            ]}
            width={800}
        >
          <div style={{
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            maxHeight: '60vh',
            overflowY: 'auto'
          }}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
              {currentNodeContent}
            </ReactMarkdown>
          </div>
        </Modal>
      </>
  );
};

export default NotesManagementPage;
