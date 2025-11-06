"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import { 
  Upload, 
  Folder, 
  Image as ImageIcon, 
  Video,
  Search,
  FolderPlus,
  Camera,
  Grid3X3,
  List,
  Filter,
  Eye,
  Download,
  Trash2,
} from "lucide-react";

interface FilesManagerProps {
  onViewChange: (view: string) => void;
}

const folders = [
  { id: 1, name: "Habitación Principal", fileCount: 8, tourCount: 1 },
  { id: 2, name: "Cocina Compartida", fileCount: 5, tourCount: 1 },
  { id: 3, name: "Baño Privado", fileCount: 3, tourCount: 0 },
  { id: 4, name: "Áreas Comunes", fileCount: 6, tourCount: 1 }
];

const files = [
  {
    id: 1,
    name: "habitacion-principal-1.jpg",
    type: "image",
    folder: "Habitación Principal",
    size: "2.4 MB",
    uploadDate: "2024-01-15",
    thumbnail: "https://images.unsplash.com/photo-1611234688667-76b6d8fadd75?auto=format&w=300&q=80"
  },
  {
    id: 2,
    name: "habitacion-principal-2.jpg",
    type: "image",
    folder: "Habitación Principal",
    size: "1.8 MB",
    uploadDate: "2024-01-15",
    thumbnail: "https://images.unsplash.com/photo-1721274505817-e3ccb4fc6390?auto=format&w=300&q=80"
  },
  {
    id: 3,
    name: "tour-360-habitacion.mp4",
    type: "tour360",
    folder: "Habitación Principal",
    size: "45.2 MB",
    uploadDate: "2024-01-14",
    thumbnail: ""
  },
  {
    id: 4,
    name: "cocina-vista-general.jpg",
    type: "image",
    folder: "Cocina Compartida",
    size: "2.1 MB",
    uploadDate: "2024-01-13",
    thumbnail: "https://images.unsplash.com/photo-1571474039046-42bc4e7f4b98?auto=format&w=300&q=80"
  }
];

const typeColor = (type: string) => {
  switch (type) {
    case 'image':
      return 'bg-blue-100 text-blue-700';
    case 'tour360':
      return 'bg-purple-100 text-purple-700';
    case 'video':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function FilesManager({ onViewChange }: FilesManagerProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredFiles = files.filter(file => 
    (!selectedFolder || file.folder === selectedFolder) &&
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1>Mis Archivos</h1>
          <p className="text-lunar-eclipse">Gestiona tus fotos y tours 360° organizados por cuarto</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />
            Nueva Carpeta
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center gap-2"
            onClick={handleFileUpload}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Subiendo...' : 'Subir Archivos'}
          </Button>
        </div>
      </div>

      {/* Dropzone */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Arrastra archivos aquí o haz clic para subir</h3>
            <p className="text-sm text-blue-700 mb-4">Soporta: JPG, PNG, MP4, archivos 360° (hasta 50MB por archivo)</p>
            <div className="flex justify-center gap-4 text-xs text-blue-600">
              <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" />Fotos</span>
              <span className="flex items-center gap-1"><Camera className="w-3 h-3" />Tours 360°</span>
              <span className="flex items-center gap-1"><Video className="w-3 h-3" />Videos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search/filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h2 className="mb-4">Carpetas por Cuarto</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <Card 
              key={folder.id} 
              className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedFolder === folder.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
              onClick={() => setSelectedFolder(selectedFolder === folder.name ? null : folder.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{folder.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{folder.fileCount} fotos</Badge>
                      {folder.tourCount > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">{folder.tourCount} tour 360°</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2>
            {selectedFolder ? `Archivos en "${selectedFolder}"` : 'Todos los archivos'}
            <span className="text-gray-500 ml-2">({filteredFiles.length})</span>
          </h2>
          {selectedFolder && (
            <Button variant="outline" size="sm" onClick={() => setSelectedFolder(null)}>Ver todos</Button>
          )}
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  {file.type === 'tour360' ? (
                    <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  ) : (
                    <img src={file.thumbnail} alt={file.name} className="w-full h-32 object-cover" />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={`${typeColor(file.type)} text-xs`}>
                      {file.type === 'tour360' ? '360°' : 'IMG'}
                    </Badge>
                  </div>

                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20"><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20"><Download className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">{file.size}</p>
                    <p className="text-xs text-gray-500">{file.uploadDate}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {file.type === 'tour360' ? <Camera className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{file.folder}</p>
                    </div>
                    <Badge className={typeColor(file.type)}>
                      {file.type === 'tour360' ? 'Tour 360°' : 'Imagen'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
