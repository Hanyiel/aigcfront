import React, { createContext, useContext, useEffect, useState } from 'react';
import { message } from 'antd';

export interface RelatedNote {
  note_id: number;
  title: string;
  subject: string;
  content: string;
  point: string[];
  similarity: number;
}

export interface RelatedQuestion {
  question_id: number;
  subject_id: string;
  content: string;
  answer: string;
  similarity: number;
}

export interface RelatedData {
  related_notes: RelatedNote[];
  related_questions: RelatedQuestion[];
  knowledge_graph: string[];
}

interface RelatedNoteImageData {
  questionImageId: string;
  data: RelatedData;
  createdAt: number;
}

interface RelatedNoteContextType {
  relatedNoteData: RelatedNoteImageData[];
  saveRelatedNotes: (questionImageId: string, data: RelatedData) => void;
  deleteRelatedNotes: (questionImageId: string) => void;
  getRelatedNotesByImage: (questionImageId: string) => RelatedData | null;
  updateRelatedNotes: (questionImageId: string, newData: RelatedData) => void;
}

const RelatedNoteContext = createContext<RelatedNoteContextType>({} as RelatedNoteContextType);

export const RelatedNoteProvider = ({ children }: { children: React.ReactNode }) => {
  const [relatedNoteData, setRelatedNoteData] = useState<RelatedNoteImageData[]>(() => {
    const saved = localStorage.getItem('relatedNoteData');
    return saved ? JSON.parse(saved) : [];
  });

  // 持久化存储
  useEffect(() => {
    localStorage.setItem('relatedNoteData', JSON.stringify(relatedNoteData));
  }, [relatedNoteData]);

  const saveRelatedNotes = (questionImageId: string, data: RelatedData) => {
    setRelatedNoteData(prev => [
      ...prev.filter(k => k.questionImageId !== questionImageId),
      {
        questionImageId,
        data,
        createdAt: Date.now()
      }
    ]);
  };

  const updateRelatedNotes = (questionImageId: string, newData: RelatedData) => {
    setRelatedNoteData(prev =>
      prev.map(item =>
        item.questionImageId === questionImageId
          ? { ...item, data: newData }
          : item
      )
    );
  };

  const deleteRelatedNotes = (questionImageId: string) => {
    setRelatedNoteData(prev => prev.filter(k => k.questionImageId !== questionImageId));
  };

  const getRelatedNotesByImage = (questionImageId: string) => {
    if (!questionImageId) return null;
    return relatedNoteData.find(k => k.questionImageId === questionImageId)?.data || null;
  };

  return (
    <RelatedNoteContext.Provider
      value={{
        relatedNoteData,
        saveRelatedNotes,
        deleteRelatedNotes,
        getRelatedNotesByImage,
        updateRelatedNotes
      }}>
      {children}
    </RelatedNoteContext.Provider>
  );
};

export const useRelatedNote = () => {
  const context = useContext(RelatedNoteContext);
  if (!context) {
    throw new Error('useRelatedNote必须在RelatedNoteProvider内使用');
  }
  return context;
};
