
export type FileType = 'image' | 'video' | 'document' | 'other';

export interface FileAnalysisEntity {
  summary: string;
  tags: string[];
  suggestedName: string;
  detectedObjects: string[];
  visualDescription: string;
  shouldBookmark: boolean; // AI's decision to bookmark based on quality/significance
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
  path: string; // Base64 in Web, File Path in Flutter
  thumbnailUrl?: string;
  createdAt: number;
  isBookmarked: boolean; 
  analysis?: FileAnalysisEntity;
}

// SearchResultEntity is used by AppDatabase to cache search results mapped to queries.
export interface SearchResultEntity {
  query: string;
  results: FileEntity[];
  timestamp: number;
}
