import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getPassageText } from '../lib/bibleData';

interface BibleHoverProps {
  verse: string;
  children: React.ReactNode;
}

export function BibleHover({ verse, children }: BibleHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    if (isHovered && !text && !loading && !error) {
      setLoading(true);
      
      getPassageText(verse).then(passage => {
        if (isMounted) {
          setText(passage || "Passage not found.");
          setLoading(false);
        }
      }).catch(err => {
        console.error('Bible parse error:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [isHovered, verse, text, loading, error]);

  return (
    <span 
      className="relative inline cursor-help text-accent font-semibold transition-colors hover:bg-accent hover:text-white rounded-sm z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Toggle on mobile via click
        e.preventDefault();
        e.stopPropagation();
        setIsHovered(!isHovered);
      }}
    >
      {children}
      {isHovered && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[calc(100vw-2rem)] max-w-sm p-4 rounded-md shadow-2xl bg-surface-sidebar border border-border-strong text-sm text-text-primary z-[999] opacity-100 transition-opacity font-serif text-left flex flex-col pointer-events-none max-h-64 overflow-y-auto custom-scrollbar md:w-80"
          style={{ boxShadow: 'var(--theme-glow-outer)' }}
        >
          <strong className="block text-[10px] uppercase tracking-widest text-accent mb-2 font-sans border-b border-border-subtle pb-2">
            {verse}
          </strong>
          {loading ? (
             <span className="flex items-center gap-2 text-text-secondary py-2"><Loader2 className="w-4 h-4 animate-spin text-accent" /> Loading scripture...</span>
          ) : error ? (
             <span className="text-red-500 py-2 border-l-2 border-red-500 pl-3">Failed to load passage. Ensure the reference is correct.</span>
          ) : (
             <span className="italic leading-relaxed whitespace-pre-wrap">{text}</span>
          )}
        </span>
      )}
    </span>
  );
}
