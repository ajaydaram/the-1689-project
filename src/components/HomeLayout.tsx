import React, { useMemo } from 'react';
import fm from 'front-matter';

interface HomeLayoutProps {
  onChapterClick: (id: number) => void;
}

interface ChapterMetadata {
  id: number;
  title: string;
  slug: string;
  preview: string;
  content: string;
}

export function HomeLayout({ onChapterClick }: HomeLayoutProps) {
  const chapters = useMemo<ChapterMetadata[]>(() => {
    try {
      // Eagerly load all raw MDX contents
      const modules = import.meta.glob('../content/chapters/*.mdx', { eager: true, query: '?raw', import: 'default' });
      
      const parsedChapters = Object.values(modules).map((rawContent: any) => {
        const parsed = fm<any>(rawContent as string);
        return {
          id: parsed.attributes.chapterNumber || 0,
          title: parsed.attributes.title || 'Untitled Chapter',
          slug: parsed.attributes.slug || '',
          preview: parsed.attributes.description || parsed.body.substring(0, 150).replace(/[#*]/g, '').trim() + '...',
          content: parsed.body,
        };
      });
      
      // Sort in ascending order by chapter ID
      return parsedChapters.filter(c => c.id !== 0).sort((a, b) => a.id - b.id);
    } catch (error) {
      console.error("Error loading chapters:", error);
      return [];
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-surface-bg transition-colors p-6 lg:p-12 custom-scrollbar">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <span className="text-accent font-bold text-xs uppercase tracking-[0.3em]">
            The 1689 London
          </span>
          <h1 className="font-serif text-4xl lg:text-5xl mt-3 font-bold text-text-primary">
            Baptist Confession of Faith
          </h1>
          <div className="h-px w-24 bg-border-strong mx-auto mt-6"></div>
          <p className="mt-8 text-text-secondary font-serif max-w-2xl mx-auto leading-relaxed">
            A classic layout for reading and understanding the articles of faith.
          </p>
        </header>

        {chapters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary font-serif text-lg">No chapters available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <div 
                key={chapter.id} 
                onClick={() => onChapterClick(chapter.id)}
                className="bg-surface-content parchment-glow p-6 sm:p-8 rounded-sm relative group cursor-pointer transition-transform hover:-translate-y-1 block"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-accent opacity-10 group-hover:opacity-30 transition-opacity" />
                <span className="text-text-secondary font-bold font-sans text-xs uppercase tracking-widest block mb-2">
                  Chapter {String(chapter.id).padStart(2, '0')}
                </span>
                <h2 className="font-serif text-xl font-bold text-text-primary mb-3 leading-snug">
                  {chapter.title}
                </h2>
                <p className="text-sm font-serif text-text-secondary opacity-80 leading-relaxed mb-6 line-clamp-3">
                  {chapter.preview}
                </p>
                
                <div className="mt-auto border-t border-border-subtle pt-4 flex items-center justify-between text-accent font-sans font-bold text-[10px] uppercase tracking-widest">
                  <span>Read Chapter</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0 duration-300">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
