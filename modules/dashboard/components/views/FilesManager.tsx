"use client";
import React, { useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Upload, Folder, Image as ImageIcon, Video, Search, FolderPlus, Camera, Grid3X3, List, Eye, Download, Trash2, X } from "lucide-react";
import { useMediaFolders, useMyFiles, useFilesByFolder, MediaFolder, MediaFile } from "@/modules/dashboard/data/queries/useMedia";
import { useCreateFolder, useDeleteFolder, useCreateFileRecord, useDeleteFile, usePresignUrl } from "@/modules/dashboard/data/mutations/useMediaActions";
import useDebouncedValue from "@/modules/dashboard/hooks/useDebouncedValue";
import { toast } from "sonner";
import { ConfirmDialog } from "../components";

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
  if (type !== 'video') return false;
  const lower = filename.toLowerCase();
  return lower.includes('360') || lower.includes('tour');
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
      const images = filesInFolder.filter((file: MediaFile) => file.type === 'image').length;
      const tours = filesInFolder.filter((file: MediaFile) => isTour360(file.filename, file.type)).length;
      return {
        id: f.id,
        name: f.name || f.path?.split("/").pop() || "Carpeta",
        path: f.path,
        fileCount: images,
        tourCount: tours,
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
    const path = `folders/${sanitizedName}`;
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
        ? folders.find(f => f.id === selectedFolderId)?.path || 'folders'
        : 'folders';
      
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
        const errorText = await uploadResponse.text().catch(() => 'Error desconocido');
        console.error('S3 Upload Error:', errorText);
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

      toast.success(`"${file.name}" subido`);
    } catch (error: any) {
      console.error('Upload error:', error);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header fijo */}
      <div className="flex-shrink-0 space-y-3 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Archivos</h1>
            <p className="text-sm text-gray-500 mt-1">
              {selectedFolder 
                ? `Carpeta: ${selectedFolder.name} • ${filteredFiles.length} archivo${filteredFiles.length !== 1 ? 's' : ''}`
                : `${folders.length} carpeta${folders.length !== 1 ? 's' : ''} disponible${folders.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateFolderOpen(true)}
              className="gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Nueva Carpeta
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
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
      <div className="flex-shrink-0 py-3 border-b bg-gray-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">Carpetas</h3>
            {foldersLoading && <span className="text-xs text-gray-400 ml-2">Cargando...</span>}
          </div>
          {folders.length > 0 && (
            <span className="text-xs text-gray-500 font-medium">{folders.length} carpeta{folders.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        {foldersLoading ? (
          <div className="flex gap-2">
            <div className="h-20 w-36 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-20 w-36 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-white">
            <Folder className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">No hay carpetas creadas</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateFolderOpen(true)}
              className="gap-2"
            >
              <FolderPlus className="w-3 h-3" />
              Crear primera carpeta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className={`cursor-pointer hover:shadow-lg transition-all relative group ${
                  selectedFolderId === folder.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedFolderId === folder.id
                        ? 'bg-blue-500'
                        : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    }`}>
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <p className="font-semibold text-sm truncate mb-1" title={folder.name}>
                        {folder.name}
                      </p>
                      <div className="flex items-center justify-center gap-1.5">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {folder.fileCount + folder.tourCount} {folder.fileCount + folder.tourCount === 1 ? 'archivo' : 'archivos'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id, folder.name);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sección de archivos - área principal */}
      <div className="flex-1 overflow-y-auto pt-4">
        {!selectedFolderId ? (
          <div className="flex items-center justify-center h-full">
            <Card className="border-dashed max-w-md w-full">
              <CardContent className="p-12 text-center">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Selecciona una carpeta</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Elige una carpeta de arriba para ver sus archivos o crea una nueva carpeta
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  Crear carpeta
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFolderId(null)}
                  className="h-8 text-xs gap-1"
                >
                  ← Volver
                </Button>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFolder?.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {filteredFiles.length} {filteredFiles.length === 1 ? 'archivo' : 'archivos'}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Subiendo...' : 'Subir archivos'}
              </Button>
            </div>

            {filteredFiles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No hay archivos en esta carpeta</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Subir archivos
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative aspect-square">
                  {file.displayType === 'tour360' ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  ) : file.displayType === 'video' ? (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                  ) : (
                    <img
                      src={file.thumbnail || file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                      }}
                    />
                  )}
                  <div className="absolute top-1 right-1">
                    <Badge className={`${typeColor(file.displayType)} text-xs px-1.5 py-0`}>
                      {file.displayType === 'tour360' ? '360°' : file.displayType === 'video' ? 'VID' : 'IMG'}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      onClick={() => handleDownload(file.url, file.name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      onClick={() => handleDeleteFile(file.id, file.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{file.uploadDate}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 group">
                    <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
                      {file.displayType === 'tour360' ? (
                        <Camera className="w-5 h-5 text-purple-600" />
                      ) : file.displayType === 'video' ? (
                        <Video className="w-5 h-5 text-green-600" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.uploadDate}</p>
                    </div>
                    <Badge className={`${typeColor(file.displayType)} text-xs`}>
                      {file.displayType === 'tour360' ? '360°' : file.displayType === 'video' ? 'Video' : 'Imagen'}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(file.url, file.name)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
