// Crypto Service - AES-256-GCM encryption with URL-embedded data

export async function generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function exportKey(key: CryptoKey): Promise<string> {
    const rawKey = await crypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(rawKey);
}

export async function importKey(keyString: string): Promise<CryptoKey> {
    const rawKey = base64ToArrayBuffer(keyString);
    return await crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function encryptFile(file: File, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const fileBuffer = await file.arrayBuffer();

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        fileBuffer
    );

    const metadata = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size
    };

    const packageData = {
        iv: arrayBufferToBase64(iv.buffer),
        data: arrayBufferToBase64(encrypted),
        meta: metadata
    };

    return btoa(JSON.stringify(packageData));
}

export async function decryptPackage(packageString: string, key: CryptoKey): Promise<{ data: Blob; metadata: FileMetadata }> {
    const packageData = JSON.parse(atob(packageString));

    const iv = new Uint8Array(base64ToArrayBuffer(packageData.iv));
    const encrypted = base64ToArrayBuffer(packageData.data);
    const metadata = packageData.meta as FileMetadata;

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource },
        key,
        encrypted
    );

    const blob = new Blob([decrypted], { type: metadata.type });
    return { data: blob, metadata };
}

export interface FileMetadata {
    name: string;
    type: string;
    size: number;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export function createShareLink(encryptedPackage: string, keyString: string): string {
    const baseUrl = window.location.origin + window.location.pathname;
    const safePackage = encryptedPackage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const safeKey = keyString.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return `${baseUrl}#d=${safePackage}&k=${safeKey}`;
}

export function parseShareLink(hash: string): { package: string; key: string } | null {
    if (!hash || !hash.includes('d=') || !hash.includes('k=')) return null;

    const params = new URLSearchParams(hash.replace('#', ''));
    let pkg = params.get('d');
    let key = params.get('k');

    if (!pkg || !key) return null;

    pkg = pkg.replace(/-/g, '+').replace(/_/g, '/');
    key = key.replace(/-/g, '+').replace(/_/g, '/');

    while (pkg.length % 4) pkg += '=';
    while (key.length % 4) key += '=';

    return { package: pkg, key };
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
