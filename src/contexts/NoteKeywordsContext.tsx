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
  updateKeywords: (imageId: string, keywords: KeywordData[]) => void;
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

  const updateKeywords = (imageId: string, newKeywords: KeywordData[]) => {
    setKeywordsData(prev =>
      prev.map(item =>
        item.imageId === imageId
          ? { ...item, keywords: newKeywords }
          : item
      )
    );
  };

  const deleteKeywords = (imageId: string) => {
    setKeywordsData(prev => prev.filter(k => k.imageId !== imageId));
  };

  const getKeywordsByImage = (imageId: string) => {
    if (!imageId) return [];
    return keywordsData.find(k => k.imageId === imageId)?.keywords || [];
  };

  return (
      <KeywordsContext.Provider
          value={{
            keywordsData,
            saveKeywords,
            updateKeywords,
            deleteKeywords,
            getKeywordsByImage,
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
