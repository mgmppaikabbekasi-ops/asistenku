
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Function to clean content but PRESERVE <br> tags for table formatting
  const cleanContent = (text: string) => {
    if (!text) return "";
    return text
      // Remove generic HTML container/structure tags that might break layout, but keep <br>
      .replace(/<table[^>]*>/gi, '') 
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
      .replace(/<\/p>/gi, '\n')
      // Clean up standalone <br> tags that are not part of content lines
      .replace(/^\s*<br\s*\/?>\s*/gim, '') // Remove start of line breaks
      .replace(/\s*<br\s*\/?>\s*$/gim, '') // Remove end of line breaks
      .replace(/\n\s*<br\s*\/?>\s*\n/gim, '\n\n') // Replace spaced breaks with normal newlines
      // Fix specific table issues where br might appear in markdown tables randomly or create empty spacing
      .replace(/\|\s*<br\s*\/?>\s*\|/gim, '| |') // Empty cells with br
      .replace(/(?:\r\n|\r|\n)\s*<br\s*\/?>\s*(?:\r\n|\r|\n)/gim, '\n\n'); 
  };

  const safeContent = cleanContent(content);

  // Custom renderer to parse [br] token OR <br> tag inside text nodes
  const renderTextWithBreaks = (children: React.ReactNode) => {
    return React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        // Split string by [br] token OR <br> tags (case insensitive)
        const parts = child.split(/\[br\]|<br\s*\/?>|&lt;br&gt;/gi);
        return parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && <br />}
          </React.Fragment>
        ));
      }
      return child;
    });
  };

  return (
    <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-900 leading-relaxed font-serif">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold text-center uppercase tracking-wide mb-6 pb-2 border-b-2 border-black" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold uppercase mt-6 mb-3 border-b border-black pb-1" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-bold mt-8 mb-4 uppercase tracking-wide border-b border-slate-400 pb-1" {...props} />,
          
          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-1 my-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-1 my-1" {...props} />,
          li: ({node, ...props}) => <li className="pl-1 mb-0.5 text-left leading-relaxed" {...props} />,
          
          p: ({node, ...props}) => <p className="mb-2 text-justify leading-relaxed" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-black" {...props} />,
          
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-slate-400 pl-4 py-2 my-4 italic bg-slate-50 text-slate-800" {...props} />
          ),
          
          // Table styling corrections for PROFESSIONAL LOOK
          table: ({node, ...props}) => (
            <div className="my-6 w-full overflow-x-auto">
                <table className="w-full border-collapse border border-black text-sm shadow-none" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
          th: ({node, style, ...props}) => (
            <th 
                className="border border-black px-4 py-3 font-bold bg-slate-100 text-slate-900 uppercase text-xs tracking-wider align-middle text-center" 
                style={style} 
                {...props} 
            />
          ),
          tbody: ({node, ...props}) => <tbody {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-slate-50 transition-colors" {...props} />,
          td: ({node, style, children, ...props}) => (
            <td 
                className="border border-black px-4 py-3 align-top text-slate-900 whitespace-normal leading-relaxed break-words text-left" 
                style={style} // ReactMarkdown passes alignment styles here (textAlign)
                {...props} 
            >
                {renderTextWithBreaks(children)}
            </td>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};
