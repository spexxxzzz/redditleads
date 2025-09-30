import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Process content to handle image URLs and formatting issues
  const cleanContent = content
    // Convert standalone image URLs to markdown image syntax
    .replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|mp4|webm)(\?[^\s]*)?)/gi, '![]($1)')
    // Handle Reddit-specific image URLs (i.redd.it, preview.redd.it, etc.)
    .replace(/(https?:\/\/(?:i\.redd\.it|preview\.redd\.it|external-preview\.redd\.it|thumbs\.redditmedia\.com|v\.redd\.it)\/[^\s]+)/gi, '![]($1)')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => {
            return <p className="text-gray-300 leading-relaxed mb-2">{children}</p>;
          },
          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
          em: ({ children }) => <em className="text-orange-400 italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-4">{children}</ol>,
          li: ({ children }) => <li className="text-gray-300">{children}</li>,
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-white mb-2 mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold text-white mb-2 mt-2">{children}</h3>,
          code: ({ children }) => <code className="bg-zinc-800 text-orange-300 px-1 py-0.5 rounded text-sm">{children}</code>,
          pre: ({ children }) => <pre className="bg-zinc-800 text-gray-300 p-3 rounded overflow-x-auto">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-400 my-2">{children}</blockquote>,
          a: ({ children, href }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-orange-400 hover:text-orange-300 underline"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            // Check if it's a valid image/video URL
            const srcString = typeof src === 'string' ? src : '';
            const isValidMediaUrl = srcString && (
              srcString.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm)(\?.*)?$/i) ||
              srcString.includes('i.redd.it') ||
              srcString.includes('preview.redd.it') ||
              srcString.includes('external-preview.redd.it') ||
              srcString.includes('thumbs.redditmedia.com') ||
              srcString.includes('v.redd.it')
            );

            if (!isValidMediaUrl) {
              return null; // Don't render invalid media URLs
            }

            // Check if it's a video
            const isVideo = srcString.match(/\.(mp4|webm)(\?.*)?$/i) || srcString.includes('v.redd.it');
            
            // Return a span instead of div to avoid nesting issues
            return (
              <span className="block my-4 flex justify-center">
                {isVideo ? (
                  <video 
                    src={srcString} 
                    controls
                    className="max-w-full max-h-96 h-auto rounded-lg border border-zinc-700 shadow-lg object-contain"
                    onError={(e) => {
                      // Hide video if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={srcString} 
                    alt={alt || 'Reddit post image'} 
                    className="max-w-full max-h-96 h-auto rounded-lg border border-zinc-700 shadow-lg object-contain"
                    loading="lazy"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      // Ensure image is visible when loaded
                      e.currentTarget.style.display = 'block';
                    }}
                  />
                )}
              </span>
            );
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};
