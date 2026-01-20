
import { GoogleGenAI, Type } from "@google/genai";
import { FileEntity, FileAnalysisEntity } from "../domain/entities";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeFile(file: FileEntity, base64Data: string): Promise<FileAnalysisEntity> {
    const modelName = 'gemini-3-flash-preview';
    
    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedName: { type: Type.STRING, description: "A creative and relevant title for the image" },
          detectedObjects: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualDescription: { type: Type.STRING },
          shouldBookmark: { 
            type: Type.BOOLEAN, 
            description: "Determine if this photo is high quality, visually striking, or personally significant enough to be automatically bookmarked." 
          }
        },
        required: ["summary", "tags", "suggestedName", "detectedObjects", "visualDescription", "shouldBookmark"]
      }
    };

    const prompt = `Analyze this ${file.type}. Determine if it's high quality or important. Suggest a beautiful title.`;

    const part = {
      inlineData: {
        mimeType: file.mimeType,
        data: base64Data
      }
    };

    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: { parts: [part, { text: prompt }] },
      config
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      ...result,
      aiModelUsed: modelName,
      timestamp: Date.now()
    };
  }
}

export const geminiService = new GeminiService();
