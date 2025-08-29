import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PhotoCarousel from "@/components/photo-carousel";
import { ArrowLeft, Edit, Trash2, Share2 } from "lucide-react";
import { type StoryWithPhotos } from "@shared/schema";
import { useEffect } from "react";

export default function StoryDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: story, isLoading: storyLoading, error } = useQuery<StoryWithPhotos>({
    queryKey: ["/api/stories", id],
    enabled: isAuthenticated && !!id,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const handleBack = () => {
    setLocation("/");
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

  if (isLoading || storyLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 story-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Story Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The story you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={handleBack} data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="text-foreground hover:bg-muted"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-share-story"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-accent"
                data-testid="button-edit-story"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                data-testid="button-delete-story"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Story Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="overflow-hidden border border-border">
          {/* Story Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-story-title">
                {story.title}
              </h1>
              <span className="text-muted-foreground" data-testid="text-story-date">
                {new Date(story.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    data-testid={`tag-${tag}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Photo Carousel */}
          {story.photos && story.photos.length > 0 && (
            <PhotoCarousel photos={story.photos} />
          )}

          {/* Story Content */}
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-story-content">
                {story.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
