import { Card, CardContent } from "@/components/ui/card";
import { Images } from "lucide-react";
import { type StoryWithFirstPhoto } from "@shared/schema";

interface StoryCardProps {
  story: StoryWithFirstPhoto;
  onClick: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const formatDate = (date: string | Date) => {
    const now = new Date();
    const storyDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - storyDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card 
      className="bg-card rounded-xl overflow-hidden border border-border hover-scale cursor-pointer"
      onClick={onClick}
      data-testid={`story-card-${story.id}`}
    >
      {story.firstPhoto ? (
        <img 
          src={story.firstPhoto.url} 
          alt={story.title}
          className="w-full h-48 object-cover" 
          data-testid={`img-story-${story.id}`}
        />
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <Images className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground" data-testid={`text-story-date-${story.id}`}>
            {formatDate(story.createdAt!)}
          </span>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Images className="w-3 h-3" />
            <span className="text-xs" data-testid={`text-photo-count-${story.id}`}>
              {story.photoCount} photo{story.photoCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <h3 className="font-semibold text-foreground mb-2" data-testid={`text-story-title-${story.id}`}>
          {story.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-story-excerpt-${story.id}`}>
          {story.content}
        </p>
        
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {story.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                data-testid={`tag-${tag}-${story.id}`}
              >
                #{tag}
              </span>
            ))}
            {story.tags.length > 3 && (
              <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">
                +{story.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
