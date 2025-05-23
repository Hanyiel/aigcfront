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
}

export interface ImageContextType {
  images: UploadedImage[];
  addImage: (file: File) => void;  // 改为同步操作
  removeImage: (imageId: string) => void;
  selectedImage: UploadedImage | null;
  setSelectedImage: (image: UploadedImage | null) => void;
  getImageFile: (imageId: string) => File | null;  // 新增文件获取方法
  getExplanationId: (imageId: string) => string | null;
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

  const addImage = useCallback((file: File) => {
    const tempUrl = URL.createObjectURL(file);
    const newImage: UploadedImage = {
      id: uuidv4(),
      url: tempUrl,
      name: file.name,
      timestamp: Date.now(),
      status: 'uploaded',
      file: file  // 保留原始文件引用
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
    return localStorage.getItem(`img_exp_${imageId}`);
  }, []);

  return (
      <ImageContext.Provider value={{
        images,
        addImage,
        removeImage,
        selectedImage,
        setSelectedImage,
        getImageFile,
        getExplanationId
      }}>
        {children}
      </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
