import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, Link, Copy, Check, Shield, Lock, Download, X, FileText, Image, Film, Music, Archive, File, Loader2, Share2, AlertTriangle } from 'lucide-react';
import * as CryptoService from '../services/cryptoService';

interface ShareVaultProps {
    onClose?: () => void;
}

export const ShareVault: React.FC<ShareVaultProps> = ({ onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [encrypting, setEncrypting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [receivedFile, setReceivedFile] = useState<{ data: Blob; metadata: CryptoService.FileMetadata } | null>(null);
    const [decrypting, setDecrypting] = useState(false);
    const [isReceiveMode, setIsReceiveMode] = useState(false);

    useEffect(() => {
        const params = CryptoService.parseShareLink(window.location.hash);
        if (params) {
            setIsReceiveMode(true);
            handleReceive(params.package, params.key);
        }
    }, []);

    const handleReceive = async (pkg: string, keyString: string) => {
        setDecrypting(true);
        setError(null);
        try {
            const key = await CryptoService.importKey(keyString);
            const { data, metadata } = await CryptoService.decryptPackage(pkg, key);
            setReceivedFile({ data, metadata });
        } catch (e) {
            setError('Failed to decrypt. The link may be corrupted.');
        }
        setDecrypting(false);
    };

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
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setShareLink(null);
            setError(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setShareLink(null);
            setError(null);
        }
    };

    const handleEncryptAndShare = async () => {
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError('File too large. Maximum size is 2MB.');
            return;
        }

        setEncrypting(true);
        setProgress(0);
        setError(null);

        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 20, 85));
            }, 100);

            const key = await CryptoService.generateKey();
            const keyString = await CryptoService.exportKey(key);
            const encryptedPackage = await CryptoService.encryptFile(file, key);

            clearInterval(progressInterval);
            setProgress(100);

            const link = CryptoService.createShareLink(encryptedPackage, keyString);
            setShareLink(link);
        } catch (e: any) {
            setError(e.message || 'Encryption failed');
        }
        setEncrypting(false);
    };

    const copyLink = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const downloadFile = () => {
        if (!receivedFile) return;
        const url = URL.createObjectURL(receivedFile.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = receivedFile.metadata.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return Image;
        if (type.startsWith('video/')) return Film;
        if (type.startsWith('audio/')) return Music;
        if (type.includes('pdf')) return FileText;
        if (type.includes('zip')) return Archive;
        return File;
    };

    const reset = () => {
        setFile(null);
        setShareLink(null);
        setError(null);
        setReceivedFile(null);
        setIsReceiveMode(false);
        window.history.replaceState(null, '', window.location.pathname);
        if (onClose) onClose();
    };

    // Receive mode
    if (isReceiveMode) {
        const FileIcon = receivedFile ? getFileIcon(receivedFile.metadata.type) : File;
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0A0A0A' }}>
                <div className="w-full max-w-md p-8 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {decrypting ? (
                        <>
                            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#FF3C00' }} />
                            <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Decrypting...</h2>
                        </>
                    ) : error ? (
                        <>
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(220,40,40,0.1)' }}>
                                <X className="w-8 h-8" style={{ color: '#DC2828' }} />
                            </div>
                            <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Error</h2>
                            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
                            <button onClick={reset} className="px-6 py-3 font-semibold" style={{ backgroundColor: '#FF3C00', color: '#FFFFFF' }}>Go Back</button>
                        </>
                    ) : receivedFile ? (
                        <>
                            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,180,80,0.1)' }}>
                                <FileIcon className="w-10 h-10" style={{ color: '#00B450' }} />
                            </div>
                            <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>File Ready!</h2>
                            <p className="text-sm mb-1" style={{ color: '#FFFFFF' }}>{receivedFile.metadata.name}</p>
                            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{CryptoService.formatFileSize(receivedFile.metadata.size)}</p>
                            <button onClick={downloadFile} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-semibold mb-3" style={{ backgroundColor: '#FF3C00', color: '#FFFFFF' }}>
                                <Download className="w-4 h-4" /> Download
                            </button>
                            <button onClick={reset} className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Share Another</button>
                        </>
                    ) : null}
                </div>
            </div>
        );
    }

    // Share mode
    return (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: '#0A0A0A' }}>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(255,60,0,0.1)' }}>
                        <Shield className="w-7 h-7" style={{ color: '#FF3C00' }} />
                    </div>
                    <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Secure Share</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>End-to-end encrypted. Works anywhere.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[{ icon: Lock, label: 'AES-256' }, { icon: Share2, label: 'Cross-Browser' }, { icon: AlertTriangle, label: 'Max 2MB' }].map(({ icon: Icon, label }) => (
                        <div key={label} className="p-4 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: '#FF3C00' }} />
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
                        </div>
                    ))}
                </div>

                <div className="p-8" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {!file && !shareLink && (
                        <div className="p-12 text-center cursor-pointer relative" style={{ border: isDragging ? '2px solid #FF3C00' : '2px dashed rgba(255,255,255,0.15)' }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                            <UploadCloud className="w-14 h-14 mx-auto mb-4" style={{ color: isDragging ? '#FF3C00' : 'rgba(255,255,255,0.3)' }} />
                            <h3 className="font-semibold text-lg mb-2" style={{ color: '#FFFFFF' }}>Drop any file here</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)' }}>or <span style={{ color: '#FF3C00' }}>browse</span></p>
                        </div>
                    )}

                    {file && !shareLink && (
                        <div className="text-center">
                            {encrypting ? (
                                <>
                                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#FF3C00' }} />
                                    <h3 className="font-semibold text-lg mb-2" style={{ color: '#FFFFFF' }}>Encrypting...</h3>
                                    <div className="w-48 h-1 mx-auto" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <div className="h-full" style={{ backgroundColor: '#FF3C00', width: `${progress}%` }} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                        {React.createElement(getFileIcon(file.type), { className: 'w-8 h-8', style: { color: '#FFFFFF' } })}
                                    </div>
                                    <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>{file.name}</h3>
                                    <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{CryptoService.formatFileSize(file.size)}</p>
                                    <div className="flex gap-3 justify-center">
                                        <button onClick={handleEncryptAndShare} className="flex items-center gap-2 px-8 py-3.5 font-semibold" style={{ backgroundColor: '#FF3C00', color: '#FFFFFF' }}>
                                            <Lock className="w-4 h-4" /> Encrypt & Share
                                        </button>
                                        <button onClick={reset} className="px-4 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {shareLink && (
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,180,80,0.1)' }}>
                                <Check className="w-10 h-10" style={{ color: '#00B450' }} />
                            </div>
                            <h3 className="font-serif text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Link Created!</h3>
                            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>Works in any browser!</p>
                            <div className="flex items-center gap-2 p-3 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                <input type="text" readOnly value={shareLink} className="flex-1 bg-transparent text-xs focus:outline-none" style={{ color: 'rgba(255,255,255,0.7)' }} />
                                <button onClick={copyLink} className="p-2" style={{ color: copied ? '#00B450' : '#FF3C00' }}>
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                            <button onClick={reset} className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Share Another</button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 flex items-center gap-2" style={{ backgroundColor: 'rgba(220,40,40,0.1)' }}>
                            <X className="w-4 h-4" style={{ color: '#DC2828' }} />
                            <span className="text-sm" style={{ color: '#DC2828' }}>{error}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
