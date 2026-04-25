"use client";
import React, { useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Upload, Folder, Image as ImageIcon, Video, Search, FolderPlus, Camera, Grid3X3, List, Eye, Download, Trash2, X, Info } from "lucide-react";
import { useMediaFolders, useMyFiles, useFilesByFolder, MediaFolder, MediaFile } from "@/modules/landlord/data/queries/useMedia";
import { useCreateFolder, useDeleteFolder, useCreateFileRecord, useDeleteFile, usePresignUrl } from "@/modules/landlord/data/mutations/useMediaActions";
import useDebouncedValue from "@/modules/shared/hooks/useDebouncedValue";
import { toast } from "sonner";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { LoadingSpinner } from "@/modules/shared/components/LoadingSkeleton";

interface FilesManagerProps {
  onViewChange: (view: string) => void;
}

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

const getMediaType = (contentType: string): "image" | "video" | "avatar" => {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  return 'image';
};

const isTour360 = (filename: string, type: string): boolean => {
  const lower = filename.toLowerCase();
  const keywords = ['360', 'tour', 'equirectangular', 'panorama', 'panoramic', 'vr', 'virtual'];
  return keywords.some(keyword => lower.includes(keyword));
};

export function FilesManager({ onViewChange }: FilesManagerProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
    const [deleteFolderDialog, setDeleteFolderDialog] = useState<{ open: boolean; folderId: string | null; folderName: string }>({
    open: false,
    folderId: null,
    folderName: '',
  });
  const [deleteFileDialog, setDeleteFileDialog] = useState<{ open: boolean; fileId: string | null; fileName: string }>({
    open: false,
    fileId: null,
    fileName: '',
  });

  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const { data: foldersData, isLoading: foldersLoading } = useMediaFolders();
  const { data: allFilesForCount } = useMyFiles();
  const { data: folderFilesData } = useFilesByFolder(selectedFolderId);
  const createFolderMutate = useCreateFolder();
  const deleteFolderMutate = useDeleteFolder();
  const createFileMutate = useCreateFileRecord();
  const deleteFileMutate = useDeleteFile();
  const presignMutate = usePresignUrl();
  const folders = useMemo(() => {
    if (!foldersData) return [];
    const filesForCount = allFilesForCount || [];
    return foldersData.map((f: MediaFolder) => {
      const filesInFolder = filesForCount.filter((file: MediaFile) => {
        const fileFolderId = (file as any).folder_id || (file as any).folderId;
        return fileFolderId === f.id;
      });
      const tours = filesInFolder.filter((file: MediaFile) => isTour360(file.filename, file.type));
      const images = filesInFolder.filter((file: MediaFile) => file.type === 'image' && !isTour360(file.filename, file.type)).length;
      const tourCount = tours.length;
      return {
        id: f.id,
        name: f.name || f.path?.split("/").pop() || "Carpeta",
        path: f.path,
        fileCount: images,
        tourCount: tourCount,
      };
    });
  }, [foldersData, allFilesForCount]);

  const files = useMemo(() => {
    if (!selectedFolderId) return [];
    
    const source = folderFilesData;
    if (!source) return [];
    return source.map((f: MediaFile) => {
      const baseType = f.type || 'image';
      const displayType = isTour360(f.filename, baseType) ? 'tour360' : baseType;
      return {
        id: f.id,
        name: f.filename,
        type: baseType,
        displayType,
        folderId: f.folder_id,
        uploadDate: f.createdAt ? new Date(f.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '',
        thumbnail: baseType === 'image' ? f.url : '',
        url: f.url,
        contentType: f.contentType || 'image/jpeg',
      };
    });
  }, [selectedFolderId, folderFilesData]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = !debouncedSearch || file.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType = !filterType || file.displayType === filterType;
      return matchesSearch && matchesType;
    });
  }, [files, debouncedSearch, filterType]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    const sanitizedName = newFolderName.trim().toLowerCase().replace(/\s+/g, '-');
    const path = sanitizedName;
    createFolderMutate.mutate(
      { name: newFolderName.trim(), path },
      {
        onSuccess: () => {
          setIsCreateFolderOpen(false);
          setNewFolderName('');
        },
      }
    );
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setDeleteFolderDialog({ open: true, folderId, folderName });
  };

  const confirmDeleteFolder = () => {
    if (!deleteFolderDialog.folderId) return;
    deleteFolderMutate.mutate(deleteFolderDialog.folderId);
    if (selectedFolderId === deleteFolderDialog.folderId) setSelectedFolderId(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`;
    setUploadingFiles(prev => new Set(prev).add(fileId));

    try {
      const folderPath = selectedFolderId
        ? folders.find(f => f.id === selectedFolderId)?.path || ''
        : '';
      
      const contentType = file.type || 'image/jpeg';
      const presignData = await presignMutate.mutateAsync({
        folder: folderPath,
        contentType,
        filename: file.name.replace(/\.[^/.]+$/, ''),
      });

      const uploadResponse = await fetch(presignData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': contentType },
      });

      if (!uploadResponse.ok) {
        await uploadResponse.text().catch(() => 'Error desconocido');
        throw new Error('Error al subir a S3. Verifica la configuración de CORS del bucket.');
      }

      const mediaType = getMediaType(contentType);
      await createFileMutate.mutateAsync(
        {
          filename: file.name,
          url: presignData.resourceUrl,
          s3Key: presignData.key,
          contentType,
          type: mediaType,
          folderId: selectedFolderId || undefined,
        },
      );

      const is360 = isTour360(file.name, contentType);
      toast.success(`"${file.name}" subido`, {
        description: is360 ? "Archivo detectado como tour 360° automáticamente" : undefined,
        duration: is360 ? 5000 : 3000,
      });
    } catch (error: any) {
      const message = error?.message || 'Error desconocido';
      if (message.includes('CORS') || message.includes('403')) {
        toast.error('Error de configuración: El bucket S3 necesita CORS configurado para localhost:3000');
      } else {
        toast.error(`Error: ${message}`);
      }
    } finally {
      setUploadingFiles(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    setDeleteFileDialog({ open: true, fileId, fileName });
  };

  const confirmDeleteFile = () => {
    if (!deleteFileDialog.fileId) return;
    deleteFileMutate.mutate(deleteFileDialog.fileId);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isUploading = uploadingFiles.size > 0;
  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  if (foldersLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      
      <div className="shrink-0 space-y-6">
        <div className="flex items-start justify-between gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-au-lait/50">
          <div className="flex items-center gap-3 flex-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-inkwell mb-1">Archivos</h1>
              <p className="text-sm sm:text-base text-lunar-eclipse">
                {selectedFolder 
                  ? `Carpeta: ${selectedFolder.name} • ${filteredFiles.length} archivo${filteredFiles.length !== 1 ? 's' : ''}`
                  : `${folders.length} carpeta${folders.length !== 1 ? 's' : ''} disponible${folders.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateFolderOpen(true)}
              className="gap-2 cursor-pointer border-au-lait text-inkwell hover:bg-au-lait/50"
            >
              <FolderPlus className="w-4 h-4" />
              Nueva Carpeta
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Subiendo...' : 'Subir'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-semibold mb-1">Detección automática de tours 360°</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Los archivos se detectan automáticamente como tours 360° si su nombre contiene palabras clave como: <span className="font-semibold">360, tour, panorama, equirectangular, vr</span> o <span className="font-semibold">virtual</span>. También puedes marcarlos manualmente al crear o editar una propiedad.
              </p>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={filterType === null ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType(null)}
              className="h-7 px-3 text-xs"
            >
              Todos
            </Button>
            <Button
              variant={filterType === 'image' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('image')}
              className="h-7 px-3 text-xs"
            >
              Imágenes
            </Button>
            <Button
              variant={filterType === 'tour360' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('tour360')}
              className="h-7 px-3 text-xs"
            >
              360°
            </Button>
          </div>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-7 w-7 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 w-7 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sección de carpetas - tipo Google Drive */}
      <div className="shrink-0 py-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-800">Carpetas</h3>
            {foldersLoading && <LoadingSpinner size="sm" />}
          </div>
          {folders.length > 0 && (
            <span className="text-xs text-gray-500 font-medium">{folders.length} carpeta{folders.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        {foldersLoading ? (
          <div className="flex gap-2">
            <div className="h-20 w-36 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-20 w-36 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
              <Folder className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No hay carpetas</p>
            <p className="text-xs text-gray-500 mb-4">Organiza tus archivos creando carpetas</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateFolderOpen(true)}
              className="gap-2 bg-white"
            >
              <FolderPlus className="w-3 h-3" />
              Crear carpeta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className={`cursor-pointer hover:shadow-md transition-all relative group border-0 shadow-sm ${
                  selectedFolderId === folder.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      selectedFolderId === folder.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-white text-yellow-500 shadow-sm'
                    }`}>
                      <Folder className="w-5 h-5 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <p className="font-medium text-sm truncate mb-1 text-gray-700" title={folder.name}>
                        {folder.name}
                      </p>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {folder.fileCount + folder.tourCount} archivos
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-400 hover:text-red-600 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id, folder.name);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sección de archivos - área principal */}
      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {!selectedFolderId ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Selecciona una carpeta</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              Elige una carpeta de arriba para ver su contenido o crea una nueva para empezar a organizar
            </p>
            <Button
              size="sm"
              onClick={() => setIsCreateFolderOpen(true)}
              className="gap-2 bg-white text-gray-700 border hover:bg-gray-50 shadow-sm"
            >
              <FolderPlus className="w-4 h-4" />
              Nueva Carpeta
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFolderId(null)}
                  className="h-8 text-xs gap-1 hover:bg-gray-100"
                >
                  ← Volver
                </Button>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-gray-700 font-medium text-sm">
                    <Folder className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                    {selectedFolder?.name}
                  </div>
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
                    {filteredFiles.length} archivos
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Subiendo...' : 'Subir archivos'}
              </Button>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Carpeta vacía</p>
                <p className="text-xs text-gray-500 mb-4">Sube archivos para empezar a llenar esta carpeta</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 bg-white"
                >
                  <Upload className="w-4 h-4" />
                  Subir archivos
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow group border-0 shadow-sm bg-white">
                <div className="relative aspect-square bg-gray-100">
                  {file.displayType === 'tour360' ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ) : file.displayType === 'video' ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <Video className="w-8 h-8 text-white/80" />
                    </div>
                  ) : (
                    <img
                      src={file.thumbnail || file.url}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E';
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md ${
                      file.displayType === 'tour360' ? 'bg-white/90 text-purple-700' : 
                      file.displayType === 'video' ? 'bg-black/50 text-white' : 
                      'bg-black/50 text-white'
                    }`}>
                      {file.displayType === 'tour360' ? '360°' : file.displayType === 'video' ? 'VIDEO' : 'IMG'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 shadow-lg"
                      onClick={() => window.open(file.url, '_blank')}
                      title="Ver"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-green-600 shadow-lg"
                      onClick={() => handleDownload(file.url, file.name)}
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 shadow-lg"
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-medium text-gray-700 truncate mb-1" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{file.uploadDate}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100">
                      {file.displayType === 'tour360' ? (
                        <Camera className="w-5 h-5 text-purple-600" />
                      ) : file.displayType === 'video' ? (
                        <Video className="w-5 h-5 text-gray-600" />
                      ) : (
                        <img 
                          src={file.url} 
                          className="w-full h-full object-cover rounded-lg"
                          alt="" 
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                        <Badge variant="secondary" className="text-[10px] h-5 font-normal">
                          {file.displayType === 'tour360' ? 'Tour 360°' : file.displayType === 'video' ? 'Video' : 'Imagen'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">Subido el {file.uploadDate}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-green-600"
                        onClick={() => handleDownload(file.url, file.name)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </>
        )}
      </div>

      {/* Dialog crear carpeta */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Carpeta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ej: Habitación 101"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || createFolderMutate.isPending}
            >
              {createFolderMutate.isPending ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteFolderDialog.open}
        onOpenChange={(open) => setDeleteFolderDialog({ ...deleteFolderDialog, open })}
        title="¿Eliminar carpeta?"
        description={`¿Estás seguro de que deseas eliminar la carpeta "${deleteFolderDialog.folderName}"? Esta acción eliminará todos los archivos dentro de la carpeta y no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteFolder}
        isLoading={deleteFolderMutate.isPending}
      />
      <ConfirmDialog
        open={deleteFileDialog.open}
        onOpenChange={(open) => setDeleteFileDialog({ ...deleteFileDialog, open })}
        title="¿Eliminar archivo?"
        description={`¿Estás seguro de que deseas eliminar "${deleteFileDialog.fileName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteFile}
        isLoading={deleteFileMutate.isPending}
      />
    </div>
  );
}
