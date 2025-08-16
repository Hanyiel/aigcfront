// src/context/ImageContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 类型定义移除非必要属性
interface UploadedImage {
  id: string;
  url: string;         // 始终使用blob URL
  name: string;
  timestamp: number;
  status: 'uploaded';  // 简化状态（仅展示用）
  file: File;          // 保留原始文件引用
  hasExtract: boolean;
  hasMindMap: boolean;
  hasKeywords: boolean;
  hasExplanation: boolean;
  has_saved: boolean;
}

export interface ImageContextType {
  images: UploadedImage[];
  addImage: (file: File, imageId?: string) => void;
  removeImage: (imageId: string) => void;
  selectedImage: UploadedImage | null;
  setSelectedImage: (image: UploadedImage | null) => void;
  getImageFile: (imageId: string) => File | null;
  getExplanationId: (imageId: string) => string | null;
  setSaved: (imageId: string) => void;
}

const ImageContext = createContext<ImageContextType>({} as ImageContextType);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<UploadedImage[]>(() => {
    // 不再持久化blob URL（因为刷新后失效）
    return [];
  });

  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);

  // 自动清理blob URL
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, []);

  const addImage = useCallback(( file: File, imageId?: string) => {
    const tempUrl = URL.createObjectURL(file);
    let id = uuidv4();
    let has_saved = false;
    if(imageId){
      id = imageId
      has_saved = true

    }
    const newImage: UploadedImage = {
      id: id,
      url: tempUrl,
      name: file.name,
      timestamp: Date.now(),
      status: 'uploaded',
      file: file,  // 保留原始文件引用
      hasExtract: false,
      hasMindMap: false,
      hasKeywords: false,
      hasExplanation: false,
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
    return localStorage.getItem(`note_exp_${imageId}`);
  }, []);

  const setSaved = useCallback((imageId: string) => {
    setImages(prevImages =>
      prevImages.map(img =>
        img.id === imageId
          ? { ...img, has_saved: true }
          : img
      )
    );
  }, []);

  return (
      <ImageContext.Provider value={{
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile,
        getExplanationId,
        setSaved
      }}>
        {children}
      </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
