
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileImage, FileVideo, FileText, Trash2, BarChart3, 
  BrainCircuit, Loader2, Database, Heart, Camera, 
  Layers, Search, Info, Code, CheckCircle2
} from 'lucide-react';

import { appDatabase } from './data/database';
import { fileStorageService } from './data/file_storage';
import { geminiService } from './services/gemini';
import { FileEntity, FileType } from './domain/entities';
import { FileMapper } from './data/models';

const PLACEHOLDER_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', name: 'Mountain Mist' },
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', name: 'Forest Sunlight' },
  { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', name: 'Alpine Lake' }
];

const MetadataInspector: React.FC<{ files: FileEntity[] }> = ({ files }) => (
  <div className="bg-slate-900 text-slate-300 p-6 rounded-[32px] font-mono text-[10px] h-[500px] overflow-y-auto border border-slate-800 shadow-2xl">
    <div className="flex items-center gap-2 mb-4 text-blue-400 border-b border-slate-800 pb-2">
      <Code className="w-4 h-4" />
      <span className="font-bold uppercase tracking-widest">System Metadata Inspector</span>
    </div>
    {files.map(f => (
      <div key={f.id} className="mb-4 pb-4 border-b border-slate-800 last:border-0">
        <div className="text-white font-bold mb-1">ID: {f.id}</div>
        <div>Original: {f.originalName}</div>
        <div>Mime: {f.mimeType} | Size: {(f.size / 1024).toFixed(1)} KB</div>
        <div className="mt-2 text-blue-300">Analysis:</div>
        <pre className="mt-1 bg-black/30 p-2 rounded overflow-x-auto">
          {f.analysis ? JSON.stringify(f.analysis, null, 2) : '// Pending AI Analysis...'}
        </pre>
      </div>
    ))}
  </div>
);

const FileCard: React.FC<{ 
  file: FileEntity; 
  onDelete: (id: string) => void;
  isAnalyzing: boolean;
}> = ({ file, onDelete, isAnalyzing }) => {
  const Icon = file.type === 'image' ? FileImage : file.type === 'video' ? FileVideo : FileText;
  const displayName = file.analysis?.suggestedName || (isAnalyzing ? 'AI Thinking...' : file.name);

  return (
    <div className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 border-slate-200 hover:shadow-xl`}>
      <div className="aspect-[4/5] bg-slate-50 flex items-center justify-center overflow-hidden relative">
        {file.path.startsWith('http') || file.thumbnailUrl ? (
          <img src={file.path.startsWith('http') ? file.path : file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <Icon className="w-12 h-12 text-slate-200" />
        )}
        
        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AI Scanning</span>
            </div>
          </div>
        )}

        {/* AI Bookmark Indicator */}
        {file.isBookmarked && (
          <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" />
            <span className="text-[8px] font-bold pr-1">AI CHOICE</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-slate-800 truncate flex-1">{displayName}</h3>
          {file.analysis && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
        </div>
        
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-3">
           {new Date(file.createdAt).toLocaleDateString()}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
          {file.analysis?.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded-md font-bold">#{tag.toUpperCase()}</span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onDelete(file.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'files' | 'debug'>('files');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initData = async () => {
      await appDatabase.init();
      const models = await appDatabase.getAllFiles();
      let entities = models.map(FileMapper.toEntity).sort((a, b) => b.createdAt - a.createdAt);
      
      if (entities.length === 0) {
        // Initial setup with placeholders
        const placeholders: FileEntity[] = PLACEHOLDER_IMAGES.map((img, idx) => ({
          id: `demo-${idx}`,
          name: img.name,
          originalName: img.name,
          size: 1024 * 512,
          mimeType: 'image/jpeg',
          type: 'image',
          path: img.url,
          createdAt: Date.now() - (idx * 1000000),
          isBookmarked: false,
        }));
        for (const p of placeholders) {
          await appDatabase.saveFile(FileMapper.fromEntity(p));
        }
        entities = placeholders;
        // Auto analyze the new placeholders
        placeholders.forEach(p => handleAnalyze(p));
      }
      setFiles(entities);
    };
    initData();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const base64 = await fileStorageService.getBase64(file);
      const previewUrl = file.type.startsWith('image/') ? fileStorageService.createBlobUrl(base64, file.type) : undefined;
      
      const newEntity: FileEntity = {
        id: crypto.randomUUID(),
        name: file.name,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        type: file.type.startsWith('image/') ? 'image' : 'other',
        path: base64, // Store locally in IndexedDB
        thumbnailUrl: previewUrl,
        createdAt: Date.now(),
        isBookmarked: false,
      };

      await appDatabase.saveFile(FileMapper.fromEntity(newEntity));
      setFiles(prev => [newEntity, ...prev]);
      
      // TRIGGER AI ANALYSIS AUTOMATICALLY
      handleAnalyze(newEntity);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (file: FileEntity) => {
    if (analyzingIds.has(file.id)) return;
    setAnalyzingIds(prev => new Set(prev).add(file.id));
    
    try {
      const dataToAnalyze = file.path.startsWith('http') 
        ? await (await fetch(file.path)).blob().then(b => fileStorageService.getBase64(new File([b], 'p.jpg'))) 
        : file.path;
      
      const analysis = await geminiService.analyzeFile(file, dataToAnalyze);
      
      // Update with AI's decision on bookmarking and name
      const updatedEntity = { 
        ...file, 
        analysis, 
        isBookmarked: analysis.shouldBookmark, // AI decides this!
      };

      await appDatabase.saveFile(FileMapper.fromEntity(updatedEntity));
      setFiles(prev => prev.map(f => f.id === file.id ? updatedEntity : f));
    } catch (err) {
      console.error('Auto Analysis failed', err);
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(file.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    await appDatabase.deleteFile(id);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-24 lg:w-72 bg-white border-r border-slate-100 flex flex-col items-center py-10 sticky top-0 h-screen z-50">
        <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center mb-12 shadow-xl shadow-blue-100">
          <BrainCircuit className="text-white w-8 h-8" />
        </div>
        
        <div className="flex-1 flex flex-col gap-4 w-full px-6">
          <button onClick={() => setActiveTab('files')} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'files' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
            <FileImage className="w-6 h-6" />
            <span className="hidden lg:block font-bold text-sm">Photos Library</span>
          </button>
          
          <button onClick={() => setActiveTab('debug')} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'debug' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Code className="w-6 h-6" />
            <span className="hidden lg:block font-bold text-sm">Metadata Inspector</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8 md:p-14 overflow-y-auto">
        <header className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">GeminiLens Auto-Vault</h1>
            <p className="text-slate-400 font-medium">AI automatically analyzes, names, and bookmarks your memories.</p>
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading} 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-3 px-8 py-4 rounded-[24px] font-bold shadow-2xl shadow-blue-100 transition-all active:scale-95"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            <span>Capture Memory</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
        </header>

        {activeTab === 'files' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {files.map(file => (
              <FileCard 
                key={file.id} 
                file={file} 
                onDelete={handleDelete} 
                isAnalyzing={analyzingIds.has(file.id)} 
              />
            ))}
          </div>
        ) : (
          <MetadataInspector files={files} />
        )}
      </main>
    </div>
  );
};

export default App;
