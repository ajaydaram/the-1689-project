import { useState } from "react";
import { Routes, Route, useNavigate, Link, useParams } from "react-router-dom";
import { HomeLayout } from "./components/HomeLayout";
import { ArticleLayout } from "./components/ArticleLayout";
import { SearchModal } from "./components/SearchModal";
import { Search, Settings2, Moon, Sun, Type } from "lucide-react";

function ArticleRouteAdapter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chapterId = id ? parseInt(id, 10) : null;

  if (!chapterId || isNaN(chapterId)) {
    return <div className="p-12 text-center">Chapter not found</div>;
  }

  const handleChapterClick = (newId: number) => {
    navigate(`/chapter/${newId}`);
  };

  return <ArticleLayout key={chapterId} chapterId={chapterId} onChapterClick={handleChapterClick} />;
}

export default function App() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Settings State
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("sepia"); // Use sepia as default as requested

  const handleSearchSelect = (id: number) => {
    navigate(`/chapter/${id}`);
    setIsSearchOpen(false);
  };

  const cycleFontSize = () => {
    if (fontSize === "base") setFontSize("lg");
    else if (fontSize === "lg") setFontSize("xl");
    else setFontSize("base");
  };

  const cycleTheme = () => {
    if (theme === "light") setTheme("sepia");
    else if (theme === "sepia") setTheme("dark");
    else setTheme("light");
  };

  return (
    <div className={`flex h-full flex-col font-sans theme-${theme}`}>
      <nav className="h-16 shrink-0 border-b border-border-subtle bg-surface-nav flex items-center justify-between px-4 sm:px-8 z-10 relative transition-colors">
        <Link 
          to="/"
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm text-white font-bold group-hover:bg-accent-hover transition-colors">16</div>
          <span className="font-semibold tracking-tight uppercase text-xs hidden sm:block group-hover:text-accent transition-colors text-text-primary">The 1689 Baptist Confession</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          <Link 
            to="/"
            className="cursor-pointer transition-colors hidden sm:block hover:text-text-primary"
          >
            Chapters
          </Link>
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-strong bg-surface-bg hover:bg-surface-sidebar transition-colors cursor-text text-text-secondary w-48 sm:w-64"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs">Search topics, scriptures...</span>
          </div>
          
          <div className="h-4 w-px bg-border-strong"></div>

          <button 
            onClick={cycleTheme}
            className="flex items-center justify-center p-2 rounded hover:bg-surface-sidebar text-text-secondary hover:text-accent transition-colors group relative"
            title="Toggle Theme"
          >
            {theme === "light" && <Sun className="w-4 h-4" />}
            {theme === "sepia" && <Settings2 className="w-4 h-4" />}
            {theme === "dark" && <Moon className="w-4 h-4" />}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-text-primary text-surface-content text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Theme: {theme === 'light' ? 'Light' : theme === 'sepia' ? 'Sepia' : 'Dark'}
            </span>
          </button>

          <button 
            onClick={cycleFontSize}
            className="flex items-center gap-1.5 p-2 rounded hover:bg-surface-sidebar transition-colors group relative"
            title="Toggle Font Size"
          >
            <Type className="w-4 h-4" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-text-primary text-surface-content text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Size: {fontSize === 'base' ? 'Small' : fontSize === 'lg' ? 'Medium' : 'Large'}
            </span>
          </button>
        </div>
      </nav>
      
      <main className={`flex flex-1 overflow-hidden font-settings-${fontSize} transition-colors`}>
        <Routes>
          <Route path="/" element={<HomeLayout onChapterClick={(id) => navigate(`/chapter/${id}`)} />} />
          <Route path="/chapter/:id" element={<ArticleRouteAdapter />} />
        </Routes>
      </main>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelect={handleSearchSelect} 
      />
    </div>
  );
}
