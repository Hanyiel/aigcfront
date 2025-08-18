// src/context/QuestionImageContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface QuestionImage {
  id: string;
  url: string;         // 始终使用blob URL
  name: string;
  timestamp: number;
  status: 'uploaded';  // 简化状态（仅展示用）
  file: File;          // 保留原始文件引用
  has_saved: boolean;
}

interface QuestionImageContextType {
  images: QuestionImage[];
  addImage: (file: File) => void;  // 改为同步操作
  removeImage: (imageId: string) => void;
  selectedImage: QuestionImage | null;
  setSelectedImage: (image: QuestionImage | null) => void;
  getImageFile: (imageId: string) => File | null;  // 新增文件获取方法
  getExplanationId: (imageId: string) => string | null;
}

const QuestionImageContext = createContext<QuestionImageContextType>({} as QuestionImageContextType);

export const QuestionImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<QuestionImage[]>(() => {
    return [];
  });

  const [selectedImage, setSelectedImage] = useState<QuestionImage | null>(null);

  // 自动清理blob URL
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, []);


  const addImage = useCallback((file: File, imageId?: string) => {
    const tempUrl = URL.createObjectURL(file);
    let id = uuidv4();
    let has_saved = false;
    if(imageId){
      id = imageId;
      has_saved = true;
    }
    const newImage: QuestionImage = {
      id: id,
      url: tempUrl,
      name: file.name,
      timestamp: Date.now(),
      status: 'uploaded',
      file: file,  // 保留原始文件引用
      has_saved: has_saved
    };

    setImages(prev => [...prev, newImage]);
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => {
      const removed = prev.filter(img => img.id !== imageId);
      const target = prev.find(img => img.id === imageId);
      if (target) {
        URL.revokeObjectURL(target.url);  // 立即释放资源
      }
      return removed;
    });
  }, []);

  const getImageFile = useCallback((imageId: string) => {
    const target = images.find(img => img.id === imageId);
    return target?.file || null;
  }, [images]);

  const getExplanationId = useCallback((imageId: string) => {
    return localStorage.getItem(`question_exp_${imageId}`);
  }, []);

  return (
      <QuestionImageContext.Provider value={{
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile,
        getExplanationId
      }}>
        {children}
      </QuestionImageContext.Provider>
  );
};
export const useQuestionImageContext = () => useContext(QuestionImageContext);
