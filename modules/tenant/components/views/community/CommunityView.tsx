"use client";

import React from "react";
import { 
  MessageSquare, Heart, Send, Trash2, Plus, X, Shield, 
  Home, MapPin, Sparkles, Filter, Clock, User, Image as ImageIcon,
  ThumbsUp, Smile, CornerDownRight, AlertCircle, Eye, Upload, Video
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { ViewHeader } from "../../ViewHeader";
import useMe from "@/modules/auth/data/queries/useMe";
import { usePresignUrl } from "@/modules/landlord/data/mutations/useMediaActions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/ui/dialog";
import { 
  useCommunityPosts, 
  useCreatePost, 
  useDeletePost, 
  useCreateComment, 
  useDeleteComment, 
  useToggleReaction,
  CommunityPost 
} from "../../../hooks/useCommunity";

const CATEGORIES = [
  { id: "all", label: "Todo", icon: Filter, color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
  { id: "seguridad", label: "Seguridad", icon: Shield, color: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" },
  { id: "cuartos", label: "Cuartos/Alquiler", icon: Home, color: "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100" },
  { id: "lugares", label: "Lugares/Recomendaciones", icon: MapPin, color: "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" },
  { id: "general", label: "General/Otros", icon: MessageSquare, color: "bg-violet-50 text-violet-600 border border-violet-100 hover:bg-violet-100" }
];

const CATEGORY_THEMES: Record<string, {
  activeBg: string;
  activeText: string;
  activeBorder: string;
  hoverBg: string;
  hoverText: string;
  hoverBorder: string;
  iconActive: string;
  iconHover: string;
  iconUnselected: string;
}> = {
  all: {
    activeBg: "bg-creme-brulee",
    activeText: "text-white",
    activeBorder: "border-creme-brulee shadow-md shadow-creme-brulee/10",
    hoverBg: "hover:bg-emerald-50",
    hoverText: "hover:text-emerald-600",
    hoverBorder: "hover:border-emerald-200",
    iconActive: "text-white",
    iconHover: "group-hover:text-emerald-500",
    iconUnselected: "text-slate-400"
  },
  seguridad: {
    activeBg: "bg-creme-brulee",
    activeText: "text-white",
    activeBorder: "border-creme-brulee shadow-md shadow-creme-brulee/10",
    hoverBg: "hover:bg-emerald-50",
    hoverText: "hover:text-emerald-600",
    hoverBorder: "hover:border-emerald-200",
    iconActive: "text-white",
    iconHover: "group-hover:text-emerald-500",
    iconUnselected: "text-slate-400"
  },
  cuartos: {
    activeBg: "bg-creme-brulee",
    activeText: "text-white",
    activeBorder: "border-creme-brulee shadow-md shadow-creme-brulee/10",
    hoverBg: "hover:bg-emerald-50",
    hoverText: "hover:text-emerald-600",
    hoverBorder: "hover:border-emerald-200",
    iconActive: "text-white",
    iconHover: "group-hover:text-emerald-500",
    iconUnselected: "text-slate-400"
  },
  lugares: {
    activeBg: "bg-creme-brulee",
    activeText: "text-white",
    activeBorder: "border-creme-brulee shadow-md shadow-creme-brulee/10",
    hoverBg: "hover:bg-emerald-50",
    hoverText: "hover:text-emerald-600",
    hoverBorder: "hover:border-emerald-200",
    iconActive: "text-white",
    iconHover: "group-hover:text-emerald-500",
    iconUnselected: "text-slate-400"
  },
  general: {
    activeBg: "bg-creme-brulee",
    activeText: "text-white",
    activeBorder: "border-creme-brulee shadow-md shadow-creme-brulee/10",
    hoverBg: "hover:bg-emerald-50",
    hoverText: "hover:text-emerald-600",
    hoverBorder: "hover:border-emerald-200",
    iconActive: "text-white",
    iconHover: "group-hover:text-emerald-500",
    iconUnselected: "text-slate-400"
  }
};

export function CommunityView() {
  const { data: userData } = useMe();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [postToDelete, setPostToDelete] = React.useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = React.useState<string | null>(null);
  const [likedComments, setLikedComments] = React.useState<Record<string, { count: number; active: boolean }>>({});

  const handleToggleLikeComment = (commentId: string) => {
    setLikedComments(prev => {
      const current = prev[commentId] || { count: 0, active: false };
      return {
        ...prev,
        [commentId]: {
          count: current.active ? Math.max(0, current.count - 1) : current.count + 1,
          active: !current.active
        }
      };
    });
  };
  
  // Post Form State
  const [postTitle, setPostTitle] = React.useState("");
  const [postCategory, setPostCategory] = React.useState("general");
  const [postContent, setPostContent] = React.useState("");
  
  // File Upload State
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Comment Form States (indexed by postId)
  const [commentContents, setCommentContents] = React.useState<Record<string, string>>({});
  
  // Expanded comments section state (indexed by postId)
  const [expandedComments, setExpandedComments] = React.useState<Record<string, boolean>>({});

  // Query & Mutation Hooks
  const { data: posts, isLoading, refetch } = useCommunityPosts(selectedCategory);
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const toggleReactionMutation = useToggleReaction();
  const presignMutate = usePresignUrl();

  const currentUser = (userData as any)?.user ?? userData;
  const currentUserId = currentUser?.id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 25MB = 25 * 1024 * 1024 bytes
    const maxLimit = 25 * 1024 * 1024;
    if (file.size > maxLimit) {
      toast.error("El archivo supera el límite máximo de 25MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  React.useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    let finalImageUrl: string | undefined = undefined;

    if (selectedFile) {
      setIsUploadingFile(true);
      try {
        const contentType = selectedFile.type || 'image/jpeg';
        const presignData = await presignMutate.mutateAsync({
          folder: "community",
          contentType,
          filename: selectedFile.name.replace(/\.[^/.]+$/, ''),
        });

        const uploadResponse = await fetch(presignData.uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: { 'Content-Type': contentType },
        });

        if (!uploadResponse.ok) {
          throw new Error('Error al subir el archivo al servidor S3.');
        }

        finalImageUrl = presignData.resourceUrl;
      } catch (error: any) {
        toast.error(`Error al cargar el archivo: ${error?.message || String(error)}`);
        setIsUploadingFile(false);
        return;
      }
    }

    createPostMutation.mutate({
      title: postTitle,
      category: postCategory,
      content: postContent,
      imageUrl: finalImageUrl
    }, {
      onSuccess: () => {
        setPostTitle("");
        setPostCategory("general");
        setPostContent("");
        handleClearFile();
        setShowCreateModal(false);
        setIsUploadingFile(false);
      },
      onError: () => {
        setIsUploadingFile(false);
      }
    });
  };

  const handleCreateComment = (postId: string) => {
    const content = commentContents[postId];
    if (!content || !content.trim()) return;

    createCommentMutation.mutate({
      content,
      postId
    }, {
      onSuccess: () => {
        setCommentContents(prev => ({ ...prev, [postId]: "" }));
        // Auto expand comments if they were closed
        setExpandedComments(prev => ({ ...prev, [postId]: true }));
      }
    });
  };

  const handleToggleReaction = (postId: string, type: string) => {
    toggleReactionMutation.mutate({ postId, type });
  };

  const toggleCommentsExpansion = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Ajuste de +5h para corregir desfase y mostrar la hora peruana (UTC-5)
      date.setHours(date.getHours() + 5);
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "hace unos instantes";
      if (diffMins < 60) return `hace ${diffMins} min`;
      if (diffHours < 24) return `hace ${diffHours} h`;
      if (diffDays === 1) return "ayer";
      return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
    } catch {
      return "hace poco";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "seguridad": return "bg-red-50 text-red-600 border-red-100";
      case "cuartos": return "bg-blue-50 text-blue-600 border-blue-100";
      case "lugares": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default: return "bg-violet-50 text-violet-600 border-violet-100";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <ViewHeader
        title="Comunidad Estudiantil"
        description="Comparte recomendaciones de lugares, reportes de seguridad, dudas sobre cuartos e interactúa con otros estudiantes de TECSUP."
        action={
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-creme-brulee to-emerald-600 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Crear Publicación
          </Button>
        }
      />

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap gap-2 py-1 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          const theme = CATEGORY_THEMES[cat.id] || CATEGORY_THEMES.all;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm border group
                ${isActive 
                  ? `${theme.activeBg} ${theme.activeText} ${theme.activeBorder}` 
                  : `bg-white text-slate-600 border-slate-200 ${theme.hoverBg} ${theme.hoverText} ${theme.hoverBorder}`
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ${isActive ? theme.iconActive : `${theme.iconUnselected} ${theme.iconHover}`}`} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Create Post Dialog (Glassmorphism overlay style) */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        if (!open && !isUploadingFile) {
          setShowCreateModal(false);
          handleClearFile();
        }
      }}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl bg-white [&>button]:hidden max-h-[90vh] flex flex-col">
          <div className="p-6 bg-gradient-to-r from-inkwell to-slate-900 text-white flex justify-between items-center shrink-0">
            <div className="space-y-1">
              <DialogTitle className="font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-creme-brulee fill-creme-brulee" />
                Crear Nueva Publicación
              </DialogTitle>
              <DialogDescription className="text-xs text-au-lait">
                Comparte información útil para tus compañeros
              </DialogDescription>
            </div>
            <button 
              type="button"
              onClick={() => {
                if (!isUploadingFile) {
                  setShowCreateModal(false);
                  handleClearFile();
                }
              }}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              disabled={isUploadingFile}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmitPost} className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Título */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título del Artículo</label>
              <Input
                required
                placeholder="Ej. Recomendación de menú cerca del pabellón B, Alerta de luz rota..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="rounded-xl border-slate-200 focus-visible:ring-creme-brulee focus-visible:border-creme-brulee font-medium h-11"
                disabled={isUploadingFile}
              />
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría / Tema</label>
              <Select
                value={postCategory}
                onValueChange={setPostCategory}
                disabled={isUploadingFile}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 focus:ring-creme-brulee focus:border-transparent bg-white text-sm font-medium cursor-pointer">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-100 rounded-xl shadow-lg z-[110]">
                  <SelectItem value="general" className="cursor-pointer hover:bg-slate-50 py-2.5 rounded-lg text-sm font-medium">General / Otros</SelectItem>
                  <SelectItem value="seguridad" className="cursor-pointer hover:bg-slate-50 py-2.5 rounded-lg text-sm font-medium">Seguridad y Alertas</SelectItem>
                  <SelectItem value="cuartos" className="cursor-pointer hover:bg-slate-50 py-2.5 rounded-lg text-sm font-medium">Cuartos y Alquileres</SelectItem>
                  <SelectItem value="lugares" className="cursor-pointer hover:bg-slate-50 py-2.5 rounded-lg text-sm font-medium">Lugares y Recomendaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contenido / Descripción */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contenido / Descripción</label>
              <textarea
                required
                rows={4}
                placeholder="Escribe aquí los detalles del tema. Ej. Tiempos de atención, precios de cuartos, consejos..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-creme-brulee focus:border-transparent resize-none"
                disabled={isUploadingFile}
              />
            </div>

            {/* Image or Video Upload Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adjuntar Imagen o Video (Opcional - Máx. 25MB)</label>
              
              {!selectedFile ? (
                <div 
                  onClick={() => {
                    if (!isUploadingFile) fileInputRef.current?.click();
                  }}
                  className="border-2 border-dashed border-slate-200 hover:border-creme-brulee hover:bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="size-11 rounded-full bg-slate-50 group-hover:bg-creme-brulee/10 flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-creme-brulee" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700">Cargar imagen o video</p>
                    <p className="text-[10px] text-slate-400">Formatos soportados: PNG, JPG, MP4 (Máximo 25MB)</p>
                  </div>
                </div>
              ) : (
                <div className="relative border border-slate-200 rounded-2xl p-3 bg-slate-50/50 flex items-center gap-3">
                  <div className="size-14 rounded-lg overflow-hidden border bg-white flex items-center justify-center shrink-0">
                    {selectedFile.type.startsWith("video/") ? (
                      <Video className="w-6 h-6 text-slate-500" />
                    ) : (
                      <img src={filePreview || ""} className="w-full h-full object-cover" alt="Vista previa" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  {!isUploadingFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClearFile}
                      className="rounded-full size-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploadingFile}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCreateModal(false);
                  handleClearFile();
                }}
                className="rounded-xl px-5 h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 cursor-pointer"
                disabled={isUploadingFile}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createPostMutation.isPending || isUploadingFile}
                className="bg-creme-brulee hover:bg-emerald-700 active:scale-95 text-white rounded-xl px-6 h-11 text-xs font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all cursor-pointer flex items-center gap-2"
              >
                {isUploadingFile ? "Subiendo archivo..." : createPostMutation.isPending ? "Publicando..." : "Publicar Ahora"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feed List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border border-slate-100 rounded-3xl p-6 space-y-4">
              <div className="flex gap-4 items-center animate-pulse">
                <div className="size-11 rounded-full bg-slate-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-100 rounded-full w-40" />
                  <div className="h-3 bg-slate-100 rounded-full w-24" />
                </div>
              </div>
              <div className="h-5 bg-slate-100 rounded-full w-full animate-pulse" />
              <div className="h-20 bg-slate-100 rounded-2xl w-full animate-pulse" />
            </Card>
          ))}
        </div>
      ) : !posts || posts.length === 0 ? (
        <Card className="border border-dashed border-au-lait bg-white rounded-[2.5rem] p-16 text-center shadow-sm">
          <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-inkwell mb-2">No hay artículos publicados</h3>
          <p className="text-lunar-eclipse max-w-md mx-auto mb-6 text-sm">Sé el primero en compartir recomendaciones de seguridad, zonas tranquilas, o habitaciones baratas en la comunidad.</p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-creme-brulee hover:bg-emerald-700 hover:scale-105 active:scale-95 text-white rounded-xl px-6 h-11 text-xs font-black cursor-pointer shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all"
          >
            Crear Primera Publicación
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {posts.map((post: CommunityPost) => {
            const hasReacted = (type: string) => 
              post.reactions.some(r => r.userId === currentUserId && r.type === type);

            const commentContent = commentContents[post.id] || "";
            const isCommentsOpen = expandedComments[post.id] || false;

            const categoryInfo = CATEGORIES.find(c => c.id === post.category) || CATEGORIES[4];
            const CategoryIcon = categoryInfo.icon;
            const isVideoUrl = post.imageUrl && (
              post.imageUrl.toLowerCase().endsWith(".mp4") ||
              post.imageUrl.toLowerCase().endsWith(".webm") ||
              post.imageUrl.toLowerCase().endsWith(".mov") ||
              post.imageUrl.toLowerCase().endsWith(".ogg") ||
              post.imageUrl.includes("video")
            );

            return (
              <Card 
                key={post.id} 
                className="overflow-hidden border border-slate-200/60 rounded-[2rem] bg-white shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all duration-300"
              >
                <CardContent className="p-6 md:p-8 space-y-5">
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3.5 items-center">
                      <Avatar className="size-11 border-2 border-slate-100 shadow-sm shrink-0">
                        <AvatarImage src={post.author?.profilePicture ? (post.author.profilePicture.startsWith("data:") ? post.author.profilePicture : `data:image/jpeg;base64,${post.author.profilePicture}`) : undefined} className="object-cover" />
                        <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-creme-brulee/20 to-creme-brulee/40 text-creme-brulee">
                          {(post.author?.fullName || "E")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-inkwell text-sm truncate leading-snug">{post.author?.fullName || "Estudiante"}</span>
                          <Badge className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${getCategoryBadgeColor(post.category)}`}>
                            <CategoryIcon className="w-2.5 h-2.5" />
                            {categoryInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-lunar-eclipse/70 text-[10px] font-semibold mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{getRelativeTime(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete action if current user is the author */}
                    {post.authorId === currentUserId && (
                      <Button
                        variant="ghost"
                        onClick={() => setPostToDelete(post.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl size-9 p-0 flex items-center justify-center cursor-pointer transition-colors"
                        title="Eliminar publicación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="space-y-3.5">
                    <h4 className="font-semibold text-lg text-inkwell leading-snug tracking-tight">{post.title}</h4>
                    <p className="text-sm font-medium text-slate-600 whitespace-pre-line leading-relaxed">{post.content}</p>
                    
                    {/* Optional Post Media */}
                    {post.imageUrl && (
                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-50 border border-slate-100 max-h-[350px] flex items-center justify-center">
                        {isVideoUrl ? (
                          <video 
                            src={post.imageUrl} 
                            controls 
                            className="w-full h-full object-contain bg-slate-900" 
                          />
                        ) : (
                          <img 
                            src={post.imageUrl} 
                            className="w-full h-full object-cover" 
                            alt="Imagen adjunta" 
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Interactive Stats & Actions Bar */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-3">
                      {/* React: Thumbs Up */}
                      <button
                        onClick={() => handleToggleReaction(post.id, "like")}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer
                          ${hasReacted("like") 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 font-bold scale-105" 
                            : "bg-slate-50/50 hover:bg-slate-100 border-transparent"
                          }
                        `}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasReacted("like") ? "fill-emerald-500" : ""}`} />
                        <span>{post.reactions.filter(r => r.type === "like").length}</span>
                      </button>

                      {/* React: Heart */}
                      <button
                        onClick={() => handleToggleReaction(post.id, "love")}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer
                          ${hasReacted("love") 
                            ? "bg-red-50 text-red-600 border-red-100 font-bold scale-105" 
                            : "bg-slate-50/50 hover:bg-slate-100 border-transparent"
                          }
                        `}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasReacted("love") ? "fill-red-500" : ""}`} />
                        <span>{post.reactions.filter(r => r.type === "love").length}</span>
                      </button>

                      {/* React: Smile */}
                      <button
                        onClick={() => handleToggleReaction(post.id, "haha")}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer
                          ${hasReacted("haha") 
                            ? "bg-amber-50 text-amber-600 border-amber-100 font-bold scale-105" 
                            : "bg-slate-50/50 hover:bg-slate-100 border-transparent"
                          }
                        `}
                      >
                        <Smile className={`w-3.5 h-3.5 ${hasReacted("haha") ? "fill-amber-500" : ""}`} />
                        <span>{post.reactions.filter(r => r.type === "haha").length}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleCommentsExpansion(post.id)}
                      className={`
                        flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors cursor-pointer
                        ${isCommentsOpen ? "text-creme-brulee bg-creme-brulee/5 font-bold" : "hover:bg-slate-50"}
                      `}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments.length} comentarios</span>
                    </button>
                  </div>

                  {/* Comments Block */}
                  {isCommentsOpen && (
                    <div className="border-t border-slate-100 pt-5 space-y-4 animate-in slide-in-from-top-3 duration-200">
                      {/* Nested comments list */}
                      {post.comments.length > 0 && (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group/comment items-start">
                              <Avatar className="size-8 shadow-sm shrink-0 mt-0.5 border border-slate-100">
                                <AvatarImage src={comment.author?.profilePicture ? (comment.author.profilePicture.startsWith("data:") ? comment.author.profilePicture : `data:image/jpeg;base64,${comment.author.profilePicture}`) : undefined} className="object-cover" />
                                <AvatarFallback className="text-[9px] font-bold bg-slate-100 text-slate-500">
                                  {(comment.author?.fullName || "U")[0]}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 bg-slate-50 rounded-2xl p-3.5 relative min-w-0 border border-slate-100">
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex items-baseline gap-1.5 min-w-0 select-none">
                                    <span className="font-bold text-xs text-inkwell truncate leading-tight">{comment.author?.fullName || "Compañero"}</span>
                                    <span className="text-[9px] font-semibold text-slate-400/80 leading-none shrink-0">• {getRelativeTime(comment.createdAt)}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                                {/* Actions: Like & Delete grouped together at the right */}
                                <div className="flex gap-2 items-center justify-end text-[10px] font-bold text-slate-400 mt-2">
                                  <button
                                    onClick={() => handleToggleLikeComment(comment.id)}
                                    className={`flex items-center gap-0.5 hover:text-emerald-600 transition-colors cursor-pointer px-1 py-0.5 hover:bg-slate-100/50 rounded ${
                                      likedComments[comment.id]?.active ? "text-emerald-600 font-extrabold" : ""
                                    }`}
                                    title="Me gusta"
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${likedComments[comment.id]?.active ? "fill-emerald-500 text-emerald-600" : ""}`} />
                                    <span>{likedComments[comment.id]?.count ?? 0}</span>
                                  </button>

                                  {comment.authorId === currentUserId && (
                                    <button
                                      onClick={() => setCommentToDelete(comment.id)}
                                      className="text-slate-400 cursor-pointer flex items-center justify-center p-0.5 rounded"
                                      title="Eliminar comentario"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-3 items-center">
                        <Avatar className="size-8 shadow-sm shrink-0 border border-slate-100">
                          <AvatarImage src={currentUser?.profilePicture ? (currentUser.profilePicture.startsWith("data:") ? currentUser.profilePicture : `data:image/jpeg;base64,${currentUser.profilePicture}`) : undefined} className="object-cover" />
                          <AvatarFallback className="text-[9px] font-bold bg-creme-brulee/20 text-creme-brulee">
                            {(currentUser?.fullName || "Y")[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="relative flex-1">
                          <Input
                            placeholder="Escribe un comentario..."
                            value={commentContent}
                            onChange={(e) => setCommentContents(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateComment(post.id);
                              }
                            }}
                            className="rounded-full pr-11 border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white text-xs h-9"
                          />
                          <button
                            onClick={() => handleCreateComment(post.id)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 bg-creme-brulee text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm shadow-creme-brulee/15"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Deleting a Post */}
      <Dialog open={postToDelete !== null} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl z-[150] bg-white gap-0">
          <div className="p-6 pt-8 pb-4 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-inkwell mb-2">¿Eliminar publicación?</DialogTitle>
              <DialogDescription className="text-lunar-eclipse font-medium text-sm leading-relaxed">
                Esta acción no se puede deshacer. Se borrará permanentemente de la comunidad estudiantil.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-2.5">
            <Button
              variant="outline"
              onClick={() => setPostToDelete(null)}
              className="flex-1 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 border-slate-200 cursor-pointer h-10 text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (postToDelete) {
                  deletePostMutation.mutate(postToDelete, {
                    onSuccess: () => setPostToDelete(null)
                  });
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md shadow-red-200 cursor-pointer h-10 text-xs"
            >
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deleting a Comment */}
      <Dialog open={commentToDelete !== null} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl z-[150] bg-white gap-0">
          <div className="p-6 pt-8 pb-4 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-inkwell mb-2">¿Eliminar comentario?</DialogTitle>
              <DialogDescription className="text-lunar-eclipse font-medium text-sm leading-relaxed">
                Esta acción no se puede deshacer. Se borrará permanentemente tu comentario.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-2.5">
            <Button
              variant="outline"
              onClick={() => setCommentToDelete(null)}
              className="flex-1 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 border-slate-200 cursor-pointer h-10 text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (commentToDelete) {
                  deleteCommentMutation.mutate(commentToDelete, {
                    onSuccess: () => setCommentToDelete(null)
                  });
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md shadow-red-200 cursor-pointer h-10 text-xs"
            >
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
