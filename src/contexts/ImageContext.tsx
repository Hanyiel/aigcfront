// src/context/ImageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  timestamp: number;
}

interface ImageContextType {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  selectedImage: UploadedImage | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<UploadedImage | null>>;
}

const ImageContext = createContext<ImageContextType>({} as ImageContextType);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<UploadedImage[]>(() => {
    const saved = localStorage.getItem('uploadedImages');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);

  useEffect(() => {
    localStorage.setItem('uploadedImages', JSON.stringify(images));
  }, [images]);

  return (
    <ImageContext.Provider value={{ images, setImages, selectedImage, setSelectedImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
