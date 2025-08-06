import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as child_process from "node:child_process";

/* 用户存储笔记数据结构
    "noteId": "note_001",
    "subject": "高等数学",
    "title": "高等数学微积分笔记",
    "createTime": "2024-07-01 09:30:00",
    "updateTime": "2024-07-02 14:20:00",
    "hasExtract": true, // 是否有摘要
    "hasMindMap": true, // 是否有思维导图
    "hasKeywords": false, // 是否有关键词
    "hasExplanation": true // 是否有讲解
* */


interface StoredNote {
    noteId: string;
    subject: string;
    title: string;
    createTime: string;
    updateTime: string;
    extractId?: string;
    mindMapId?: string;
    hasKeywordsId?: string;
    explanationId?: string;
}
// 查询所有笔记
interface GetAllNotesParams {
    pageNum?: number; // 可选，页码，默认1
    pageSize?: number; // 可选，每页条数，默认10
    subject?:string;//可选，确定科目，为null则为全部
}

// 查询基本信息（摘要）
interface GetNoteBasicParams {
    noteId: string; // 笔记ID（路径参数）
}
// 查询思维导图
interface GetNoteMindmapParams {
    noteId: string; // 笔记ID（路径参数）
}
// 查询关键词
interface GetNoteKeywordsParams {
    noteId: string; // 笔记ID（路径参数）
}
// 查询讲解
interface GetNoteExplanationParams {
    noteId: string; // 笔记ID（路径参数）
}

// 摘要
interface Extract {
    node_id: string;
    title: string;
    content: string | null;
}
// 思维导图
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
interface MindMapData {
    mindmap_id: string | null;
    root_node: MindNode[] | null;
}
interface MindMap {
    node_id: string;
    mindMap: MindMapData | null;
}
// 关键词
interface Keyword {
    term: string;
    tfidf_score: number;
}
interface Keywords {
    note_id: string;
    keywords: Keyword[] | null;
}
// 讲解
interface Explanation {
    note_id: string;
    explanation: string;
}
interface UserNoteContextType {

}

const UserNoteContext = createContext<UserNoteContextType>({} as UserNoteContextType);

const UserNoteProvider: React.FC<{ children: React.ReactNode}> = ({ children}) => {
    // 获取当前笔记的摘要
    // 获取当前笔记的图片
    // 获取当前笔记的思维导图
    // 获取当前笔记的关键词
    // 获取当前笔记的智能讲解
    // 保存（更新）当前笔记所有信息
    return (
        <UserNoteContext.Provider value={{

        }}>
            {children}
        </UserNoteContext.Provider>
    )
}