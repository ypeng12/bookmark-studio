
export const AppConstants = {
  db: {
    name: 'GeminiLensDB',
    version: 1,
    tables: {
      files: 'files',
      searchCache: 'search_cache'
    }
  },
  storage: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    thumbnailDir: 'thumbnails',
    mainDir: 'assets'
  },
  gemini: {
    models: {
      flash: 'gemini-3-flash-preview',
      pro: 'gemini-3-pro-preview',
      lite: 'gemini-flash-lite-latest'
    }
  }
};
