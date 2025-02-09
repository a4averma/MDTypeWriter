import React, { useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  const processMermaidDiagrams = useCallback((code: string, diagramId: string) => {
    const containerElement = document.getElementById(diagramId);
    if (!containerElement) return;

    try {
      // Clear or reset container
      containerElement.innerHTML = '';

      // Use mermaid.render with async/await for better error handling
      mermaid.parse(code);
      mermaid
        .render(`diagram-${diagramId}`, code)
        .then(({ svg, bindFunctions }) => {
          containerElement.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(containerElement);
          }
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          containerElement.innerHTML = '<div class="text-red-500">Diagram error</div>';
        });
    } catch (error) {
      console.error('Mermaid parsing error:', error);
      containerElement.innerHTML = '<div class="text-red-500">Invalid diagram syntax</div>';
    }
  }, []);

  const CodeBlock = useCallback(({ 
    inline, 
    className, 
    children
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');

    if (language === 'mermaid') {
      const diagramId = `mermaid-${Math.random().toString(36).slice(2, 9)}`;

      useEffect(() => {
        const timer = setTimeout(() => {
          processMermaidDiagrams(code, diagramId);
        }, 50);

        return () => clearTimeout(timer);
      }, [code, diagramId, processMermaidDiagrams]);

      return <div id={diagramId} className="my-4 flex justify-center bg-muted/20 p-4 rounded-lg" />;
    }

    if (inline) {
      return <code className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm">{children}</code>;
    }

    return (
      <div className="my-4">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            padding: '1rem',
          }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }, [processMermaidDiagrams]);

  return (
    <div className="px-6 py-4">
      <article className="max-w-none text-base leading-7">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            code: CodeBlock,
            h1: ({ children }) => <h1 className="text-4xl font-bold mt-8 mb-4 text-foreground">{children}</h1>,
            h2: ({ children }) => <h2 className="text-3xl font-bold mt-6 mb-3 text-foreground">{children}</h2>,
            h3: ({ children }) => <h3 className="text-2xl font-bold mt-5 mb-2 text-foreground">{children}</h3>,
            h4: ({ children }) => <h4 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h4>,
            p: ({ children }) => <p className="my-4 text-base text-foreground/90 inline">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside my-4 pl-4 text-foreground/90">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside my-4 pl-4 text-foreground/90">{children}</ol>,
            li: ({ children }) => <li className="my-1">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-foreground/80 bg-muted/30 py-2 rounded-r">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-primary hover:text-primary/80 underline underline-offset-4">
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <img 
                src={src} 
                alt={alt} 
                className="max-w-full h-auto my-4 rounded-lg border border-border/50 shadow-sm" 
              />
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4 rounded-lg border border-border">
                <table className="min-w-full border-collapse">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border-b border-r last:border-r-0 border-border px-4 py-2 bg-muted font-medium text-foreground">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-r last:border-r-0 border-border px-4 py-2 text-foreground/90">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
};

export default MarkdownViewer; 