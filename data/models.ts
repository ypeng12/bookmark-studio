
import { FileEntity, FileAnalysisEntity } from '../domain/entities';

export interface FileModel extends Omit<FileEntity, 'analysis'> {
  analysisJson?: string; // Stored as string in some DBs, or nested object in IndexedDB
}

export class FileMapper {
  static toEntity(model: FileModel): FileEntity {
    return {
      ...model,
      analysis: model.analysisJson ? JSON.parse(model.analysisJson) : undefined
    };
  }

  static fromEntity(entity: FileEntity): FileModel {
    const { analysis, ...rest } = entity;
    return {
      ...rest,
      analysisJson: analysis ? JSON.stringify(analysis) : undefined
    };
  }
}
