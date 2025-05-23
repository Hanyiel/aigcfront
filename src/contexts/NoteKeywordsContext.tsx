// src/contexts/KeywordsContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface KeywordData {
  term: string;
  tfidfScore: number;
  subject?: string;
  relatedNotes?: string[];
  relatedQuestions?: string[];
}

interface ImageKeywords {
  imageId: string;
  keywords: KeywordData[];
  createdAt: number;
}

interface KeywordsContextType {
  keywordsData: ImageKeywords[];
  saveKeywords: (imageId: string, keywords: KeywordData[]) => void;
  deleteKeywords: (imageId: string) => void;
  getKeywordsByImage: (imageId: string) => KeywordData[];
  currentKeywords?: KeywordData[];
}

const KeywordsContext = createContext<KeywordsContextType>({} as KeywordsContextType);
export const KeywordsProvider = ({ children }: { children: React.ReactNode }) => {
  const [keywordsData, setKeywordsData] = useState<ImageKeywords[]>(() => {
    const saved = localStorage.getItem('keywordsData');
    return saved ? JSON.parse(saved) : [];
  });

  // 持久化存储
  useEffect(() => {
    localStorage.setItem('keywordsData', JSON.stringify(keywordsData));
  }, [keywordsData]);

  const saveKeywords = (imageId: string, keywords: KeywordData[]) => {
    setKeywordsData(prev => [
      ...prev.filter(k => k.imageId !== imageId),
      {
        imageId,
        keywords,
        createdAt: Date.now()
      }
    ]);
  };

  const deleteKeywords = (imageId: string) => {
    setKeywordsData(prev => prev.filter(k => k.imageId !== imageId));
  };

  const getKeywordsByImage = (imageId: string) => {
    return keywordsData.find(k => k.imageId === imageId)?.keywords || [];
  };

  return (
    <KeywordsContext.Provider
      value={{
        keywordsData,
        saveKeywords,
        deleteKeywords,
        getKeywordsByImage,
        currentKeywords: keywordsData[0]?.keywords // 根据实际需求调整
      }}>
      {children}
    </KeywordsContext.Provider>
  );
};

export const useKeywords = () => {
  const context = useContext(KeywordsContext);
  if (!context) {
    throw new Error('useKeywords must be used within a KeywordsProvider');
  }
  return context;
};
