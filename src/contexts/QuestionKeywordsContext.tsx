// src/contexts/QuestionKeywordsContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface QuestionKeywordData {
  term: string;
  tfidfScore: number;
  subject?: string;
  relatedNotes?: string[];
  relatedQuestions?: string[];
}

interface QuestionImageKeywords {
  questionImageId: string;  // Changed from imageId
  keywords: QuestionKeywordData[];  // Changed interface type
  createdAt: number;
}

interface QuestionKeywordsContextType {  // Changed interface name
  questionKeywordsData: QuestionImageKeywords[];  // Changed property name
  saveQuestionKeywords: (questionImageId: string, keywords: QuestionKeywordData[]) => void;  // Changed method name
  deleteQuestionKeywords: (questionImageId: string) => void;  // Changed method name
  getKeywordsByQuestionImage: (questionImageId: string) => QuestionKeywordData[];  // Changed method name
  currentQuestionKeywords?: QuestionKeywordData[];  // Changed property name
}

const QuestionKeywordsContext = createContext<QuestionKeywordsContextType>({} as QuestionKeywordsContextType);

export const QuestionKeywordsProvider = ({ children }: { children: React.ReactNode }) => {
  const [questionKeywordsData, setQuestionKeywordsData] = useState<QuestionImageKeywords[]>(() => {
    const saved = localStorage.getItem('questionKeywordsData');  // Changed storage key
    return saved ? JSON.parse(saved) : [];
  });

  // 持久化存储
  useEffect(() => {
    localStorage.setItem('questionKeywordsData', JSON.stringify(questionKeywordsData));  // Changed storage key
  }, [questionKeywordsData]);

  const saveQuestionKeywords = (questionImageId: string, keywords: QuestionKeywordData[]) => {
    setQuestionKeywordsData(prev => [
      ...prev.filter(k => k.questionImageId !== questionImageId),  // Changed filter key
      {
        questionImageId,  // Changed property name
        keywords,
        createdAt: Date.now()
      }
    ]);
  };

  const deleteQuestionKeywords = (questionImageId: string) => {
    setQuestionKeywordsData(prev => prev.filter(k => k.questionImageId !== questionImageId));  // Changed filter key
  };

  const getKeywordsByQuestionImage = (questionImageId: string) => {
    if (!questionImageId) return [];
    return questionKeywordsData.find(k => k.questionImageId === questionImageId)?.keywords || [];  // Changed find key
  };

  return (
    <QuestionKeywordsContext.Provider
      value={{
        questionKeywordsData,
        saveQuestionKeywords,
        deleteQuestionKeywords,
        getKeywordsByQuestionImage,
      }}>
      {children}
    </QuestionKeywordsContext.Provider>
  );
};

export const useQuestionKeywords = () => {
  const context = useContext(QuestionKeywordsContext);
  if (!context) {
    throw new Error('useQuestionKeywords must be used within a QuestionKeywordsProvider');
  }
  return context;
};
