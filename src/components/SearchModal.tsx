import React, { useState, useEffect, useMemo, useRef } from 'react';
import fm from 'front-matter';
import { Search, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (chapterId: number) => void;
}

interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
}

export function SearchModal({ isOpen, onClose, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const chapters = useMemo(() => {
    try {
      const modules = import.meta.glob('../content/chapters/*.mdx', { eager: true, query: '?raw', import: 'default' });
      return Object.values(modules).map((rawContent: any) => {
        const parsed = fm<any>(rawContent as string);
        return {
          id: parsed.attributes.chapterNumber || 0,
          title: parsed.attributes.title || 'Untitled Chapter',
          content: parsed.body,
        };
      });
    } catch (e) {
      return [];
    }
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return chapters
      .map(chapter => {
        const titleMatch = chapter.title.toLowerCase().includes(lowerQuery);
        const contentMatchIndex = chapter.content.toLowerCase().indexOf(lowerQuery);
        
        let excerpt = '';
        if (contentMatchIndex !== -1) {
          const start = Math.max(0, contentMatchIndex - 40);
          const end = Math.min(chapter.content.length, contentMatchIndex + lowerQuery.length + 40);
          excerpt = '...' + chapter.content.substring(start, end).replace(/[#*]/g, '') + '...';
        } else if (titleMatch) {
          excerpt = 'Matches chapter title...';
        }
        
        if (titleMatch || contentMatchIndex !== -1) {
          return { id: chapter.id, title: chapter.title, excerpt };
        }
        return null;
      })
      .filter((r): r is SearchResult => r !== null)
      // Limit to top 5 results for performance
      .slice(0, 5);
  }, [query, chapters]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 px-4 backdrop-blur-sm bg-stone-900/40">
      {/* Click-away overlay */}
      <div className="fixed inset-0" onClick={onClose}></div>
      
      <div className="relative bg-surface-content w-full max-w-xl rounded-lg shadow-2xl overflow-hidden border border-border-subtle transform transition-all">
        <div className="flex items-center px-4 py-4 border-b border-border-subtle">
          <Search className="w-5 h-5 text-text-secondary mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none font-serif text-lg text-text-primary placeholder:text-text-secondary"
            placeholder="Search the Confession..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 hover:bg-surface-sidebar rounded">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        
        {results.length > 0 && (
          <ul className="max-h-96 overflow-y-auto custom-scrollbar p-2">
            {results.map((res) => (
              <li key={res.id}>
                <button
                  onClick={() => {
                    onSelect(res.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 hover:bg-surface-sidebar rounded-md transition-colors"
                >
                  <h4 className="font-sans font-bold text-text-primary text-sm">Chapter {res.id}: {res.title}</h4>
                  <p className="font-serif text-sm text-text-secondary mt-1 truncate">{res.excerpt}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
        
        {query && results.length === 0 && (
          <div className="p-8 text-center text-text-secondary font-serif">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
