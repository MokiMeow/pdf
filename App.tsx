import React, { useState, useEffect } from 'react';
import { Home, Menu, Zap } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { ShareVault } from './components/ShareVault';

export default function App() {
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isShareMode, setIsShareMode] = useState(false);

  // Check for share link on mount and hash changes
  useEffect(() => {
    const checkShareLink = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('d=') && hash.includes('k=')) {
        setIsShareMode(true);
        setCurrentTool(null);
      }
    };

    checkShareLink();
    window.addEventListener('hashchange', checkShareLink);
    return () => window.removeEventListener('hashchange', checkShareLink);
  }, []);

  // Show ShareVault full screen for receiving files
  if (isShareMode) {
    return (
      <ShareVault
        onClose={() => {
          setIsShareMode(false);
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0A' }}>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed md:relative z-50 transition-transform duration-200 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar
          currentTool={currentTool}
          onSelectTool={(id) => {
            setCurrentTool(id);
            setIsMobileMenuOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div
        className={`flex-1 min-h-screen transition-all duration-200 ${isSidebarCollapsed ? 'md:ml-14' : 'md:ml-64'}`}
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div
          className="md:hidden p-4 flex justify-between items-center sticky top-0 z-30"
          style={{ backgroundColor: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2" style={{ color: '#FFFFFF' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#FF3C00' }}>
              <Zap className="w-4 h-4" style={{ color: '#FFFFFF' }} />
            </div>
            <span className="font-bold" style={{ color: '#FFFFFF' }}>PDFast</span>
          </div>
          <button onClick={() => setCurrentTool(null)} className="p-2" style={{ color: '#FFFFFF' }}>
            <Home className="w-5 h-5" />
          </button>
        </div>

        <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
          {currentTool ? <Workspace toolId={currentTool} /> : <Dashboard onSelectTool={setCurrentTool} />}
        </main>
      </div>
    </div>
  );
}
