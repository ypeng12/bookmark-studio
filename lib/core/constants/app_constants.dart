
class AppConstants {
  static const String dbName = 'gemini_lens.db';
  static const int dbVersion = 1;
  
  static const String tableFiles = 'files';
  static const String tableSearchCache = 'search_cache';
  
  static const int maxFileSize = 100 * 1024 * 1024; // 100MB
  
  static const String modelFlash = 'gemini-3-flash-preview';
  static const String modelPro = 'gemini-3-pro-preview';
}
