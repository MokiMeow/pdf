import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Bot, User, Copy, Check, Lightbulb } from 'lucide-react';
import * as GeminiService from '../../services/geminiService';

interface AiChatProps {
    file: File;
    mode: string;
}

const SUGGESTED_PROMPTS: Record<string, string[]> = {
    'chat-pdf': ["Summarize the main points", "What are the key takeaways?", "Explain the conclusion"],
    'summarize': ["Make it shorter", "Add more detail", "Focus on methodology"],
    'quiz-gen': ["Generate harder questions", "Make 10 multiple choice", "Focus on chapter 2"],
    'flashcards': ["Create 20 flashcards", "Focus on definitions", "Include examples"],
    'study-guide': ["Add more sections", "Simplify explanations", "Add practice questions"],
    'lecture-notes': ["Add more detail", "Create bullet points", "Highlight key terms"],
    'explain': ["Explain simpler", "Use analogies", "Give examples"],
    'formula-extract': ["Format in LaTeX", "Explain each formula", "Group by topic"],
    'code-extract': ["Add comments", "Format code", "Explain the logic"],
    'compare-pdf': ["Show key differences", "Compare conclusions", "List changes"],
    'grammar': ["Make it more formal", "Simplify language", "Check consistency"],
    'translate': ["Translate to Spanish", "Keep technical terms", "Simplify language"],
    default: ["Summarize this", "Explain like I'm 5", "List key points"]
};

export const AiChat: React.FC<AiChatProps> = ({ file, mode }) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const prompts = SUGGESTED_PROMPTS[mode] || SUGGESTED_PROMPTS.default;

    useEffect(() => {
        if (messages.length === 0) triggerInitialAction();
    }, [mode]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const triggerInitialAction = async () => {
        setLoading(true);
        let result = '';
        try {
            if (mode === 'summarize') result = await GeminiService.summarizePdf(file);
            else if (mode === 'quiz-gen') result = await GeminiService.generateQuiz(file);
            else if (mode === 'cad-analyze') result = await GeminiService.analyzeCad(file);
            else if (mode === 'grammar') result = await GeminiService.fixGrammar(file);

            if (result) {
                setMessages([{ role: 'ai', text: result }]);
            } else {
                setMessages([{ role: 'ai', text: `I've analyzed **${file.name}**. What would you like to know?` }]);
            }
        } catch (e) {
            setMessages([{ role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
        }
        setLoading(false);
    };

    const handleSend = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: messageText }]);
        setInput('');
        setLoading(true);

        try {
            const reply = await GeminiService.chatWithPdf(file, messageText);
            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: "Error getting response." }]);
        }
        setLoading(false);
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="flex flex-col h-[500px] bg-white/80 rounded-xl border border-cream-300 overflow-hidden shadow-sm">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user'
                                ? 'bg-gradient-to-br from-coral-400 to-coral-600'
                                : 'bg-cream-200'
                            }`}>
                            {m.role === 'user'
                                ? <User className="w-4 h-4 text-white" />
                                : <Bot className="w-4 h-4 text-coral-600" />
                            }
                        </div>
                        <div className={`group relative ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                            <div className="whitespace-pre-wrap">{m.text}</div>
                            {m.role === 'ai' && (
                                <button
                                    onClick={() => copyToClipboard(m.text, i)}
                                    className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-warm-400 hover:text-coral-600 transition-all"
                                >
                                    {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedIndex === i ? 'Copied' : 'Copy'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3 animate-fade-in">
                        <div className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1.5 px-4 py-3 bg-cream-100 rounded-2xl">
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                        </div>
                    </div>
                )}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && !loading && (
                <div className="px-4 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] text-warm-400 uppercase tracking-wider font-medium">Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {prompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(prompt)}
                                className="px-3 py-2 bg-cream-50 hover:bg-coral-50 border border-cream-300 hover:border-coral-300 rounded-xl text-xs text-warm-600 hover:text-coral-600 transition-all font-medium"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-cream-200 bg-cream-50/50">
                <div className="relative flex items-center gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="input flex-1 py-2.5 bg-white"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="btn-primary p-2.5 rounded-xl"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
