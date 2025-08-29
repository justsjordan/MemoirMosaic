import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import StatsOverview from "@/components/stats-overview";
import TagFilter from "@/components/tag-filter";
import StoryCard from "@/components/story-card";
import StoryModal from "@/components/story-modal";
import UploadModal from "@/components/upload-modal";
import { Button } from "@/components/ui/button";
import { Plus, Camera } from "lucide-react";
import { type StoryWithFirstPhoto } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Redirect to login if not authenticated
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

  const { data: stories, isLoading: storiesLoading, refetch: refetchStories } = useQuery<StoryWithFirstPhoto[]>({
    queryKey: ["/api/stories", search, selectedTags.join(",")],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const handleStoryClick = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    refetchStories();
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 story-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading your stories...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header 
        search={search}
        onSearchChange={setSearch}
        onNewStoryClick={() => setIsUploadModalOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <StatsOverview />
        
        <TagFilter 
          selectedTags={selectedTags}
          onTagClick={handleTagClick}
        />

        {/* Stories Gallery */}
        <div className="photo-grid">
          {storiesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <div className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-12 bg-muted rounded mb-3"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 w-16 bg-muted rounded-full"></div>
                    <div className="h-6 w-20 bg-muted rounded-full"></div>
                  </div>
                </div>
              </div>
            ))
          ) : stories?.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="text-muted-foreground w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">No Stories Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first photo story to get started!
              </p>
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
                className="story-gradient text-primary-foreground"
                data-testid="button-create-first-story"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Story
              </Button>
            </div>
          ) : (
            stories?.map((story: StoryWithFirstPhoto) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => handleStoryClick(story.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsUploadModalOpen(true)}
        className="fixed bottom-6 right-6 story-gradient w-14 h-14 rounded-full shadow-lg hover:shadow-xl z-40"
        data-testid="button-floating-new-story"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Modals */}
      {selectedStoryId && (
        <StoryModal
          storyId={selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
          onDelete={() => {
            setSelectedStoryId(null);
            refetchStories();
          }}
        />
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
