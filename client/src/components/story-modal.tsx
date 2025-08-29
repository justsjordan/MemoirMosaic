import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PhotoCarousel from "./photo-carousel";
import { X, Edit, Trash2, Share2 } from "lucide-react";
import { type StoryWithPhotos } from "@shared/schema";

interface StoryModalProps {
  storyId: string;
  onClose: () => void;
  onDelete: () => void;
}

export default function StoryModal({ storyId, onClose, onDelete }: StoryModalProps) {
  const { toast } = useToast();

  const { data: story, isLoading } = useQuery<StoryWithPhotos>({
    queryKey: ["/api/stories", storyId],
    enabled: !!storyId,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/stories/${storyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Story deleted",
        description: "Your story has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onDelete();
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
        description: "Failed to delete story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title,
          text: story?.content,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Story link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-96 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground" data-testid="text-modal-story-title">
              {story.title}
            </h2>
            <p className="text-muted-foreground" data-testid="text-modal-story-date">
              {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Photo Carousel */}
        {story.photos && story.photos.length > 0 && (
          <PhotoCarousel photos={story.photos} />
        )}

        {/* Story Content */}
        <div className="p-6 max-h-60 overflow-y-auto">
          {story.tags && story.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    data-testid={`tag-modal-${tag}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="prose max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-modal-story-content">
              {story.content}
            </p>
          </div>

          {/* Story Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button 
              variant="ghost" 
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-share-modal"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Story
            </Button>
            
            <div className="flex space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-accent"
                data-testid="button-edit-modal"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                data-testid="button-delete-modal"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
