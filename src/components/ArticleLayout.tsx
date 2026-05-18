import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import frontmatter from 'front-matter';
import GithubSlugger from 'github-slugger';
import { BookOpen, Menu, X, List, Hash, AlignLeft, MessageSquare } from 'lucide-react';
import remarkBibleVerses from '../lib/remark-bible.ts';
import { BibleHover } from './BibleHover.tsx';
import { chapters } from '../data/chapters.ts';
import lbcfData from '../data/1689.json';

// A styled component for the Confession Text
const ConfessionBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-surface-sidebar border border-border-subtle p-6 lg:p-8 rounded my-8 relative font-serif" style={{ boxShadow: 'var(--theme-glow-inner)' }}>
    <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20" />
    <strong className="block text-accent font-sans text-xs uppercase tracking-[0.2em] mb-4">
      1689 Confession Text
    </strong>
    {children}
  </div>
);

interface ArticleLayoutProps {
  chapterId: number;
  onChapterClick: (id: number) => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function ArticleLayout({ chapterId, onChapterClick }: ArticleLayoutProps) {
  const [content, setContent] = useState<string>('');
  const [attributes, setAttributes] = useState<any>({});
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<'chapters' | 'toc'>('chapters');
  const [contentTab, setContentTab] = useState<'commentary' | 'original'>('original');
  const scrollRef = useRef<HTMLDivElement>(null);

  const originalChapter = (lbcfData as any).chapters[chapterId.toString()];

  // No longer using RefTagger, removed to let remark-bible handle verses

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        let fileContent = '';
        
        // Auto-load any MDX file in the folder using Vite's glob import
        const modules = import.meta.glob('../content/chapters/*.mdx', { query: '?raw', import: 'default' });
        
        // Find the file that matches the chapter ID (e.g., 01-holy-scriptures.mdx matches ID 1)
        const targetModuleKey = Object.keys(modules).find((key) => {
          const filename = key.split('/').pop() || '';
          const match = filename.match(/^(\d+)-/);
          return match && parseInt(match[1], 10) === chapterId;
        });

        if (targetModuleKey) {
          fileContent = await modules[targetModuleKey]() as string;
        } else {
          fileContent = '# Coming Soon\nThis chapter is not available yet.';
        }
        
        const parsed = frontmatter<any>(fileContent);
        
        // Remove the first level 1 heading from the markdown body
        // since we already render it in the ArticleLayout header.
        const cleanedBody = parsed.body.replace(/^\s*#\s+[^\n]+[\r\n]*/, '');
        
        // Parse headings for TOC
        const slugger = new GithubSlugger();
        // Match ## and ### headings
        const headingRegex = /^(#{2,3})\s+(.+)$/gm;
        let match;
        const extractedHeadings: TocItem[] = [];
        while ((match = headingRegex.exec(cleanedBody)) !== null) {
          const rawText = match[2].trim();
          // rehype-slug converts footnote [^1] to "1" in the text it slugs
          const textForSlug = rawText.replace(/\[\^([\d]+)\]/g, '$1');
          const slug = slugger.slug(textForSlug);
          
          // Display text without the footnote marker
          const displayText = rawText.replace(/\[\^[\d]+\]/g, '');
          
          extractedHeadings.push({
            id: slug,
            text: displayText,
            level: match[1].length,
          });
        }

        setAttributes(parsed.attributes);
        setContent(cleanedBody);
        setHeadings(extractedHeadings);
      } catch (error) {
        console.error('Failed to load chapter content', error);
        setContent('# Error\nCould not load this chapter.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [chapterId]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border-subtle flex justify-between items-center transition-colors">
        <div className="flex gap-4 w-full">
          <button 
            onClick={() => setSidebarTab('chapters')}
            className={`flex-1 flex items-center justify-center gap-2 pb-2 border-b-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
              sidebarTab === 'chapters' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Chapters
          </button>
          <button 
            onClick={() => setSidebarTab('toc')}
            className={`flex-1 flex items-center justify-center gap-2 pb-2 border-b-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
              sidebarTab === 'toc' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            Contents
          </button>
        </div>
        {isMobileTocOpen && (
          <button className="lg:hidden ml-4 pl-4 border-l border-border-subtle" onClick={() => setIsMobileTocOpen(false)}>
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {sidebarTab === 'chapters' && (
          <ul className="space-y-3">
            {chapters.map((ch) => (
              <li key={ch.id}>
                <button
                  onClick={() => {
                    onChapterClick(ch.id);
                    setIsMobileTocOpen(false);
                  }}
                  className={`text-left w-full text-sm font-sans transition-colors leading-snug flex items-start gap-3 p-2 rounded-sm ${
                    chapterId === ch.id 
                      ? 'bg-accent/10 text-accent font-semibold' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-content'
                  }`}
                >
                  <span className={`shrink-0 font-mono text-xs mt-0.5 ${chapterId === ch.id ? 'text-accent' : 'text-text-secondary opacity-50'}`}>
                    {ch.id.toString().padStart(2, '0')}
                  </span>
                  <span className="line-clamp-2">
                    {ch.title.split(': ')[0]} 
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        
        {sidebarTab === 'toc' && (
          headings.length > 0 ? (
            <ul className="space-y-4">
              {headings.map((heading, i) => (
                <li 
                  key={i} 
                  className={`${heading.level === 3 ? 'ml-4' : ''}`}
                >
                  <a 
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setIsMobileTocOpen(false);
                    }}
                    className={`text-sm font-sans transition-colors leading-snug block ${
                      heading.level === 2 
                        ? 'text-text-primary font-semibold hover:text-accent' 
                        : 'text-text-secondary hover:text-accent'
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-sm font-medium italic text-center mt-8">
              No table of contents available for this chapter.
            </p>
          )
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex-1 bg-surface-bg transition-colors flex items-center justify-center">
        <div className="text-text-secondary font-serif rotate-12 text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop TOC Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-border-subtle bg-surface-sidebar transition-colors flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile TOC Drawer */}
      {isMobileTocOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileTocOpen(false)} />
          <aside className="relative flex flex-col w-4/5 max-w-sm h-full bg-surface-sidebar shadow-2xl transition-colors">
            <SidebarContent />
          </aside>
        </div>
      )}

      <section 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 bg-surface-bg p-6 lg:p-12 overflow-y-auto custom-scrollbar scroll-smooth w-full relative transition-colors"
      >
        {/* Mobile floating TOC button */}
        <button 
          onClick={() => setIsMobileTocOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden z-40 bg-accent text-white p-3 rounded-full shadow-lg hover:bg-accent-hover transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Reading Progress Bar fixed to top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-border-strong z-50 transition-colors">
          <div 
            className="h-full bg-accent transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <div className="max-w-2xl mx-auto pt-4">
          <header className="mb-10 text-center">
            <span className="text-accent font-bold text-xs uppercase tracking-[0.3em]">
              Chapter {attributes.chapterNumber || chapterId}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl mt-3 font-bold text-text-primary leading-tight transition-colors">
              {originalChapter ? originalChapter.title : (attributes.title || `Chapter ${chapterId}`)}
            </h1>
            <div className="h-px w-24 bg-border-strong mx-auto mt-6 transition-colors"></div>
          </header>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setContentTab('original')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                contentTab === 'original' 
                  ? 'bg-accent text-white shadow-md' 
                  : 'bg-surface-sidebar text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              1689 Confession
            </button>
            <button
              onClick={() => setContentTab('commentary')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                contentTab === 'commentary' 
                  ? 'bg-accent text-white shadow-md' 
                  : 'bg-surface-sidebar text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              Commentary
            </button>
          </div>

          <main className="parchment-glow bg-surface-content p-8 sm:p-12 rounded-sm relative shadow-sm transition-colors min-h-[50vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent opacity-10 transition-colors" />
            
            {contentTab === 'original' && originalChapter ? (
              <article className="prose prose-stone lg:prose-lg max-w-none relative z-10 font-serif leading-loose text-text-primary">
                {Object.entries<string>(originalChapter.paragraphs).map(([paraNum, paraText]) => (
                  <div key={paraNum} className="mb-8 p-6 bg-surface-sidebar border border-border-subtle rounded relative">
                    <span className="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-accent text-white font-sans font-bold rounded-full text-sm shadow-sm ring-4 ring-surface-content">
                      {paraNum}
                    </span>
                    <p className="mt-2 whitespace-pre-line text-lg" style={{textIndent: '1.5rem'}}>
                      {paraText}
                    </p>
                  </div>
                ))}
              </article>
            ) : (
              <article className="prose prose-stone lg:prose-lg max-w-none relative z-10 prose-headings:font-sans prose-headings:font-bold prose-p:font-serif leading-relaxed prose-li:font-serif">
                <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBibleVerses]}
                rehypePlugins={[rehypeRaw, rehypeSlug]} // allows HTML inside Markdown and adds IDs to headings
                components={{
                  span: ({ node, className, children, ...props }) => {
                    if (className === 'bible-verse-hover') {
                      return <BibleHover verse={(props as any)['data-verse']}>{children}</BibleHover>;
                    }
                    return <span className={className} {...props as any}>{children}</span>;
                  },
                  // @ts-ignore - custom component mapping for MDX
                  confessionbox: ({ node, ...props }) => <ConfessionBox {...props as any} />,
                  p: ({ node, children, ...props }) => {
                    // Prevent `<p>` from wrapping `<confessionbox>` which results in `<div>` inside `<p>`.
                    const hasConfessionBox = React.Children.toArray(children).some(
                      (child: any) => 
                        child?.props?.node?.tagName === 'confessionbox' || 
                        child?.type === ConfessionBox ||
                        (child?.type === 'confessionbox')
                    );
                    
                    if (hasConfessionBox) {
                      return <div className="mb-6">{children}</div>;
                    }
                    
                    return <p {...props as any}>{children}</p>;
                  },
                  div: ({ node, className, children, ...props }) => {
                    const isFootnotes = props['data-footnotes'] || className === 'footnotes' || (className && typeof className === 'string' && className.includes('footnotes'));
                    if (isFootnotes) {
                      return (
                        <section id="footnotes" className="mt-16 pt-8 border-t border-border-strong transition-colors" data-footnotes>
                          <h2 className="font-sans text-[10px] uppercase font-bold text-accent tracking-[0.2em] mb-6">
                            Editorial Footnotes
                          </h2>
                          <div className="font-serif text-sm text-text-secondary footnotes-list transition-colors">
                            {React.Children.map(children, (child) => {
                              if (React.isValidElement(child) && child.type === 'h2' && (child.props as any).className === 'sr-only') {
                                return null;
                              }
                              return child;
                            })}
                          </div>
                        </section>
                      );
                    }
                    return <div className={className} {...props as any}>{children}</div>;
                  },
                  section: ({ node, className, children, ...props }) => {
                    const isFootnotes = props['data-footnotes'] || className === 'footnotes';
                    if (isFootnotes) {
                      return (
                        <section id="footnotes" className="mt-16 pt-8 border-t border-border-strong transition-colors" data-footnotes>
                          <h2 className="font-sans text-[10px] uppercase font-bold text-accent tracking-[0.2em] mb-6">
                            Editorial Footnotes
                          </h2>
                          <div className="font-serif text-sm text-text-secondary footnotes-list transition-colors">
                            {React.Children.map(children, (child) => {
                              if (React.isValidElement(child) && child.type === 'h2' && (child.props as any).className === 'sr-only') {
                                return null;
                              }
                              return child;
                            })}
                          </div>
                        </section>
                      );
                    }
                    return <section className={className} {...props as any}>{children}</section>;
                  },
                  a: ({ node, className, children, href, ...props }) => {
                    if (className === 'data-footnote-backref') {
                      return (
                        <a 
                          href={href}
                          className="text-accent no-underline opacity-60 hover:opacity-100 transition-opacity ml-2 font-sans text-[10px] tracking-wider uppercase inline-flex items-center gap-1"
                          {...props}
                        >
                          ↑ Back to text
                        </a>
                      );
                    }
                    if (href?.startsWith('#user-content-fn-')) {
                      return (
                        <a 
                          href={href}
                          className="text-accent no-underline font-sans font-bold px-0.5 text-xs align-super hover:underline"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    }
                    return <a href={href} className={className} {...props as any}>{children}</a>;
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
            )}

            <footer className="mt-12 flex justify-between items-center pt-8 border-t border-border-strong transition-colors">
              <div className="text-[10px] uppercase font-bold text-accent flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div> 
                Built-in Scripture Reader
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => onChapterClick(chapterId - 1)}
                  disabled={chapterId <= 1}
                  className="px-4 py-2 bg-surface-sidebar text-xs font-bold uppercase rounded hover:bg-border-subtle transition-colors text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button 
                  onClick={() => onChapterClick(chapterId + 1)}
                  disabled={chapterId >= 32} // Max 32 chapters in the 1689
                  className="px-4 py-2 bg-accent text-white text-xs font-bold uppercase rounded hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Chapter →
                </button>
              </div>
            </footer>
          </main>
        </div>
      </section>
    </>
  );
}
