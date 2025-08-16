// src/contexts/UserQuestionContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { logout } from '../../services/auth';

const API_URL = 'http://localhost:8000/api';

interface Question {
  questionId: string;
  content: string;
  type: string;
  isWrong: boolean;
  hasMindMap: boolean;
  hasKeywords: boolean;
  hasExplanation: boolean;
  hasAutoScoreReport: boolean;
  hasRelatedItems: boolean;
  imageName?: string;
  createTime: string;
  updateTime: string;
}

interface QuestionBasic {
  questionId: string;
  content: string;
  type: string;
  isWrong: boolean;
}

interface MindNode {
  id: string;
  label: string;
  color?: string;
  link?: string;
  position: {
    x: number;
    y: number;
  };
  children: MindNode[];
}
export interface MindMapData {
  nodes: MindNode[];
  svgUrl?: string;
  generatedAt: number;
}

interface QuestionMindMap {
  mindMap_id: string;
  mindMapData: MindMapData
}

interface Keyword {
  term: string;
  tfidf_score: number;
}

interface QuestionKeywords {
  keywords: Keyword[];
}

interface QuestionExplanation {
  explanation: string;
}

interface AutoScoreReport {
  code: number;
  score: number;
  correct_answer: string;
  your_answer: string;
  error_analysis: string[];
  explanation: string[];
  knowledge_point: string[];
}

interface QuestionAutoScore {
  autoScoreReport: AutoScoreReport;
}

interface RelatedNote {
  noteId: string;
  title: string;
  content: string;
  similarity: number;
}

interface RelatedQuestion {
  questionId: string;
  content: string;
  similarity: number;
}

interface QuestionRelatedItems {
  relatedItems: {
    related_notes: RelatedNote[];
    related_questions: RelatedQuestion[];
  };
}

interface UserQuestionContextType {
  getQuestionBasic: (questionId: string) => Promise<QuestionBasic | null>;
  getQuestionMindMap: (questionId: string) => Promise<QuestionMindMap | null>;
  getQuestionKeywords: (questionId: string) => Promise<QuestionKeywords | null>;
  getQuestionExplanation: (questionId: string) => Promise<QuestionExplanation | null>;
  getQuestionAutoScore: (questionId: string) => Promise<QuestionAutoScore | null>;
  getQuestionRelatedItems: (questionId: string) => Promise<QuestionRelatedItems | null>;
}

const UserQuestionContext = createContext<UserQuestionContextType>({} as UserQuestionContextType);

const UserQuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        logout();
        window.location.href = '/login';
        return null;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      message.error(error instanceof Error ? error.message : 'API请求错误');
      return null;
    }
  };

  const getQuestionBasic = useCallback(async (questionId: string) => {
    const result = await fetchWithAuth(`${API_URL}/questions/${questionId}/basic`);
    return result?.data || null;
  }, []);

  const getQuestionMindMap = useCallback(async (questionId: string) => {
    const result = await fetchWithAuth(`${API_URL}/questions/${questionId}/mindmap`);
    return result?.data || null;
  }, []);

  const getQuestionKeywords = useCallback(async (questionId: string) => {
    const result = await fetchWithAuth(`${API_URL}/questions/${questionId}/keywords`);
    return result?.data || null;
  }, []);

  const getQuestionExplanation = useCallback(async (questionId: string) => {
    const result = await fetchWithAuth(`${API_URL}/questions/${questionId}/explanation`);
    return result?.data || null;
  }, []);

  const getQuestionAutoScore = useCallback(async (questionId: string) => {
    const result = await fetchWithAuth(`${API_URL}/questions/${questionId}/auto-score`);
    return result?.data || null;
  }, []);

  const getQuestionRelatedItems = useCallback(async (questionId: string) => {
    const result = await fetchWithAuth(`${API_URL}/questions/${questionId}/related-items`);
    return result?.data || null;
  }, []);

  return (
    <UserQuestionContext.Provider
      value={{
        getQuestionBasic,
        getQuestionMindMap,
        getQuestionKeywords,
        getQuestionExplanation,
        getQuestionAutoScore,
        getQuestionRelatedItems,
      }}
    >
      {children}
    </UserQuestionContext.Provider>
  );
};

export { UserQuestionContext, UserQuestionProvider };
