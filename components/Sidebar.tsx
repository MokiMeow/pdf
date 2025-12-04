import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Zap, Home, PanelLeftClose, PanelLeft } from 'lucide-react';
import { TOOLS, CATEGORIES } from '../data';

interface SidebarProps {
    currentTool: string | null;
    onSelectTool: (id: string | null) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTool, onSelectTool, isCollapsed, onToggleCollapse }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES));

    const filteredTools = useMemo(() => {
        if (!searchQuery.trim()) return TOOLS;
        const query = searchQuery.toLowerCase();
        return TOOLS.filter(t =>
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    // Collapsed state
    if (isCollapsed) {
        return (
            <div className="w-14 h-screen fixed left-0 top-0 z-50 hidden md:flex flex-col" style={{ backgroundColor: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div
                        onClick={() => onSelectTool(null)}
                        className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors"
                        style={{ backgroundColor: '#FF3C00' }}
                    >
                        <Zap className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                    </div>
                </div>

                <button onClick={onToggleCollapse} className="p-3 mx-auto mt-2 transition-colors hover:opacity-70" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <PanelLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 py-4 flex flex-col items-center gap-1 overflow-y-auto">
                    <button
                        onClick={() => onSelectTool(null)}
                        className="p-2.5 transition-colors"
                        style={{
                            backgroundColor: !currentTool ? 'rgba(255,60,0,0.1)' : 'transparent',
                            color: !currentTool ? '#FF3C00' : 'rgba(255,255,255,0.4)'
                        }}
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    {TOOLS.slice(0, 6).map(tool => {
                        const Icon = tool.icon;
                        const isActive = currentTool === tool.id;
                        return (
                            <button
                                key={tool.id}
                                onClick={() => onSelectTool(tool.id)}
                                className="p-2.5 transition-colors"
                                style={{
                                    backgroundColor: isActive ? 'rgba(255,60,0,0.1)' : 'transparent',
                                    color: isActive ? '#FF3C00' : 'rgba(255,255,255,0.4)'
                                }}
                                title={tool.name}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Expanded state
    return (
        <div className="w-64 h-screen fixed left-0 top-0 z-50 hidden md:flex flex-col" style={{ backgroundColor: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div onClick={() => onSelectTool(null)} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 flex items-center justify-center transition-all" style={{ backgroundColor: '#FF3C00' }}>
                        <Zap className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                    </div>
                    <div>
                        <h1 className="font-bold" style={{ color: '#FFFFFF' }}>PDFast</h1>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>PDF Tools</p>
                    </div>
                </div>
                <button onClick={onToggleCollapse} className="p-2 transition-colors hover:opacity-70" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <PanelLeftClose className="w-4 h-4" />
                </button>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm focus:outline-none transition-colors"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#FFFFFF'
                        }}
                    />
                </div>
            </div>

            {/* Home */}
            <div className="px-3">
                <button
                    onClick={() => onSelectTool(null)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 font-medium transition-all"
                    style={{
                        backgroundColor: !currentTool ? 'rgba(255,60,0,0.08)' : 'transparent',
                        color: !currentTool ? '#FF3C00' : 'rgba(255,255,255,0.5)',
                        borderLeft: !currentTool ? '2px solid #FF3C00' : '2px solid transparent'
                    }}
                >
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                </button>
            </div>

            {/* Tools */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                {searchQuery ? (
                    <div className="space-y-0.5">
                        {filteredTools.length > 0 ? (
                            filteredTools.map(tool => (
                                <ToolItem key={tool.id} tool={tool} isActive={currentTool === tool.id} onClick={() => onSelectTool(tool.id)} />
                            ))
                        ) : (
                            <p className="text-sm px-3 py-6 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>No tools found</p>
                        )}
                    </div>
                ) : (
                    CATEGORIES.map(cat => {
                        const categoryTools = TOOLS.filter(t => t.category === cat);
                        if (categoryTools.length === 0) return null;
                        const isExpanded = expandedCategories.has(cat);

                        return (
                            <div key={cat} className="mb-2">
                                <button
                                    onClick={() => toggleCategory(cat)}
                                    className="w-full flex items-center gap-3 py-2.5 cursor-pointer transition-opacity hover:opacity-70"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{cat}</span>
                                    <span className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                                    {isExpanded ? <ChevronDown className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronRight className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />}
                                </button>
                                {isExpanded && (
                                    <div className="space-y-0.5">
                                        {categoryTools.map(tool => (
                                            <ToolItem key={tool.id} tool={tool} isActive={currentTool === tool.id} onClick={() => onSelectTool(tool.id)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const ToolItem: React.FC<{ tool: any; isActive: boolean; onClick: () => void }> = ({ tool, isActive, onClick }) => {
    const Icon = tool.icon;
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 font-medium transition-all text-sm"
            style={{
                backgroundColor: isActive ? 'rgba(255,60,0,0.08)' : 'transparent',
                color: isActive ? '#FF3C00' : 'rgba(255,255,255,0.5)',
                borderLeft: isActive ? '2px solid #FF3C00' : '2px solid transparent'
            }}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1 text-left">{tool.name}</span>
        </button>
    );
};
