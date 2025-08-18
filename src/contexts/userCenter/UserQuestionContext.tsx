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

const API_URL = 'http://localhost:8000/api';

export interface Question {
  questionId: string;
  type: string;
  isWrong: boolean;
  hasExtract: boolean;
  hasKeywords: boolean;
  hasExplanation: boolean;
  hasAutoScoreReport: boolean;
  hasRelatedItems: boolean;
  imageName?: string;
  createTime: string;
  updateTime: string;
}

export interface QuestionDetail {
  questionId: string;
  title: string;
  content?: string;
  keywords?: QuestionKeywordData[];
  explanation?: string;
  AutoScoreReport?: GradingResult;
  relatedItems?: string;
}


interface UserQuestionContextType {
  prepareQuestionRegenarate: (question: Question, questionDetail: QuestionDetail, image: File) => void
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

  const prepareQuestionRegenarate = (question: Question, questionDetail: QuestionDetail, image: File) => {
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
      saveGradeResult(questionDetail.AutoScoreReport)
    }
    addImage(image, questionId)
  }
  return (
    <UserQuestionContext.Provider
      value={{
        prepareQuestionRegenarate
      }}
    >
      {children}
    </UserQuestionContext.Provider>
  );
};

export { UserQuestionContext, UserQuestionProvider };
