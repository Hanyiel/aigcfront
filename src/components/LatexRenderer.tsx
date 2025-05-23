import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  block?: boolean;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ content, block = false }) => {
  // 如果内容为空或没有LaTeX标记，直接返回原文本
  if (!content || !content.includes('$')) return <>{content}</>;
  
  // 处理文本中的内联LaTeX公式 $...$
  const renderInlineLatex = (text: string) => {
    const parts = text.split(/(\$[^$]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1);
        try {
          return <InlineMath key={index} math={formula} />;
        } catch (e) {
          console.error('LaTeX渲染错误:', e);
          return <span key={index} style={{ color: 'red' }}>[LaTeX错误: {part}]</span>;
        }
      }
      return <span key={index}>{part}</span>;
    });
  };
  
  // 处理块级LaTeX公式 $$...$$
  const renderBlockLatex = (text: string) => {
    const parts = text.split(/(\$\$[^$]+\$\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2);
        try {
          return <BlockMath key={index} math={formula} />;
        } catch (e) {
          console.error('LaTeX渲染错误:', e);
          return <div key={index} style={{ color: 'red' }}>[LaTeX错误: {part}]</div>;
        }
      }
      return <span key={index}>{renderInlineLatex(part)}</span>;
    });
  };
  
  return <div className="latex-content">{block ? renderBlockLatex(content) : renderInlineLatex(content)}</div>;
};

export default LatexRenderer;
