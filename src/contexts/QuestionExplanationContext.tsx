// src/context/QuestionExplanationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Markdown解析后的结构
export interface ParsedExplanation {
  subject?: 'math' | 'physics' | 'other';
  difficulty?: number;
  knowledgePoints?: string[];
  answer?: string;
}

// 原始讲解数据结构
export interface QuestionExplanation {
  id: string;          // 使用后端返回的ex_001格式
  imageId: string;
  contentMd: string;   // 原始markdown内容
  parsed?: ParsedExplanation; // 解析后的结构（可选）
  createdAt: number;   // 创建时间戳
}

// 题目讲解上下文类型
interface QuestionExplanationContextType {
  explanations: QuestionExplanation[];
  currentExplanation: QuestionExplanation | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  addExplanation: (data: {
    explanationId: string;
    imageId: string;
    contentMd: string;
  }) => void;
  generateExplanation: (imageId: string, file: File) => Promise<void>;
  getExplanationByImage: (imageId: string) => QuestionExplanation | null;
}

const QuestionExplanationContext = createContext<QuestionExplanationContextType>(
    {} as QuestionExplanationContextType
);

export const QuestionExplanationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [explanations, setExplanations] = useState<QuestionExplanation[]>([]);
  const [currentExplanation, setCurrentExplanation] = useState<QuestionExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 添加讲解到列表
  const addExplanation = useCallback((data: {
    explanationId: string;
    imageId: string;
    contentMd: string;
  }) => {
    const newExplanation: QuestionExplanation = {
      id: data.explanationId,
      imageId: data.imageId,
      contentMd: data.contentMd,
      createdAt: Date.now()
    };

    setExplanations(prev => [...prev, newExplanation]);
    setCurrentExplanation(newExplanation);
  }, []);

  // 生成讲解方法
  const generateExplanation = useCallback(async (imageId: string, file: File) => {
    setGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      const token = localStorage.getItem('authToken');

      formData.append('image', file);

      const response = await fetch('http://localhost:8000/api/questions/explanation', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      console.log('生成讲解结果:', result);

      if (result.code !== 200) {
        throw new Error(result.message || '生成讲解失败');
      }

      addExplanation({
        explanationId: result.data.explanation_id,
        imageId,
        contentMd: result.data.content_md
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      console.error('生成讲解失败:', err);
    } finally {
      setGenerating(false);
    }
  }, [addExplanation]);

  // 根据图片获取讲解
  const getExplanationByImage = useCallback((imageId: string) => {
    return explanations.find(e => e.imageId === imageId) || null;
  }, [explanations]);

  return (
      <QuestionExplanationContext.Provider
          value={{
            explanations,
            currentExplanation,
            loading,
            generating,
            error,
            addExplanation,
            generateExplanation,
            getExplanationByImage
          }}
      >
        {children}
      </QuestionExplanationContext.Provider>
  );
};

export const useQuestionExplanationContext = () => useContext(QuestionExplanationContext);
