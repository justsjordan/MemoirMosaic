import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient } from "@/lib/queryClient";
import { X, CloudUpload, Image as ImageIcon, Trash2 } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("tags", tags);
      
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch("/api/stories", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Story created!",
        description: "Your story has been successfully uploaded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      resetForm();
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags("");
    setSelectedFiles([]);
  };

  const handleClose = () => {
    if (!uploadMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const totalFiles = selectedFiles.length + newFiles.length;
    
    if (totalFiles > 10) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 10 photos per story.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your story.",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something about your story.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-y-auto">
        {/* Upload Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Create New Story</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-upload"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Photo Upload Area */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-foreground mb-2 block">Photos</Label>
            <div 
              className={`upload-area border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragOver ? "drag-over" : "border-border hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="story-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="text-primary-foreground w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Upload Your Photos</h3>
              <p className="text-muted-foreground mb-4">
                Drag & drop up to 10 photos or click to browse
              </p>
              <Button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="story-gradient text-primary-foreground hover:opacity-90"
                data-testid="button-choose-photos"
              >
                Choose Photos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                data-testid="input-file-upload"
              />
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  Selected Photos ({selectedFiles.length}/10)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-border"
                        data-testid={`img-preview-${index}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-remove-file-${index}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Story Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-foreground mb-2 block">
                Story Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Give your story a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted border-border focus:ring-ring"
                data-testid="input-story-title"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium text-foreground mb-2 block">
                Story Caption
              </Label>
              <Textarea
                id="content"
                rows={6}
                placeholder="Share your story... What made this moment special?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-muted border-border focus:ring-ring resize-none"
                data-testid="textarea-story-content"
              />
            </div>

            <div>
              <Label htmlFor="tags" className="text-sm font-medium text-foreground mb-2 block">
                Tags
              </Label>
              <Input
                id="tags"
                type="text"
                placeholder="Add tags separated by commas (e.g., travel, adventure, family)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-muted border-border focus:ring-ring"
                data-testid="input-story-tags"
              />
            </div>
          </div>

          {/* Upload Actions */}
          <div className="flex justify-end space-x-3 mt-8">
            <Button 
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={uploadMutation.isPending || !title.trim() || !content.trim()}
              className="story-gradient text-primary-foreground hover:opacity-90 disabled:opacity-50"
              data-testid="button-create-story"
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Story"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
