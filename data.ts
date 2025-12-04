import {
  FileText, Merge, Scissors, Minimize2, Wrench, Search, Pen, EyeOff, Image as ImageIcon,
  FileSpreadsheet, Presentation, FileOutput, Lock, Unlock, PenTool, LayoutTemplate,
  Sparkles, FileQuestion, Languages, Code, FileCode, Globe, Download, Shield
} from 'lucide-react';

// Simplified, well-organized tool categories
export enum ToolCategory {
  ESSENTIAL = 'Essential Tools',
  EDIT = 'Edit & Sign',
  ORGANIZE = 'Organize',
  CONVERT = 'Convert',
  SECURITY = 'Security',
}

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: ToolCategory;
  isNew?: boolean;
}

export const TOOLS: ToolDef[] = [
  // ============================================
  // ESSENTIAL - Most used tools
  // ============================================
  { id: 'merge', name: 'Merge PDFs', description: 'Combine multiple files', icon: Merge, category: ToolCategory.ESSENTIAL },
  { id: 'split', name: 'Split PDF', description: 'Extract pages', icon: Scissors, category: ToolCategory.ESSENTIAL },
  { id: 'compress', name: 'Compress', description: 'Reduce file size', icon: Minimize2, category: ToolCategory.ESSENTIAL },
  { id: 'edit-pdf', name: 'Edit PDF', description: 'Draw and annotate', icon: Pen, category: ToolCategory.ESSENTIAL },
  { id: 'secure-share', name: 'Secure Share', description: 'Encrypted file sharing', icon: Shield, category: ToolCategory.ESSENTIAL, isNew: true },

  // ============================================
  // EDIT & SIGN
  // ============================================
  { id: 'sign-pdf', name: 'Sign PDF', description: 'Add signature', icon: PenTool, category: ToolCategory.EDIT },
  { id: 'redact-pdf', name: 'Redact', description: 'Hide sensitive info', icon: EyeOff, category: ToolCategory.EDIT },

  // ============================================
  // ORGANIZE
  // ============================================
  { id: 'organize', name: 'Organize Pages', description: 'Reorder and rotate', icon: LayoutTemplate, category: ToolCategory.ORGANIZE },
  { id: 'repair', name: 'Repair PDF', description: 'Fix corrupted files', icon: Wrench, category: ToolCategory.ORGANIZE },
  { id: 'extract-text', name: 'Extract Text', description: 'Get all text', icon: FileText, category: ToolCategory.ORGANIZE },

  // ============================================
  // CONVERT
  // ============================================
  { id: 'img-to-pdf', name: 'Image to PDF', description: 'JPG/PNG to PDF', icon: ImageIcon, category: ToolCategory.CONVERT },
  { id: 'pdf-to-word', name: 'PDF to Word', description: 'Convert to DOCX', icon: FileText, category: ToolCategory.CONVERT },
  { id: 'pdf-to-excel', name: 'PDF to Excel', description: 'Extract tables', icon: FileSpreadsheet, category: ToolCategory.CONVERT },
  { id: 'pdf-to-ppt', name: 'PDF to PPT', description: 'Convert to slides', icon: Presentation, category: ToolCategory.CONVERT },
  { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', description: 'Archive format', icon: FileOutput, category: ToolCategory.CONVERT },

  // ============================================
  // SECURITY
  // ============================================
  { id: 'protect', name: 'Protect PDF', description: 'Add password', icon: Lock, category: ToolCategory.SECURITY },
  { id: 'unlock', name: 'Unlock PDF', description: 'Remove password', icon: Unlock, category: ToolCategory.SECURITY },
];

// Get tools by category
export const getToolsByCategory = (category: ToolCategory): ToolDef[] => {
  return TOOLS.filter(tool => tool.category === category);
};

// Quick access tools for hero
export const getFavoriteTools = (): ToolDef[] => {
  const ids = ['merge', 'compress', 'edit-pdf', 'split'];
  return ids.map(id => TOOLS.find(t => t.id === id)).filter(Boolean) as ToolDef[];
};

// Categories in display order
export const CATEGORIES = [
  ToolCategory.ESSENTIAL,
  ToolCategory.EDIT,
  ToolCategory.ORGANIZE,
  ToolCategory.CONVERT,
  ToolCategory.SECURITY,
];
