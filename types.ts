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

export interface ProcessedFile {
  name: string;
  url: string;
  size: number;
  type: 'file' | 'text';
  content?: string;
}

export interface EditorAction {
  type: 'draw' | 'highlight' | 'text' | 'rect' | 'circle' | 'arrow' | 'erase';
  color: string;
  size: number;
}
