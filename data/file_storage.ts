
import { AppConstants } from '../core/constants';
import { FileStorageFailure, ValidationFailure } from '../core/errors';

export class FileStorageService {
  async validateFile(file: File): Promise<void> {
    if (file.size > AppConstants.storage.maxFileSize) {
      throw new ValidationFailure(`File size exceeds ${AppConstants.storage.maxFileSize / (1024 * 1024)}MB limit`);
    }
  }

  async getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(new FileStorageFailure('Error reading file'));
    });
  }

  createBlobUrl(base64: string, mimeType: string): string {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  }
}

export const fileStorageService = new FileStorageService();
