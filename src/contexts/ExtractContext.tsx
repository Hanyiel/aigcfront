// src/contexts/ExtractContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ExtractData {
  extract_id: string;
  note_id: string;
  text_content: string;
  expend?: string;
}

interface ExtractContextType {
  extracts: ExtractData[];
  saveExtract: (data: ExtractData) => void;
  updateExtract: (data: ExtractData) => void;
  deleteExtract: (extractId: string) => void;
  getExtractByImage: (imageId: string) => ExtractData | undefined;
}

const ExtractContext = createContext<ExtractContextType>(null!);

export const ExtractProvider = ({ children }: { children: React.ReactNode }) => {
  const [extracts, setExtracts] = useState<ExtractData[]>(() => {
    const saved = localStorage.getItem('extracts');
    return saved ? JSON.parse(saved) : [];
  });

  // 持久化到localStorage
  useEffect(() => {
    localStorage.setItem('extracts', JSON.stringify(extracts));
  }, [extracts]);

  const saveExtract = (data: ExtractData) => {
    setExtracts(prev => [
      ...prev.filter(e => e.note_id !== data.note_id),
      data
    ]);
    localStorage.setItem(`note_ext_${data.note_id}`, data.extract_id);
  };

  const updateExtract = (data: ExtractData) => {
    setExtracts(prev =>
      prev.map(e => e.note_id === data.note_id ? data : e)
    );
  };

  const deleteExtract = (extractId: string) => {
    setExtracts(prev => prev.filter(e => e.extract_id !== extractId));
  };

  const getExtractByImage = (imageId: string) => {
    const extId = localStorage.getItem(`note_ext_${imageId}`);
    return extId ? extracts.find(e => e.extract_id === extId) : undefined;
  };

  return (
    <ExtractContext.Provider
      value={{
        extracts,
        saveExtract,
        updateExtract,
        deleteExtract,
        getExtractByImage
      }}>
      {children}
    </ExtractContext.Provider>
  );
};

export const useExtract = () => {
  const context = useContext(ExtractContext);
  if (!context) {
    throw new Error('useExtract must be used within a ExtractProvider');
  }
  return context;
};
