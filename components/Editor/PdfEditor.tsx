import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Pen, Save, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Square, Circle, Minus, Highlighter, Undo, Redo, Type, Stamp, Eraser } from 'lucide-react';
import * as PDFService from '../../services/pdfService';
import * as RenderService from '../../services/renderService';
import { Button } from '../ui/Button';

interface PdfEditorProps {
    file: File;
    mode: string;
    onClose: () => void;
    onSave: (blob: Blob) => void;
}

type Tool = 'draw' | 'highlight' | 'rect' | 'circle' | 'line' | 'text' | 'stamp' | 'erase';

interface HistoryState {
    imageData: ImageData;
}

const STAMPS = ['APPROVED', 'DRAFT', 'CONFIDENTIAL', 'REVIEWED', 'FINAL'];
const COLORS = ['#0F0F0F', '#FF3C00', '#00B450', '#3B82F6', '#8B5CF6'];

export const PdfEditor: React.FC<PdfEditorProps> = ({ file, mode, onClose, onSave }) => {
    const [pageIndex, setPageIndex] = useState(0);
    const [numPages, setNumPages] = useState(0);
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const [scale, setScale] = useState(1);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>('draw');
    const [color, setColor] = useState('#0F0F0F');
    const [lineWidth, setLineWidth] = useState(2);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [selectedStamp, setSelectedStamp] = useState(STAMPS[0]);

    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    useEffect(() => {
        loadPage(0);
    }, []);

    useEffect(() => {
        if (mode === 'sign-pdf') { setTool('draw'); setColor('#0F0F0F'); setLineWidth(2); }
        else if (mode === 'redact-pdf') { setTool('rect'); setColor('#0F0F0F'); }
        else if (mode === 'highlight') { setTool('highlight'); setColor('#FF3C00'); }
        else { setTool('draw'); setColor('#0F0F0F'); }
    }, [mode]);

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ imageData });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex <= 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        const newIndex = historyIndex - 1;
        ctx.putImageData(history[newIndex].imageData, 0, 0);
        setHistoryIndex(newIndex);
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        const newIndex = historyIndex + 1;
        ctx.putImageData(history[newIndex].imageData, 0, 0);
        setHistoryIndex(newIndex);
    }, [history, historyIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const loadPage = async (idx: number) => {
        try {
            const { imageData, width, height, pageCount } = await RenderService.renderPageToImage(file, idx, 1.5);
            setBgImage(imageData);
            setDims({ w: width, h: height });
            setNumPages(pageCount);
            setPageIndex(idx);
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, width, height);
                setHistory([]);
                setHistoryIndex(-1);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getCoords = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
    };

    const startDraw = (e: React.MouseEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        const { x, y } = getCoords(e);
        setStartPos({ x, y });
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = tool === 'highlight' ? `${color}66` : color;
        ctx.lineWidth = tool === 'highlight' ? lineWidth * 8 : lineWidth;
        ctx.fillStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoords(e);
        if (tool === 'draw' || tool === 'highlight') {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (tool === 'erase') {
            ctx.clearRect(x - lineWidth * 3, y - lineWidth * 3, lineWidth * 6, lineWidth * 6);
        }
    };

    const endDraw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoords(e);
        if (tool === 'rect') ctx.fillRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
            ctx.beginPath();
            ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (tool === 'stamp') {
            ctx.font = 'bold 24px "DM Sans"';
            ctx.fillStyle = color;
            ctx.fillText(selectedStamp, x, y);
        } else if (tool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                ctx.font = '16px "DM Sans"';
                ctx.fillStyle = color;
                ctx.fillText(text, x, y);
            }
        }
        saveToHistory();
    };

    const handleSave = async () => {
        if (!canvasRef.current) return;
        const overlayData = canvasRef.current.toDataURL('image/png');
        try {
            const modifiedPdfBytes = await PDFService.applyOverlayToPdf(file, overlayData, pageIndex);
            onSave(new Blob([modifiedPdfBytes], { type: 'application/pdf' }));
        } catch (e) {
            alert("Failed to save.");
        }
    };

    const tools: { id: Tool; icon: any; label: string }[] = [
        { id: 'draw', icon: Pen, label: 'Draw' },
        { id: 'highlight', icon: Highlighter, label: 'Highlight' },
        { id: 'line', icon: Minus, label: 'Line' },
        { id: 'rect', icon: Square, label: 'Rectangle' },
        { id: 'circle', icon: Circle, label: 'Circle' },
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'stamp', icon: Stamp, label: 'Stamp' },
        { id: 'erase', icon: Eraser, label: 'Eraser' },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-paper flex flex-col">
            {/* Header */}
            <div className="h-14 bg-paper border-b-2 border-ink/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 text-muted hover:text-ink hover:bg-ink/5 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div>
                        <span className="font-bold text-ink">
                            {mode === 'sign-pdf' ? 'Sign Document' : mode === 'redact-pdf' ? 'Redact' : 'Edit PDF'}
                        </span>
                        <p className="text-xs text-muted">{file.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-ink/5 p-1 border-2 border-ink/10">
                        <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 text-muted hover:text-ink disabled:opacity-30 transition-colors">
                            <Undo className="w-4 h-4" />
                        </button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 text-muted hover:text-ink disabled:opacity-30 transition-colors">
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-ink/5 p-1 border-2 border-ink/10">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 text-muted hover:text-ink transition-colors">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono w-10 text-center text-ink">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 text-muted hover:text-ink transition-colors">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>

                    <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>Save</Button>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 flex">
                {/* Toolbar */}
                <div className="w-14 bg-paper border-r-2 border-ink/10 py-3 flex flex-col items-center gap-1">
                    {tools.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setTool(id)}
                            className={`p-2.5 transition-colors ${tool === id ? 'bg-ink text-paper' : 'text-muted hover:text-ink hover:bg-ink/5'}`}
                            title={label}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}

                    <div className="h-px w-8 bg-ink/10 my-2" />

                    {/* Colors */}
                    <div className="flex flex-col gap-1">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 border-2 transition-all ${color === c ? 'border-ink scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    {tool === 'stamp' && (
                        <select
                            value={selectedStamp}
                            onChange={(e) => setSelectedStamp(e.target.value)}
                            className="mt-2 text-[10px] bg-ink/5 border-2 border-ink/10 p-1 text-ink"
                        >
                            {STAMPS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    )}
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-auto p-8 bg-ink/5 flex justify-center items-start">
                    <div className="relative shadow-lg" style={{ width: dims.w, height: dims.h, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                        {bgImage && <img src={bgImage} alt="PDF" className="absolute inset-0 w-full h-full pointer-events-none" />}
                        <canvas
                            ref={canvasRef}
                            width={dims.w}
                            height={dims.h}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={endDraw}
                            onMouseLeave={endDraw}
                            className="absolute inset-0 w-full h-full cursor-crosshair"
                        />
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {numPages > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-paper border-2 border-ink px-4 py-2 shadow-lg">
                    <button disabled={pageIndex <= 0} onClick={() => loadPage(pageIndex - 1)} className="p-1 text-ink disabled:opacity-30 hover:bg-ink/5 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-ink font-medium">{pageIndex + 1} / {numPages}</span>
                    <button disabled={pageIndex >= numPages - 1} onClick={() => loadPage(pageIndex + 1)} className="p-1 text-ink disabled:opacity-30 hover:bg-ink/5 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};
