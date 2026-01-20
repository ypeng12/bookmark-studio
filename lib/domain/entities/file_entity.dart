
import 'package:equatable/equatable.dart';

enum FileType { image, video, document, other }

class FileAnalysis extends Equatable {
  final String summary;
  final List<String> tags;
  final String suggestedName;
  final List<String> detectedObjects;
  final String visualDescription; // 新增：用于描述视觉特征以供相似度搜索
  final String aiModelUsed;
  final DateTime timestamp;

  const FileAnalysis({
    required this.summary,
    required this.tags,
    required this.suggestedName,
    required this.detectedObjects,
    required this.visualDescription,
    required this.aiModelUsed,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [summary, tags, suggestedName, detectedObjects, visualDescription, aiModelUsed, timestamp];
}

class FileEntity extends Equatable {
  final String id;
  final String name;
  final String originalName;
  final int size;
  final String mimeType;
  final FileType type;
  final String path;
  final String? thumbnailUrl;
  final DateTime createdAt;
  final bool isBookmarked; // 新增：收藏状态
  final FileAnalysis? analysis;

  const FileEntity({
    required this.id,
    required this.name,
    required this.originalName,
    required this.size,
    required this.mimeType,
    required this.type,
    required this.path,
    this.thumbnailUrl,
    required this.createdAt,
    this.isBookmarked = false,
    this.analysis,
  });

  FileEntity copyWith({bool? isBookmarked, FileAnalysis? analysis}) {
    return FileEntity(
      id: id,
      name: name,
      originalName: originalName,
      size: size,
      mimeType: mimeType,
      type: type,
      path: path,
      thumbnailUrl: thumbnailUrl,
      createdAt: createdAt,
      isBookmarked: isBookmarked ?? this.isBookmarked,
      analysis: analysis ?? this.analysis,
    );
  }

  @override
  List<Object?> get props => [id, name, size, type, isBookmarked, analysis];
}
