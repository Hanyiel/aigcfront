import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface GradingImageData {
  questionImageId: string;
  gradingResult: GradingResult;
  createdAt: number;
}

interface AutoGradeContextType {
  gradingData: GradingImageData[];
  currentGrading: GradingResult | null;
  saveGradingResult: (questionImageId: string, gradingResult: GradingResult) => void;
  deleteGradingResult: (questionImageId: string) => void;
  getGradingByImageId: (questionImageId: string) => GradingResult | null;
  updateGradingResult: (questionImageId: string, newGradingResult: GradingResult) => void;
  setCurrentGrading: (imageId: string) => void;
  clearResults: () => void;
}

const AutoGradeContext = createContext<AutoGradeContextType>({} as AutoGradeContextType);

export const AutoGradeProvider = ({ children }: { children: React.ReactNode }) => {
  const [gradingData, setGradingData] = useState<GradingImageData[]>(() => {
    const saved = localStorage.getItem('gradingData');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentGrading, setCurrentGradingState] = useState<GradingResult | null>(null);

  // 持久化存储
  useEffect(() => {
    localStorage.setItem('gradingData', JSON.stringify(gradingData));
  }, [gradingData]);

  const saveGradingResult = (questionImageId: string, gradingResult: GradingResult) => {
    setGradingData(prev => [
      ...prev.filter(k => k.questionImageId !== questionImageId),
      {
        questionImageId,
        gradingResult,
        createdAt: Date.now()
      }
    ]);
    setCurrentGradingState(gradingResult);
  };

  const updateGradingResult = (questionImageId: string, newGradingResult: GradingResult) => {
    setGradingData(prev =>
      prev.map(item =>
        item.questionImageId === questionImageId
          ? { ...item, gradingResult: newGradingResult }
          : item
      )
    );
    setCurrentGradingState(newGradingResult);
  };

  const deleteGradingResult = (questionImageId: string) => {
    setGradingData(prev => prev.filter(k => k.questionImageId !== questionImageId));
    if (currentGrading?.imageId === questionImageId) {
      setCurrentGradingState(null);
    }
  };

  const getGradingByImageId = (questionImageId: string) => {
    if (!questionImageId) return null;
    return gradingData.find(k => k.questionImageId === questionImageId)?.gradingResult || null;
  };

  const setCurrentGrading = (imageId: string) => {
    const result = gradingData.find(k => k.questionImageId === imageId)?.gradingResult || null;
    setCurrentGradingState(result);
  };

  const clearResults = () => {
    setGradingData([]);
    setCurrentGradingState(null);
  };

  return (
    <AutoGradeContext.Provider
      value={{
        gradingData,
        currentGrading,
        saveGradingResult,
        deleteGradingResult,
        getGradingByImageId,
        updateGradingResult,
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
