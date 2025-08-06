import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ExplanationData {
  explanation_id: string;
  image_id: string;
  content_md: string;
}

interface ExplanationContextType {
  explanations: ExplanationData[];
  saveExplanation: (data: ExplanationData) => void;
  deleteExplanation: (explanationId: string) => void;
  getExplanation: (explanationId: string) => ExplanationData | undefined;
  getExplanationByImage: (imageId: string) => ExplanationData | undefined;
  updateExplanation: (data: ExplanationData) => void;
}

const ExplanationContext = createContext<ExplanationContextType>(null!);

export const ExplanationProvider = ({ children }: { children: React.ReactNode }) => {
  const [explanations, setExplanations] = useState<ExplanationData[]>(() => {
    const saved = localStorage.getItem('explanations');
    return saved ? JSON.parse(saved) : [];
  });

  // 持久化到localStorage
  useEffect(() => {
    localStorage.setItem('explanations', JSON.stringify(explanations));
  }, [explanations]);

  const saveExplanation = (data: ExplanationData) => {
    setExplanations(prev => [
      ...prev.filter(e => e.explanation_id !== data.explanation_id),
      data
    ]);
    localStorage.setItem(`img_exp_${data.image_id}`, data.explanation_id);
  };

  const updateExplanation = (data: ExplanationData) => {
    setExplanations(prev =>
      prev.map(e => e.explanation_id === data.explanation_id ? data : e)
    );
  };

  const deleteExplanation = (explanationId: string) => {
    setExplanations(prev => prev.filter(e => e.explanation_id !== explanationId));
  };

  const getExplanation = (explanationId: string) => {
    console.log(explanations);
    console.log(explanationId);
    return explanations.find(e => e.explanation_id === explanationId);
  };

  const getExplanationByImage = (imageId: string) => {
    const expId = localStorage.getItem(`img_exp_${imageId}`);
    return expId ? explanations.find(e => e.explanation_id === expId) : undefined;
  };

  return (
      <ExplanationContext.Provider
          value={{
            explanations,
            saveExplanation,
            deleteExplanation,
            getExplanation,
            getExplanationByImage,
            updateExplanation
          }}>
        {children}
      </ExplanationContext.Provider>
  );
};

export const useExplanation = () => {
  const context = useContext(ExplanationContext);
  if (!context) {
    throw new Error('useExplanation must be used within a ExplanationProvider');
  }
  return context;
};
