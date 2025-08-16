import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {} from "../ImageContext";
import {ExtractData, useExtract} from "../ExtractContext";
import {KeywordData, useKeywords} from "../NoteKeywordsContext";
import {MindMapData, useMindMapContext} from "../MindMapContext";
import {ExplanationData, useExplanation} from "../ExplanationContext";
import {useImageContext} from "../ImageContext";

export interface Note {
    noteId: string;
    subject: string;
    title: string;
    createTime: string;
    updateTime: string;
    hasExtract: boolean;
    hasMindMap: boolean;
    hasKeywords: boolean;
    hasExplanation: boolean;
    imageName?: string;
}

export interface NoteDetail {
    noteId: string;
    title: string;
    createTime: string;
    updateTime: string;
    content?: string;
    mindMap?: MindMapData;
    keywords?: KeywordData[];
    explanation?: string;
}
interface UserNoteContextType {
    prepareReloadNote: (note: Note, noteDetail: NoteDetail, image: File) => void;
}

const UserNoteContext = createContext<UserNoteContextType>({} as UserNoteContextType);

export const UserNoteProvider: React.FC<{ children: React.ReactNode}> = ({ children}) => {
    const {
        saveExtract
    }=useExtract();
    const {
        saveKeywords
    }=useKeywords();
    const {
        saveMindMap
    }=useMindMapContext()
    const {
        saveExplanation
    }=useExplanation();
    const {
        addImage
    }=useImageContext()
    const prepareReloadNote = (note: Note, noteDetail: NoteDetail, image: File) => {
        const noteId = `${note.noteId}--saved`
        if(noteDetail.content){
            const extract: ExtractData = {
                extract_id: `note_extra_${note.noteId}`,
                note_id: noteId,
                text_content: noteDetail.content,
            }
            saveExtract(extract)
        }
        if(noteDetail.keywords){
            const keywords: KeywordData[] = noteDetail.keywords
            saveKeywords(noteId, keywords)
        }
        if(noteDetail.mindMap){
            const mindMapData: MindMapData = noteDetail.mindMap
            saveMindMap(noteId, mindMapData)
        }
        if(noteDetail.explanation){
            const explanation: ExplanationData = {
                explanation_id: `note_exp_${note.noteId}`,
                note_id: noteId,
                content_md: noteDetail.explanation,
            }
            saveExplanation(explanation)
        }
        addImage(image, noteId)
    }

    return (
        <UserNoteContext.Provider value={{
            prepareReloadNote
        }}>
            {children}
        </UserNoteContext.Provider>
    )
}

export const useUserNoteContext = () => useContext(UserNoteContext);
