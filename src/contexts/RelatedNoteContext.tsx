// src/contexts/RelatedNoteContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
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

interface RelatedNoteContextType {
  relatedData: RelatedData | null;
  loading: boolean;
  error: string | null;
  fetchRelatedData: (file: File) => Promise<void>;
  clearData: () => void;
}

const RelatedNoteContext = createContext<RelatedNoteContextType>({} as RelatedNoteContextType);

export const RelatedNoteProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [relatedData, setRelatedData] = useState<RelatedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedData = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:8000/api/questions/relate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '获取关联数据失败');
      }
      const responseData = await response.json();
      const result = responseData.data;
      console.log('result',result);
      console.log('data',result.data);

      setRelatedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      message.error('获取关联数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setRelatedData(null);
  }, []);

  return (
    <RelatedNoteContext.Provider value={{
      relatedData,
      loading,
      error,
      fetchRelatedData,
      clearData
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
