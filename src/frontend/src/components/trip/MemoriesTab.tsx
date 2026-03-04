import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  Image as ImageIcon,
  Images,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { MediaType } from "../../backend.d";
import type { Folder, MediaItem, Subfolder } from "../../backend.d";
import { useBlobStorage } from "../../hooks/useBlobStorage";
import {
  useCreateFolder,
  useCreateMediaItem,
  useCreateSubfolder,
  useDeleteFolder,
  useDeleteMediaItem,
  useDeleteSubfolder,
  useListFolders,
  useListMedia,
  useListSubfolders,
  useUpdateFolder,
  useUpdateSubfolder,
} from "../../hooks/useQueries";

interface SelectedNode {
  type: "folder" | "subfolder";
  id: string;
  name: string;
}

interface MemoriesTabProps {
  tripId: string;
}

export default function MemoriesTab({ tripId }: MemoriesTabProps) {
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 h-full min-h-[500px]">
      {/* Folder panel */}
      <div className="w-full md:w-64 lg:w-72 shrink-0">
        <div className="bg-card border border-border rounded-xl overflow-hidden h-full">
          <FolderPanel
            tripId={tripId}
            selectedNode={selectedNode}
            expandedFolders={expandedFolders}
            onSelect={setSelectedNode}
            onToggleFolder={toggleFolder}
          />
        </div>
      </div>

      {/* Media panel */}
      <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden">
        <MediaPanel
          selectedNode={selectedNode}
          onOpenLightbox={setLightboxItem}
        />
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// =================== FOLDER PANEL ===================
interface FolderPanelProps {
  tripId: string;
  selectedNode: SelectedNode | null;
  expandedFolders: Set<string>;
  onSelect: (node: SelectedNode) => void;
  onToggleFolder: (id: string) => void;
}

function FolderPanel({
  tripId,
  selectedNode,
  expandedFolders,
  onSelect,
  onToggleFolder,
}: FolderPanelProps) {
  const { data: folders, isLoading } = useListFolders(tripId);
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const id = crypto.randomUUID();
      await createFolder.mutateAsync({
        id,
        tripId,
        name: newFolderName.trim(),
      });
      setNewFolderName("");
      setCreatingFolder(false);
      toast.success("Folder created.");
    } catch {
      toast.error("Could not create folder.");
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !editFolderName.trim()) return;
    try {
      await updateFolder.mutateAsync({
        id: editingFolder.id,
        name: editFolderName.trim(),
        tripId,
      });
      setEditingFolder(null);
      toast.success("Folder renamed.");
    } catch {
      toast.error("Could not rename folder.");
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;
    try {
      await deleteFolder.mutateAsync({ id: deletingFolder.id, tripId });
      setDeletingFolder(null);
      toast.success("Folder deleted.");
    } catch {
      toast.error("Could not delete folder.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">Folders</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCreatingFolder(true)}
          data-ocid="folders.primary_button"
        >
          <FolderPlus className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-52px)] scrollbar-thin">
        <div className="p-2 space-y-0.5">
          {isLoading ? (
            ["sk1", "sk2", "sk3"].map((k) => (
              <Skeleton key={k} className="h-8 rounded-lg mx-1" />
            ))
          ) : !folders || folders.length === 0 ? (
            <div className="py-8 text-center px-4">
              <FolderIcon
                className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2"
                strokeWidth={1}
              />
              <p className="text-xs text-muted-foreground">No folders yet.</p>
              <Button
                variant="link"
                size="sm"
                className="text-xs h-7 mt-1 text-teal"
                onClick={() => setCreatingFolder(true)}
                data-ocid="folders.primary_button"
              >
                Create one
              </Button>
            </div>
          ) : (
            folders.map((folder, fi) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                index={fi + 1}
                tripId={tripId}
                isExpanded={expandedFolders.has(folder.id)}
                selectedNode={selectedNode}
                onToggle={() => onToggleFolder(folder.id)}
                onSelect={() => {
                  onSelect({
                    type: "folder",
                    id: folder.id,
                    name: folder.name,
                  });
                  if (!expandedFolders.has(folder.id))
                    onToggleFolder(folder.id);
                }}
                onEdit={() => {
                  setEditingFolder(folder);
                  setEditFolderName(folder.name);
                }}
                onDelete={() => setDeletingFolder(folder)}
                onSelectSubfolder={onSelect}
              />
            ))
          )}

          {/* Inline new folder input */}
          {creatingFolder && (
            <div className="px-1 pt-1">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") {
                    setCreatingFolder(false);
                    setNewFolderName("");
                  }
                }}
                className="h-8 text-sm"
                autoFocus
                data-ocid="folder.input"
              />
              <div className="flex gap-1 mt-1">
                <Button
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setCreatingFolder(false);
                    setNewFolderName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Rename folder dialog */}
      <Dialog
        open={!!editingFolder}
        onOpenChange={() => setEditingFolder(null)}
      >
        <DialogContent className="sm:max-w-xs" data-ocid="folder.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              Rename Folder
            </DialogTitle>
          </DialogHeader>
          <Input
            value={editFolderName}
            onChange={(e) => setEditFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingFolder(null)}
              data-ocid="folder.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameFolder}
              disabled={!editFolderName.trim()}
              data-ocid="folder.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete folder confirm */}
      <AlertDialog
        open={!!deletingFolder}
        onOpenChange={() => setDeletingFolder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deletingFolder?.name}&rdquo; will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="folder.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="folder.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// =================== FOLDER ROW ===================
interface FolderRowProps {
  folder: Folder;
  index: number;
  tripId: string;
  isExpanded: boolean;
  selectedNode: SelectedNode | null;
  onToggle: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelectSubfolder: (node: SelectedNode) => void;
}

function FolderRow({
  folder,
  index,
  isExpanded,
  selectedNode,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onSelectSubfolder,
}: FolderRowProps) {
  const { data: subfolders } = useListSubfolders(folder.id);
  const createSubfolder = useCreateSubfolder();
  const updateSubfolder = useUpdateSubfolder();
  const deleteSubfolder = useDeleteSubfolder();

  const [creatingSubfolder, setCreatingSubfolder] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [editingSub, setEditingSub] = useState<Subfolder | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [deletingSub, setDeletingSub] = useState<Subfolder | null>(null);
  const [hovered, setHovered] = useState(false);

  const isSelected =
    selectedNode?.type === "folder" && selectedNode.id === folder.id;

  const handleCreateSub = async () => {
    if (!newSubName.trim()) return;
    try {
      const id = crypto.randomUUID();
      await createSubfolder.mutateAsync({
        id,
        folderId: folder.id,
        name: newSubName.trim(),
      });
      setNewSubName("");
      setCreatingSubfolder(false);
      toast.success("Subfolder created.");
    } catch {
      toast.error("Could not create subfolder.");
    }
  };

  const handleRenameSub = async () => {
    if (!editingSub || !editSubName.trim()) return;
    try {
      await updateSubfolder.mutateAsync({
        id: editingSub.id,
        name: editSubName.trim(),
        folderId: folder.id,
      });
      setEditingSub(null);
      toast.success("Subfolder renamed.");
    } catch {
      toast.error("Could not rename subfolder.");
    }
  };

  const handleDeleteSub = async () => {
    if (!deletingSub) return;
    try {
      await deleteSubfolder.mutateAsync({
        id: deletingSub.id,
        folderId: folder.id,
      });
      setDeletingSub(null);
      toast.success("Subfolder deleted.");
    } catch {
      toast.error("Could not delete subfolder.");
    }
  };

  return (
    <>
      {/* Folder row */}
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer transition-colors",
          isSelected
            ? "bg-primary/10 text-primary"
            : "hover:bg-secondary/70 text-foreground",
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-ocid={`folder.item.${index}`}
      >
        <button
          type="button"
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
          onClick={() => {
            onToggle();
            onSelect();
          }}
          onKeyDown={(e) => e.key === "Enter" && onSelect()}
        >
          <span className="text-muted-foreground/70 w-3.5">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
          {isExpanded ? (
            <FolderOpen
              className="w-4 h-4 text-teal shrink-0"
              strokeWidth={1.5}
            />
          ) : (
            <FolderIcon
              className="w-4 h-4 text-teal shrink-0"
              strokeWidth={1.5}
            />
          )}
          <span className="text-sm truncate">{folder.name}</span>
        </button>
        <div
          className={cn(
            "flex items-center gap-0.5 transition-opacity",
            hovered ? "opacity-100" : "opacity-0",
          )}
        >
          <button
            type="button"
            className="p-1 rounded hover:bg-secondary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCreatingSubfolder(true);
            }}
            title="Add subfolder"
            data-ocid="subfolder.primary_button"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-secondary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Rename"
            data-ocid={`folder.edit_button.${index}`}
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-secondary transition-colors text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
            data-ocid={`folder.delete_button.${index}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Subfolders */}
      {isExpanded && (
        <div className="ml-5 space-y-0.5">
          {subfolders?.map((sub, si) => (
            <SubfolderRow
              key={sub.id}
              subfolder={sub}
              index={si + 1}
              isSelected={
                selectedNode?.type === "subfolder" && selectedNode.id === sub.id
              }
              onSelect={() =>
                onSelectSubfolder({
                  type: "subfolder",
                  id: sub.id,
                  name: sub.name,
                })
              }
              onEdit={() => {
                setEditingSub(sub);
                setEditSubName(sub.name);
              }}
              onDelete={() => setDeletingSub(sub)}
            />
          ))}

          {creatingSubfolder && (
            <div className="px-1 pt-1 pb-1">
              <Input
                placeholder="Subfolder name"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateSub();
                  if (e.key === "Escape") {
                    setCreatingSubfolder(false);
                    setNewSubName("");
                  }
                }}
                className="h-7 text-xs"
                autoFocus
                data-ocid="subfolder.input"
              />
              <div className="flex gap-1 mt-1">
                <Button
                  size="sm"
                  className="h-6 text-xs flex-1 px-2"
                  onClick={handleCreateSub}
                  disabled={!newSubName.trim()}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={() => {
                    setCreatingSubfolder(false);
                    setNewSubName("");
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rename subfolder dialog */}
      <Dialog open={!!editingSub} onOpenChange={() => setEditingSub(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              Rename Subfolder
            </DialogTitle>
          </DialogHeader>
          <Input
            value={editSubName}
            onChange={(e) => setEditSubName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSub()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSub(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSub} disabled={!editSubName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete subfolder confirm */}
      <AlertDialog
        open={!!deletingSub}
        onOpenChange={() => setDeletingSub(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subfolder?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deletingSub?.name}&rdquo; will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSub}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// =================== SUBFOLDER ROW ===================
interface SubfolderRowProps {
  subfolder: Subfolder;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SubfolderRow({
  subfolder,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: SubfolderRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "group w-full flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer transition-colors text-left",
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-secondary/70 text-foreground",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid={`subfolder.item.${index}`}
      onClick={onSelect}
    >
      <FolderIcon
        className="w-3.5 h-3.5 shrink-0 text-muted-foreground"
        strokeWidth={1.5}
      />
      <span className="text-xs truncate flex-1">{subfolder.name}</span>
      <div
        className={cn(
          "flex items-center gap-0.5 transition-opacity",
          hovered ? "opacity-100" : "opacity-0",
        )}
      >
        <button
          type="button"
          className="p-1 rounded hover:bg-secondary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          data-ocid={`subfolder.edit_button.${index}`}
        >
          <Pencil className="w-2.5 h-2.5" />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-secondary transition-colors text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          data-ocid={`subfolder.delete_button.${index}`}
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </div>
    </button>
  );
}

// =================== MEDIA PANEL ===================
interface MediaPanelProps {
  selectedNode: SelectedNode | null;
  onOpenLightbox: (item: MediaItem) => void;
}

function MediaPanel({ selectedNode, onOpenLightbox }: MediaPanelProps) {
  const { data: mediaItems, isLoading } = useListMedia(
    selectedNode?.type ?? "",
    selectedNode?.id ?? "",
  );
  const createMediaItem = useCreateMediaItem();
  const deleteMediaItem = useDeleteMediaItem();
  const { upload, uploading, progress } = useBlobStorage();

  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!selectedNode) {
        toast.error("Select a folder first.");
        return;
      }
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        try {
          const { blobId } = await upload(file);
          const mediaType = file.type.startsWith("video/")
            ? MediaType.video
            : MediaType.image;
          const id = crypto.randomUUID();
          await createMediaItem.mutateAsync({
            id,
            parentType: selectedNode.type,
            parentId: selectedNode.id,
            blobId,
            fileName: file.name,
            mediaType,
          });
          toast.success(`${file.name} uploaded.`);
        } catch {
          toast.error(`Failed to upload ${file.name}.`);
        }
      }
    },
    [selectedNode, upload, createMediaItem],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteMedia = async () => {
    if (!deletingMedia || !selectedNode) return;
    try {
      await deleteMediaItem.mutateAsync({
        id: deletingMedia.id,
        parentType: selectedNode.type,
        parentId: selectedNode.id,
      });
      setDeletingMedia(null);
      toast.success("Deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  };

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
        <FolderOpen
          className="w-12 h-12 text-muted-foreground/20 mb-4"
          strokeWidth={1}
        />
        <p className="text-muted-foreground text-sm">
          Select a folder or subfolder to view and upload media.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Media header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen
            className="w-4 h-4 text-teal shrink-0"
            strokeWidth={1.5}
          />
          <span className="text-sm font-medium truncate">
            {selectedNode.name}
          </span>
        </div>
        <label className="cursor-pointer" data-ocid="media.upload_button">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleInputChange}
            disabled={uploading}
          />
          <Button
            size="sm"
            className="gap-1.5 pointer-events-none"
            disabled={uploading}
            asChild
          >
            <span>
              <Upload className="w-3.5 h-3.5" />
              Upload
            </span>
          </Button>
        </label>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div
          className="px-4 py-2 border-b border-border"
          data-ocid="media.loading_state"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1.5">
            <Upload className="w-3.5 h-3.5 animate-pulse" />
            <span>Uploading... {progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Drop zone + grid */}
      <div
        className={cn(
          "flex-1 overflow-auto p-4 transition-colors",
          isDragOver && "bg-primary/5",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        data-ocid="media.dropzone"
      >
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <Skeleton key={k} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : !mediaItems || mediaItems.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full min-h-[200px] text-center"
            data-ocid="media.empty_state"
          >
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-10 transition-colors",
                isDragOver ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <Images
                className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3"
                strokeWidth={1}
              />
              <p className="text-sm text-muted-foreground mb-1">
                No media yet.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Drag & drop or use the Upload button.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {mediaItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group relative aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer"
                  data-ocid={`media.item.${idx + 1}`}
                  onClick={() => onOpenLightbox(item)}
                  onKeyDown={(e) => e.key === "Enter" && onOpenLightbox(item)}
                  tabIndex={0}
                >
                  <MediaThumbnail item={item} />
                  {/* Delete button */}
                  <button
                    type="button"
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingMedia(item);
                    }}
                    data-ocid={`media.delete_button.${idx + 1}`}
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                  {/* Video indicator */}
                  {item.mediaType === MediaType.video && (
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 rounded px-1.5 py-0.5 flex items-center gap-1">
                      <Video className="w-3 h-3 text-white" />
                      <span className="text-white text-xs">Video</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete media confirm */}
      <AlertDialog
        open={!!deletingMedia}
        onOpenChange={() => setDeletingMedia(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete media?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deletingMedia?.fileName}&rdquo; will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="media.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMedia}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="media.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =================== MEDIA THUMBNAIL ===================
function MediaThumbnail({ item }: { item: MediaItem }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const { getDirectUrl } = useBlobStorage();

  // Fetch URL once
  useState(() => {
    if (item.blobId) {
      getDirectUrl(item.blobId)
        .then(setUrl)
        .catch(() => setError(true));
    }
  });

  if (error || !url) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {item.mediaType === MediaType.video ? (
          <Video className="w-8 h-8 text-muted-foreground/40" strokeWidth={1} />
        ) : (
          <ImageIcon
            className="w-8 h-8 text-muted-foreground/40"
            strokeWidth={1}
          />
        )}
      </div>
    );
  }

  if (item.mediaType === MediaType.video) {
    return (
      <video
        src={url}
        className="w-full h-full object-cover"
        muted
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={url}
      alt={item.fileName}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

// =================== LIGHTBOX ===================
interface LightboxProps {
  item: MediaItem;
  onClose: () => void;
}

function Lightbox({ item, onClose }: LightboxProps) {
  const [url, setUrl] = useState<string | null>(null);
  const { getDirectUrl } = useBlobStorage();

  useState(() => {
    if (item.blobId) {
      getDirectUrl(item.blobId)
        .then(setUrl)
        .catch(() => {});
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-label="Media preview"
      data-ocid="media.modal"
    >
      <button
        type="button"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
        data-ocid="media.close_button"
      >
        <X className="w-5 h-5" />
      </button>
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="max-w-4xl max-h-[85vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {url ? (
          item.mediaType === MediaType.video ? (
            // biome-ignore lint/a11y/useMediaCaption: user-uploaded video, captions not applicable
            <video
              src={url}
              controls
              className="max-w-full max-h-[80vh] rounded-xl"
              autoPlay
            />
          ) : (
            <img
              src={url}
              alt={item.fileName}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          )
        ) : (
          <div className="w-64 h-64 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-white/30" strokeWidth={1} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 rounded-b-xl px-4 py-2">
          <p className="text-white text-sm truncate">{item.fileName}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
