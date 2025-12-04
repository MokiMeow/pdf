import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadCloud, FileText, X, ArrowRight, Download, CheckCircle, Trash2, Copy, Check, Sparkles } from 'lucide-react';
import { TOOLS } from '../data';
import * as PDFService from '../services/pdfService';
import * as GeminiService from '../services/geminiService';
import { PdfEditor } from './Editor/PdfEditor';
import { Button } from './ui/Button';
import { ShareVault } from './ShareVault';

interface WorkspaceProps {
    toolId: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ toolId }) => {
    // Handle secure-share separately
    if (toolId === 'secure-share') {
        return <ShareVault />;
    }

    const tool = TOOLS.find(t => t.id === toolId);
    const [files, setFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [password, setPassword] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFiles([]);
        setResult(null);
        setError(null);
        setShowEditor(false);
        setPassword("");
        setProgress(0);
    }, [toolId]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    }, []);

    const processAction = async () => {
        setProcessing(true);
        setError(null);
        setProgress(0);

        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + Math.random() * 25, 90));
        }, 150);

        try {
            if (!files.length) throw new Error("Select a file first");

            let output: any = null;
            const file = files[0];

            if (toolId === 'merge') output = await PDFService.mergePdfs(files);
            else if (toolId === 'split') { const res = await PDFService.splitPdf(file); output = res[0]; }
            else if (toolId === 'compress') output = await PDFService.compressPdf(file);
            else if (toolId === 'repair') output = await PDFService.compressPdf(file);
            else if (toolId === 'protect') output = await PDFService.protectPdf(file, password || "1234");
            else if (toolId === 'unlock') output = await PDFService.unlockPdf(file, password);
            else if (toolId === 'organize') output = await PDFService.organizePdf(file, { rotate: 90 });
            else if (toolId === 'img-to-pdf') output = await PDFService.imagesToPdf(files);
            else if (toolId === 'pdf-to-pdfa') output = await PDFService.pdfToPdfA(file);
            else if (toolId === 'pdf-to-word') output = await GeminiService.convertToFormat(file, 'Word');
            else if (toolId === 'pdf-to-excel') output = await GeminiService.convertToFormat(file, 'Excel');
            else if (toolId === 'pdf-to-ppt') output = await GeminiService.convertToFormat(file, 'PowerPoint');
            else if (toolId === 'extract-text') { const text = await PDFService.extractText(file); output = text; }

            clearInterval(progressInterval);
            setProgress(100);

            if (output) {
                if (typeof output === 'string') {
                    setResult({ type: 'text', content: output });
                } else {
                    const blob = new Blob([output], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    setResult({ type: 'file', url, name: `${toolId}_output.pdf` });
                }
            }
        } catch (e: any) {
            clearInterval(progressInterval);
            setError(e.message || "Something went wrong");
        } finally {
            setProcessing(false);
        }
    };

    const handleEditorSave = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setResult({ type: 'file', url, name: `edited_${files[0].name}` });
        setShowEditor(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isEditor = tool?.id === 'edit-pdf' || tool?.id === 'sign-pdf' || tool?.id === 'redact-pdf';
    const showUploader = !result && !showEditor && files.length === 0;
    const showConfig = !result && !showEditor && files.length > 0;
    const allowMultiple = toolId === 'merge' || toolId === 'img-to-pdf';

    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: '#0A0A0A' }}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    {tool?.icon && (
                        <div
                            className="w-16 h-16 flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: 'rgba(255,60,0,0.1)', border: '1px solid rgba(255,60,0,0.2)' }}
                        >
                            <tool.icon className="w-7 h-7" style={{ color: '#FF3C00' }} />
                        </div>
                    )}
                    <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>{tool?.name}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>{tool?.description}</p>
                </div>

                {/* Main Card */}
                <div
                    className="min-h-[400px] flex flex-col relative overflow-hidden"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}
                >
                    {/* Loading */}
                    {processing && (
                        <div
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
                            style={{ backgroundColor: 'rgba(10,10,10,0.95)' }}
                        >
                            <div
                                className="w-12 h-12 mb-4 animate-spin"
                                style={{
                                    border: '2px solid rgba(255,255,255,0.1)',
                                    borderTopColor: '#FF3C00'
                                }}
                            />
                            <p className="font-medium mb-4" style={{ color: '#FFFFFF' }}>Processing...</p>
                            <div className="w-48 h-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <div
                                    className="h-full transition-all duration-300"
                                    style={{ backgroundColor: '#FF3C00', width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Upload */}
                    {showUploader && (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div
                                className="relative p-16 text-center cursor-pointer w-full max-w-md transition-all duration-300"
                                style={{
                                    border: isDragging ? '2px solid #FF3C00' : '2px dashed rgba(255,255,255,0.15)',
                                    backgroundColor: isDragging ? 'rgba(255,60,0,0.05)' : 'transparent'
                                }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    multiple={allowMultiple}
                                    accept={toolId === 'img-to-pdf' ? 'image/*' : '.pdf'}
                                    onChange={(e) => { if (e.target.files?.length) setFiles(Array.from(e.target.files)); }}
                                />
                                <UploadCloud
                                    className="w-12 h-12 mx-auto mb-4"
                                    style={{ color: isDragging ? '#FF3C00' : 'rgba(255,255,255,0.3)' }}
                                />
                                <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Drop file here</h3>
                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    or <span className="underline font-medium" style={{ color: '#FF3C00' }}>browse</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Config */}
                    {showConfig && !isEditor && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <div
                                className="w-full max-w-sm p-4 mb-6 flex items-center justify-between"
                                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5" style={{ color: '#FF3C00' }} />
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: '#FFFFFF' }}>{files[0].name}</p>
                                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            {files.length > 1 ? `+ ${files.length - 1} more` : `${(files[0].size / 1024 / 1024).toFixed(1)} MB`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFiles([])}
                                    className="p-2 transition-colors hover:bg-white/5"
                                    style={{ color: 'rgba(255,255,255,0.4)' }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {(toolId === 'protect' || toolId === 'unlock') && (
                                <div className="w-full max-w-sm mb-6">
                                    <label className="text-sm font-medium mb-2 block" style={{ color: '#FFFFFF' }}>Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 focus:outline-none transition-colors"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#FFFFFF'
                                        }}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                    />
                                </div>
                            )}

                            <button
                                onClick={processAction}
                                className="inline-flex items-center gap-3 px-8 py-3.5 font-semibold text-sm transition-all duration-300"
                                style={{ backgroundColor: '#FF3C00', color: '#FFFFFF' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Process File
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Editor Launcher */}
                    {showConfig && isEditor && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <div
                                className="w-20 h-20 flex items-center justify-center mb-6"
                                style={{ backgroundColor: 'rgba(255,60,0,0.1)', border: '1px solid rgba(255,60,0,0.2)' }}
                            >
                                <FileText className="w-10 h-10" style={{ color: '#FF3C00' }} />
                            </div>
                            <h3 className="font-serif text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Ready to edit</h3>
                            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{files[0].name}</p>
                            <button
                                onClick={() => setShowEditor(true)}
                                className="inline-flex items-center gap-3 px-8 py-3.5 font-semibold text-sm transition-all duration-300"
                                style={{ backgroundColor: '#FF3C00', color: '#FFFFFF' }}
                            >
                                <Sparkles className="w-4 h-4" />
                                Open Editor
                            </button>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div
                                className="w-20 h-20 flex items-center justify-center mb-6"
                                style={{ backgroundColor: 'rgba(0,180,80,0.1)', border: '1px solid rgba(0,180,80,0.2)' }}
                            >
                                <CheckCircle className="w-10 h-10" style={{ color: '#00B450' }} />
                            </div>
                            <h3 className="font-serif text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Complete!</h3>
                            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Your file is ready to download</p>

                            {result.type === 'file' ? (
                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    <a
                                        href={result.url}
                                        download={result.name}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold transition-all duration-300"
                                        style={{ backgroundColor: '#FF3C00', color: '#FFFFFF' }}
                                    >
                                        <Download className="w-4 h-4" /> Download File
                                    </a>
                                    <button
                                        onClick={() => { setResult(null); setFiles([]); }}
                                        className="px-6 py-3 font-medium text-sm transition-colors"
                                        style={{ color: 'rgba(255,255,255,0.5)' }}
                                    >
                                        Process Another
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full max-w-lg">
                                    <div
                                        className="p-4 text-left max-h-48 overflow-y-auto mb-4"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        <pre className="text-sm whitespace-pre-wrap font-mono" style={{ color: '#FFFFFF' }}>{result.content}</pre>
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => copyToClipboard(result.content)}
                                            className="inline-flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors"
                                            style={{
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                        <button
                                            onClick={() => { setResult(null); setFiles([]); }}
                                            className="px-4 py-2 font-medium text-sm"
                                            style={{ color: 'rgba(255,255,255,0.5)' }}
                                        >
                                            Start Over
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 flex items-center gap-2"
                            style={{ backgroundColor: '#DC2828', color: '#FFFFFF' }}
                        >
                            <X className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {showEditor && files.length > 0 && (
                <PdfEditor file={files[0]} mode={toolId} onClose={() => setShowEditor(false)} onSave={handleEditorSave} />
            )}
        </div>
    );
};
