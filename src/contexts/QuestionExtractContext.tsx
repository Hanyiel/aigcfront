// src/contexts/QuestionExtractContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface QuestionExtractData {
  extract_id: string;
  image_id: string;
  text_content: string;
  related_concepts?: string[];
}

interface QuestionExtractContextType {
  questionExtracts: QuestionExtractData[];
  saveQuestionExtract: (data: QuestionExtractData) => void;
  deleteQuestionExtract: (questionExtractId: string) => void;
  getQuestionExtractByImage: (imageId: string) => QuestionExtractData | undefined;
}

const QuestionExtractContext = createContext<QuestionExtractContextType>(null!);

export const QuestionExtractProvider = ({ children }: { children: React.ReactNode }) => {
  const [questionExtracts, setQuestionExtracts] = useState<QuestionExtractData[]>(() => {
    const saved = localStorage.getItem('questionExtracts');
    return saved ? JSON.parse(saved) : [];
  });

  // 数据持久化
  useEffect(() => {
    localStorage.setItem('questionExtracts', JSON.stringify(questionExtracts));
  }, [questionExtracts]);

  const saveQuestionExtract = (data: QuestionExtractData) => {
    setQuestionExtracts(prev => [
      ...prev.filter(q => q.image_id !== data.image_id),
      data
    ]);
    localStorage.setItem(`img_qext_${data.image_id}`, data.extract_id);
  };

  const deleteQuestionExtract = (questionExtractId: string) => {
    setQuestionExtracts(prev => prev.filter(q => q.extract_id !== questionExtractId));
  };

  const getQuestionExtractByImage = (imageId: string) => {
    const qId = localStorage.getItem(`img_qext_${imageId}`);
    return qId ? questionExtracts.find(q => q.extract_id === qId) : undefined;
  };

  return (
    <QuestionExtractContext.Provider
      value={{
        questionExtracts,
        saveQuestionExtract,
        deleteQuestionExtract,
        getQuestionExtractByImage
      }}>
      {children}
    </QuestionExtractContext.Provider>
  );
};

export const useQuestionExtract = () => {
  const context = useContext(QuestionExtractContext);
  if (!context) {
    throw new Error('useQuestionExtract must be used within a QuestionExtractProvider');
  }
  return context;
};
