// src/context/MindMapContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

// 类型定义
export interface MindNode {
  id: string;
  label: string;
  color?: string;
  link?: string;
  position: {
    x: number;
    y: number;
  };
  children: MindNode[];
}

export interface MindMapData {
  nodes: MindNode[];
  svgUrl?: string;
  generatedAt: number;
}

interface MindMapContextType {
  mindMaps: Record<string, MindMapData>; // imageId到导图的映射
  currentMindMap?: MindMapData;
  saveMindMap: (imageId: string, data: MindMapData) => void;
  updateMindMap: (imageId:string, updater: (prev: MindMapData) => MindMapData) => void;
  clearMindMap: (imageId: string) => void;
  exportAsImage: (options?: ExportOptions) => Promise<void>;
  exportAsSVG: () => void;
}

interface ExportOptions {
  format?: 'png' | 'jpeg';
  quality?: number;
}

const MindMapContext = createContext<MindMapContextType>({
  mindMaps: {},
  saveMindMap: () => {},
  updateMindMap: () => {},
  clearMindMap: () => {},
  exportAsImage: async () => {},
  exportAsSVG: () => {},
  currentMindMap: undefined
});
export const MindMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mindMaps, setMindMaps] = useState<Record<string, MindMapData>>({});

  // 保存思维导图数据
  const saveMindMap = useCallback((imageId: string, data: MindMapData) => {
    setMindMaps(prev => ({
      ...prev,
      [imageId]: {
        ...data,
        generatedAt: Date.now()
      }
    }));
  }, []);

  // 更新思维导图
  const updateMindMap = useCallback((imageId: string, updater: (prev: MindMapData) => MindMapData) => {
    setMindMaps(prev => {
      if (!prev[imageId]) return prev;

      const updated = updater(prev[imageId]);
      return {
        ...prev,
        [imageId]: updated
      };
    });
  }, []);

  // 清除指定导图
  const clearMindMap = useCallback((imageId: string) => {
    setMindMaps(prev => {
      const newMaps = { ...prev };
      delete newMaps[imageId];
      return newMaps;
    });
  }, []);

  // 导出为图片
  const exportAsImage = useCallback(async (options?: ExportOptions) => {
    // 实现导出逻辑（需要配合具体渲染方案）
    console.log('Exporting as image:', options);
  }, []);

  // 导出为SVG
  const exportAsSVG = useCallback(() => {
    // 实现SVG导出逻辑
    console.log('Exporting as SVG');
  }, []);

  return (
    <MindMapContext.Provider value={{
      mindMaps,
      currentMindMap: undefined, // 可根据需要扩展当前导图状态
      saveMindMap,
      updateMindMap,
      clearMindMap,
      exportAsImage,
      exportAsSVG
    }}>
      {children}
    </MindMapContext.Provider>
  );
};

export const useMindMapContext = () => useContext(MindMapContext);
