
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../../core/constants/app_constants.dart';

class AppDatabase {
  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDb();
    return _database!;
  }

  Future<Database> _initDb() async {
    String path = join(await getDatabasesPath(), AppConstants.dbName);
    return await openDatabase(
      path,
      version: AppConstants.dbVersion,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE ${AppConstants.tableFiles} (
            id TEXT PRIMARY KEY,
            name TEXT,
            originalName TEXT,
            size INTEGER,
            mimeType TEXT,
            type TEXT,
            path TEXT,
            thumbnailUrl TEXT,
            createdAt INTEGER,
            isBookmarked INTEGER DEFAULT 0,
            analysis TEXT
          )
        ''');
        
        await db.execute('''
          CREATE TABLE ${AppConstants.tableSearchCache} (
            query TEXT PRIMARY KEY,
            results TEXT,
            timestamp INTEGER
          )
        ''');
        
        await db.execute('CREATE INDEX idx_files_type ON ${AppConstants.tableFiles}(type)');
        await db.execute('CREATE INDEX idx_files_created ON ${AppConstants.tableFiles}(createdAt)');
        await db.execute('CREATE INDEX idx_files_bookmark ON ${AppConstants.tableFiles}(isBookmarked)');
      },
    );
  }
}
