
import 'dart:convert';
import 'dart:typed_data';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../../../core/constants/app_constants.dart';
import '../../../domain/entities/file_entity.dart';

class GeminiApiClient {
  final String apiKey;

  GeminiApiClient(this.apiKey);

  Future<FileAnalysis> analyzeFile({
    required Uint8List fileBytes,
    required String mimeType,
    required FileType type,
    bool useDeepThinking = false,
  }) async {
    final modelName = useDeepThinking ? AppConstants.modelPro : AppConstants.modelFlash;
    final model = GenerativeModel(
      model: modelName,
      apiKey: apiKey,
      generationConfig: GenerationConfig(
        responseMimeType: 'application/json',
      ),
    );

    // 重点：要求模型输出详细的视觉特征描述，用于后续搜索相似照片
    final prompt = 'Analyze this image. Provide JSON output: {'
        '"summary": "concise description",'
        '"tags": ["list", "of", "tags"],'
        '"suggestedName": "new_name",'
        '"detectedObjects": ["objects"],'
        '"visualDescription": "Detailed visual description of colors, composition, and unique traits for similarity searching"'
        '}';

    final content = [
      Content.multi([
        DataPart(mimeType, fileBytes),
        TextPart(prompt),
      ])
    ];

    final response = await model.generateContent(content);
    final jsonResponse = jsonDecode(response.text ?? '{}');

    return FileAnalysis(
      summary: jsonResponse['summary'] ?? '',
      tags: List<String>.from(jsonResponse['tags'] ?? []),
      suggestedName: jsonResponse['suggestedName'] ?? '',
      detectedObjects: List<String>.from(jsonResponse['detectedObjects'] ?? []),
      visualDescription: jsonResponse['visualDescription'] ?? '',
      aiModelUsed: modelName,
      timestamp: DateTime.now(),
    );
  }

  // 相似性搜索函数：利用新照片和已有照片的描述进行对比
  Future<List<String>> findSimilar({
    required String targetVisualDescription,
    required List<Map<String, String>> existingContexts,
  }) async {
    final model = GenerativeModel(model: AppConstants.modelFlash, apiKey: apiKey);
    
    final contextStr = existingContexts.map((e) => "ID: ${e['id']}, Features: ${e['visualDescription']}").join("\n");
    
    final prompt = "Target Description: $targetVisualDescription\n\n"
        "Here is a list of existing photos:\n$contextStr\n\n"
        "Which of these IDs are most similar to the target? Return only a JSON array of IDs.";

    final response = await model.generateContent([Content.text(prompt)]);
    try {
      return List<String>.from(jsonDecode(response.text ?? '[]'));
    } catch (_) {
      return [];
    }
  }
}
