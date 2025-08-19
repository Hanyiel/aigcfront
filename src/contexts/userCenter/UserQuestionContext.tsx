// src/contexts/UserQuestionContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { logout } from '../../services/auth';
import { useQuestionImageContext} from "../QuestionImageContext";
import { QuestionExtractData, useQuestionExtract} from "../QuestionExtractContext";
import { QuestionKeywordData, useQuestionKeywords} from "../QuestionKeywordsContext";
import { useQuestionExplanationContext} from "../QuestionExplanationContext";
import { GradingResult, useAutoGrade} from "../AutoGradeContext";
import {useImageContext} from "../ImageContext";
import { RelatedNote, RelatedData, useRelatedNote} from "../RelatedNoteContext";

const API_URL = 'http://localhost:8000/api';

export interface Question {
  questionId: string;
  type: string;
  subject: string; // 添加科目字段
  isWrong: boolean;
  hasExtract: boolean;
  hasKeywords: boolean;
  hasExplanation: boolean;
  hasAutoScoreReport: boolean;
  hasRelatedItems: boolean;
  imageName?: string;
  createTime: string;
  updateTime: string;
  content?: string; // 添加内容字段

}

export interface QuestionDetail {
  questionId: string;
  title: string;
  content?: string;
  keywords?: QuestionKeywordData[];
  explanation?: string;
  AutoScoreReport?: GradingResult;
  relatedItems?: RelatedData;
}


interface UserQuestionContextType {
  prepareQuestionRegenerate: (question: Question, questionDetail: QuestionDetail, image: File) => void
}

const UserQuestionContext = createContext<UserQuestionContextType>({} as UserQuestionContextType);

const UserQuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    saveQuestionExtract
  }=useQuestionExtract();
  const {
    saveQuestionKeywords
  }=useQuestionKeywords()
  const {
    addExplanation
  }=useQuestionExplanationContext()
  const {
    saveGradeResult
  }=useAutoGrade()
  const {
    addImage
  }=useImageContext()

  const prepareQuestionRegenerate = (question: Question, questionDetail: QuestionDetail, image: File) => {
    const questionId = `${question.questionId}--saved`
    if(questionDetail.content){
      const questionExtractData: QuestionExtractData = {
        extract_id: questionId,
        image_id: questionId,
        text_content: questionDetail.content,
      };
      saveQuestionExtract(questionExtractData);
    }
    if(questionDetail.keywords){
      saveQuestionKeywords(questionId, questionDetail.keywords);
    }
    if(questionDetail.explanation){
      addExplanation({
        explanationId: questionId,
        imageId: questionId,
        contentMd: questionDetail.explanation
      })
    }
    if(questionDetail.AutoScoreReport){
      saveGradeResult(questionDetail.AutoScoreReport);
    }
    addImage(image, questionId)
    console.log("将题目添加到工作台成功")
  }
  return (
      <UserQuestionContext.Provider
          value={{
            prepareQuestionRegenerate
          }}
      >
        {children}
      </UserQuestionContext.Provider>
  );
};

export { UserQuestionContext, UserQuestionProvider };
