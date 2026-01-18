
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Function to strip rogue HTML tags that might break the Markdown view
  const cleanContent = (text: string) => {
    if (!text) return "";
    return text
      // Aggressively remove HTML structure tags
      .replace(/<br\s*\/?>/gi, '\n') // Convert BR to newline
      .replace(/<table[^>]*>/gi, '') // Remove HTML table opening tags
      .replace(/<\/table>/gi, '')
      .replace(/<thead[^>]*>/gi, '')
      .replace(/<\/thead>/gi, '')
      .replace(/<tbody[^>]*>/gi, '')
      .replace(/<\/tbody>/gi, '')
      .replace(/<tr[^>]*>/gi, '')
      .replace(/<\/tr>/gi, '')
      .replace(/<td[^>]*>/gi, ' ') 
      .replace(/<\/td>/gi, ' ')
      .replace(/<th[^>]*>/gi, ' ')
      .replace(/<\/th>/gi, ' ')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n');
  };

  const safeContent = cleanContent(content);

  return (
    <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-900 leading-relaxed font-serif">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold text-center uppercase tracking-wide mb-6 pb-2 border-b-2 border-black" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold uppercase mt-6 mb-3 border-b border-black pb-1" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2" {...props} />,
          
          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-2 my-4" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 space-y-2 my-4" {...props} />,
          li: ({node, ...props}) => <li className="pl-1 mb-2 text-left leading-relaxed" {...props} />,
          
          p: ({node, ...props}) => <p className="mb-4 text-justify leading-relaxed" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-black" {...props} />,
          
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-slate-300 pl-4 py-1 my-4 italic bg-slate-50 text-slate-700" {...props} />
          ),
          
          table: ({node, ...props}) => (
            <div className="my-4 w-full">
                <table className="w-full border-collapse border border-black text-sm" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
          th: ({node, ...props}) => <th className="border border-black px-3 py-2 font-bold text-center bg-slate-100 align-middle" {...props} />,
          tbody: ({node, ...props}) => <tbody {...props} />,
          tr: ({node, ...props}) => <tr {...props} />,
          td: ({node, ...props}) => (
            <td className="border border-black px-3 py-2 align-top text-justify" {...props} />
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};
