import React, { createContext, useContext, useEffect, useState } from 'react';

export interface QuestionKeywordData {
  term: string;
  tfidfScore: number;
  subject?: string;
  relatedNotes?: string[];
  relatedQuestions?: string[];
}

interface QuestionImageKeywords {
  questionImageId: string;
  keywords: QuestionKeywordData[];
  createdAt: number;
}

interface QuestionKeywordsContextType {
  questionKeywordsData: QuestionImageKeywords[];
  saveQuestionKeywords: (questionImageId: string, keywords: QuestionKeywordData[]) => void;
  deleteQuestionKeywords: (questionImageId: string) => void;
  getKeywordsByQuestionImage: (questionImageId: string) => QuestionKeywordData[];
  updateQuestionKeywords: (questionImageId: string, newKeywords: QuestionKeywordData[]) => void; // 新增更新方法
}

const QuestionKeywordsContext = createContext<QuestionKeywordsContextType>({} as QuestionKeywordsContextType);

export const QuestionKeywordsProvider = ({ children }: { children: React.ReactNode }) => {
  const [questionKeywordsData, setQuestionKeywordsData] = useState<QuestionImageKeywords[]>(() => {
    const saved = localStorage.getItem('questionKeywordsData');
    return saved ? JSON.parse(saved) : [];
  });

  // 持久化存储
  useEffect(() => {
    localStorage.setItem('questionKeywordsData', JSON.stringify(questionKeywordsData));
  }, [questionKeywordsData]);

  const saveQuestionKeywords = (questionImageId: string, keywords: QuestionKeywordData[]) => {
    setQuestionKeywordsData(prev => [
      ...prev.filter(k => k.questionImageId !== questionImageId),
      {
        questionImageId,
        keywords,
        createdAt: Date.now()
      }
    ]);
  };

  // 新增：更新关键词
  const updateQuestionKeywords = (questionImageId: string, newKeywords: QuestionKeywordData[]) => {
    setQuestionKeywordsData(prev =>
      prev.map(item =>
        item.questionImageId === questionImageId
          ? { ...item, keywords: newKeywords }
          : item
      )
    );
  };

  const deleteQuestionKeywords = (questionImageId: string) => {
    setQuestionKeywordsData(prev => prev.filter(k => k.questionImageId !== questionImageId));
  };

  const getKeywordsByQuestionImage = (questionImageId: string) => {
    if (!questionImageId) return [];
    return questionKeywordsData.find(k => k.questionImageId === questionImageId)?.keywords || [];
  };

  return (
    <QuestionKeywordsContext.Provider
      value={{
        questionKeywordsData,
        saveQuestionKeywords,
        deleteQuestionKeywords,
        getKeywordsByQuestionImage,
        updateQuestionKeywords // 暴露更新方法
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
