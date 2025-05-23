// src/contexts/AutoGradeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { message } from 'antd';

export type GradingCode = 0 | 1 | 2;

export interface GradingResult {
  imageId: string;            // 关联的图片ID
  code: GradingCode;          // 批改结果代码
  score: number;              // 本题得分
  correct_answer: string[];   // 标准答案
  your_answer: string[];      // 学生答案
  error_analysis: string[];   // 错误分析
  knowledge_point: string[];  // 关联知识点
  timestamp: number;          // 批改时间戳
}

interface AutoGradeContextType {
  gradingResults: GradingResult[];
  currentGrading: GradingResult | null;
  loading: boolean;
  error: Error | null;
  submitForGrading: (file: File, imageId: string) => Promise<GradingResult>;
  saveGradeResult: (result: GradingResult) => void;
  setCurrentGrading: (imageId: string) => void;
  clearResults: () => void;
}

const AutoGradeContext = createContext<AutoGradeContextType>({} as AutoGradeContextType);

export const AutoGradeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([]);
  const [currentGrading, setCurrentResult] = useState<GradingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 提交批改请求
  const submitForGrading = useCallback(async (file: File, imageId: string) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      console.log(localStorage.getItem('authToken'))

      const response = await fetch('http://localhost:8000/api/questions/autograde', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '批改请求失败');
      }
      const responseJson = await response.json();
      const responseData = responseJson.data;
      console.log(responseData);

      // 转换API响应到GradingResult结构
      const gradingResult: GradingResult = {
        imageId,
        code: responseData.code,
        score: responseData.score,
        correct_answer: Array.isArray(responseData.correct_answer)
          ? responseData.correct_answer
          : [responseData.correct_answer],
        your_answer: Array.isArray(responseData.your_answer)
          ? responseData.your_answer
          : [responseData.your_answer],
        error_analysis: responseData.error_analysis || [],
        knowledge_point: responseData.knowledge_points || [],
        timestamp: Date.now()
      };
      console.log(gradingResult);
      setCurrentResult(gradingResult);
      return gradingResult;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('批改失败'));
      message.error('批改失败，请检查网络或图片格式');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存批改结果
  const saveGradeResult = useCallback((result: GradingResult) => {
    setGradingResults(prev => {
      const existingIndex = prev.findIndex(r => r.imageId === result.imageId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = result;
        return updated;
      }
      return [...prev, result];
    });
    setCurrentResult(result);
  }, []);

  // 设置当前批改结果
  const setCurrentGrading = useCallback((imageId: string) => {
    const result = gradingResults.find(r => r.imageId === imageId);
    setCurrentResult(result || null);
  }, [gradingResults]);

  // 清空结果
  const clearResults = useCallback(() => {
    setGradingResults([]);
    setCurrentResult(null);
  }, []);

  return (
    <AutoGradeContext.Provider
      value={{
        gradingResults,
        currentGrading,
        loading,
        error,
        submitForGrading,
        saveGradeResult,
        setCurrentGrading,
        clearResults
      }}
    >
      {children}
    </AutoGradeContext.Provider>
  );
};

export const useAutoGrade = () => {
  const context = useContext(AutoGradeContext);
  if (!context) {
    throw new Error('useAutoGrade必须在AutoGradeProvider内使用');
  }
  return context;
};
