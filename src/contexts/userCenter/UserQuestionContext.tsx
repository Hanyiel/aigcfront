import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Question {
    question_id: string;
    content: string;
    type: string;
    isWrong: boolean;
    hasMindMap: boolean;
    hasKeywords: boolean;
    hasExplanation: boolean;
    hasAutoScoreReport: boolean;
    hasRelatedItems: boolean;
}
interface Questions {
    total: number;
    questions: Question[] | null;
}
// 摘要
interface QuestionExtract {
    question_id: string;
    content: string;
}
// 思维导图
interface MindMapNode {
    id: string;
    label: string;
    color?: string;
    link?: string;
    position: {
        x: number;
        y: number;
    };
    children: MindMapNode[];
}
interface MindMapData {
    mindmap_id: string | null;
    root_node: MindMapNode[] | null;
}
interface MindMap {
    question_id: string;
    mindMap: MindMapData | null;
}
// 关键词
interface Keyword {
    term: string;
    tfidf_score: number;
}
interface Keywords {
    question_id: string;
    keywords: Keyword[];
}
// 讲解
interface Explanation {
    question_id: string;
    explanation: string;
}
// 批改
interface AutoScoreReport {
    code: number;
    score: number;
    correct_answer: string;
    your_answer: string;
    error_analysis: string[];
    explanation: string[];
    knowledge_point: string[];
}
interface AutoGrade {
    question_id: string;
    autoScoreReport: AutoScoreReport[];
}
// 相关内容
interface RelatedNote {
    note_id: string;
    title: string;
    content: string;
    similarity: 0.85;
}
interface RelatedQuestions {
    question_id: string;
    content: string;
    similarity: number;
}

interface UserQuestionContextType {

}

const UserQuestionContext = createContext<UserQuestionContextType>({} as UserQuestionContextType);

const UserQuestionProvider: React.FC<{ children: React.ReactNode}> = ({ children}) => {
    // 获取当前题目的摘要
    // 获取当前题目的图片
    // 获取当前题目的思维导图
    // 获取当前题目的关键词
    // 获取当前题目的智能讲解
    // 获取当前题目的相关词条
    // 保存（更新）当前题目所有信息
    return (
        <UserQuestionContext.Provider value={{

        }}>
            {children}
        </UserQuestionContext.Provider>
    )
}

