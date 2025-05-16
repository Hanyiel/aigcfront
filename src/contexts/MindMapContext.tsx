// src/contexts/MindMapContext.tsx
import React, { createContext, useContext, useReducer, Dispatch, useEffect } from 'react';

// 类型定义
export interface MindNode {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  childrenIds: string[];
  style?: {
    backgroundColor?: string;
    color?: string;
  };
}

export interface MindEdge {
  id: string;
  from: string;
  to: string;
}

interface MindMapState {
  nodes: MindNode[];
  edges: MindEdge[];
  selectedNodeId?: string;
  viewState: {
    offsetX: number;
    offsetY: number;
    scale: number;
  };
}

type MindMapAction =
  | { type: 'ADD_NODE'; payload: Omit<MindNode, 'id' | 'childrenIds'> }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'UPDATE_NODE_CONTENT'; payload: { id: string; content: string } }
  | { type: 'MOVE_NODE'; payload: { id: string; x: number; y: number } }
  | { type: 'SELECT_NODE'; payload?: string }
  | { type: 'ADD_EDGE'; payload: Omit<MindEdge, 'id'> }
  | { type: 'DELETE_EDGE'; payload: string }
  | { type: 'UPDATE_VIEWPORT'; payload: Partial<MindMapState['viewState']> }
  | { type: 'RESET_VIEWPORT' };

interface MindMapContextType {
  state: MindMapState;
  dispatch: Dispatch<MindMapAction>;
  getNodeChildren: (nodeId: string) => MindNode[];
  getNodeRelations: (nodeId: string) => {
    parent?: MindNode;
    children: MindNode[];
    siblings: MindNode[];
  };
}

// 初始状态
const initialState: MindMapState = {
  nodes: [
    {
      id: 'root',
      content: '中心主题',
      x: 0,
      y: 0,
      width: 160,
      height: 40,
      childrenIds: [],
    }
  ],
  edges: [],
  viewState: {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  },
};

// Reducer实现
const mindMapReducer = (state: MindMapState, action: MindMapAction): MindMapState => {
  switch (action.type) {
    case 'ADD_NODE': {
      const newNodeId = "uuidv4()";
      const parentId = action.payload.parentId;

      return {
        ...state,
        nodes: [
          ...state.nodes,
          {
            ...action.payload,
            id: newNodeId,
            childrenIds: [],
          }
        ],
        edges: parentId ? [
          ...state.edges,
        ] : state.edges
      };
    }

    case 'DELETE_NODE': {
      const nodeId = action.payload;
      return {
        ...state,
        nodes: state.nodes.filter(n => n.id !== nodeId),
        edges: state.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
      };
    }

    case 'UPDATE_NODE_CONTENT': {
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id
            ? { ...node, content: action.payload.content }
            : node
        )
      };
    }

    case 'MOVE_NODE': {
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id
            ? { ...node, x: action.payload.x, y: action.payload.y }
            : node
        )
      };
    }

    case 'SELECT_NODE': {
      return { ...state, selectedNodeId: action.payload };
    }

    case 'UPDATE_VIEWPORT': {
      return {
        ...state,
        viewState: {
          ...state.viewState,
          ...action.payload
        }
      };
    }

    case 'RESET_VIEWPORT': {
      return {
        ...state,
        viewState: {
          offsetX: 0,
          offsetY: 0,
          scale: 1
        }
      };
    }

    default:
      return state;
  }
};

// 创建Context
const MindMapContext = createContext<MindMapContextType | null>(null);

// Provider组件
export const MindMapProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(mindMapReducer, initialState);

  // 持久化存储（可选）
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('mindMapState');
      if (savedState) {
        dispatch({ type: 'RESET_VIEWPORT' }); // 保留视图状态
        // 需要时合并本地存储数据
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
    }
  }, []);

  // 实用方法
  const getNodeChildren = (nodeId: string) => {
    return state.nodes.filter(node =>
      state.edges.some(edge => edge.from === nodeId && edge.to === node.id))

  };

  const getNodeRelations = (nodeId: string) => {
    const parentEdge = state.edges.find(edge => edge.to === nodeId);
    const parent = parentEdge
      ? state.nodes.find(n => n.id === parentEdge.from)
      : undefined;

    const siblings = parent
      ? getNodeChildren(parent.id).filter(n => n.id !== nodeId)
      : [];

    return {
      parent,
      children: getNodeChildren(nodeId),
      siblings
    };
  };

  return (
    <MindMapContext.Provider value={{ state, dispatch, getNodeChildren, getNodeRelations }}>
      {children}
    </MindMapContext.Provider>
  );
};

// 自定义Hook
export const useMindMapContext = () => {
  const context = useContext(MindMapContext);
  if (!context) {
    throw new Error('useMindMapContext must be used within a MindMapProvider');
  }
  return context;
};
