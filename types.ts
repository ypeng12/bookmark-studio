
export type FileType = 'image' | 'video' | 'document' | 'other';

export interface FileAnalysis {
  summary: string;
  tags: string[];
  suggestedName: string;
  detectedObjects: string[];
  aiModelUsed: string;
  timestamp: number;
}

export interface FileEntity {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  type: FileType;
  path: string; // Base64 or ObjectURL for web-demo
  thumbnailUrl?: string;
  createdAt: number;
  analysis?: FileAnalysis;
}

export interface SearchResult {
  file: FileEntity;
  relevanceScore: number;
  matchReason: string;
}

export enum StorageStats {
  TOTAL_FILES = 'total_files',
  TOTAL_SIZE = 'total_size',
  ANALYZED_COUNT = 'analyzed_count'
}
