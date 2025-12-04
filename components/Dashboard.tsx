import React from 'react';
import { Zap, ArrowUpRight, Sparkles } from 'lucide-react';
import { TOOLS, CATEGORIES, getFavoriteTools } from '../data';

interface DashboardProps {
    onSelectTool: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
    const quickTools = getFavoriteTools();

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
            {/* Hero with Grid */}
            <div className="py-20 lg:py-28 px-6 relative overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>
                {/* Animated Grid Pattern */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px'
                    }}
                />
                {/* Glow Effect */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(255,60,0,0.08) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }}
                />

                <div className="max-w-5xl mx-auto relative z-10">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-medium uppercase tracking-wider"
                        style={{
                            backgroundColor: 'rgba(255,60,0,0.1)',
                            border: '1px solid rgba(255,60,0,0.3)',
                            color: '#FF3C00'
                        }}
                    >
                        <Sparkles className="w-3 h-3" />
                        Free & Open Source
                    </div>

                    {/* Headline */}
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] mb-6 font-bold leading-[0.95]" style={{ color: '#FFFFFF' }}>
                        Work with<br />
                        <span style={{ color: '#FF3C00' }}>PDFs</span> faster.
                    </h1>

                    <p className="text-lg md:text-xl max-w-lg mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Free tools that run entirely in your browser.
                        No uploads. No accounts. Just results.
                    </p>

                    {/* Quick Actions - Bento Style */}
                    <div className="flex flex-wrap gap-3">
                        {quickTools.map((tool, i) => {
                            const Icon = tool.icon;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => onSelectTool(tool.id)}
                                    className="group inline-flex items-center gap-3 px-5 py-3 font-medium text-sm transition-all duration-300"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#FFFFFF'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FF3C00';
                                        e.currentTarget.style.borderColor = '#FF3C00';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tool.name}
                                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tools Section */}
            <div className="py-16 px-6" style={{ backgroundColor: '#0A0A0A' }}>
                <div className="max-w-5xl mx-auto">
                    {CATEGORIES.map((category, catIndex) => {
                        const categoryTools = TOOLS.filter(t => t.category === category);
                        if (categoryTools.length === 0) return null;

                        return (
                            <div key={category} className="mb-14">
                                {/* Category Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <span
                                        className="text-[11px] font-bold uppercase tracking-[0.2em]"
                                        style={{ color: 'rgba(255,255,255,0.35)' }}
                                    >
                                        {category}
                                    </span>
                                    <span className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                                </div>

                                {/* Bento Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {categoryTools.map((tool, index) => {
                                        const Icon = tool.icon;
                                        const isFirst = index === 0;

                                        return (
                                            <button
                                                key={tool.id}
                                                onClick={() => onSelectTool(tool.id)}
                                                className={`group relative p-5 text-left transition-all duration-300 overflow-hidden ${isFirst && categoryTools.length > 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.06)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,60,0,0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                                }}
                                            >
                                                {/* Hover Glow */}
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                                    style={{
                                                        background: 'radial-gradient(circle at 50% 0%, rgba(255,60,0,0.1) 0%, transparent 60%)'
                                                    }}
                                                />

                                                <div className="relative z-10 flex items-start gap-4">
                                                    <div
                                                        className="w-11 h-11 flex items-center justify-center shrink-0 transition-all duration-300"
                                                        style={{
                                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(255,255,255,0.1)'
                                                        }}
                                                    >
                                                        <Icon className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3
                                                            className="font-semibold text-sm mb-1 flex items-center gap-2"
                                                            style={{ color: '#FFFFFF' }}
                                                        >
                                                            {tool.name}
                                                            <ArrowUpRight
                                                                className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                                style={{ color: '#FF3C00' }}
                                                            />
                                                        </h3>
                                                        <p
                                                            className="text-xs leading-relaxed"
                                                            style={{ color: 'rgba(255,255,255,0.4)' }}
                                                        >
                                                            {tool.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="py-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center" style={{ backgroundColor: '#FF3C00' }}>
                            <Zap className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                        </div>
                        <div>
                            <span className="font-bold" style={{ color: '#FFFFFF' }}>PDFast</span>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Free PDF Tools</p>
                        </div>
                    </div>
                    <div className="flex gap-8 text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <span>Private</span>
                        <span>Browser-based</span>
                        <span>Open Source</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
