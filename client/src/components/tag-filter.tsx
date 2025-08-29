import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";

interface TagFilterProps {
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

export default function TagFilter({ selectedTags, onTagClick }: TagFilterProps) {
  const { data: stats } = useQuery<{ totalStories: number; totalPhotos: number; uniqueTags: string[] }>({
    queryKey: ["/api/stats"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const popularTags = stats?.uniqueTags?.slice(0, 6) || [];

  if (popularTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">Browse by Tags</h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Button
            key={tag}
            variant="outline"
            size="sm"
            onClick={() => onTagClick(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTags.includes(tag)
                ? "tag-pill text-accent-foreground border-transparent"
                : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
            }`}
            data-testid={`tag-filter-${tag}`}
          >
            #{tag}
          </Button>
        ))}
      </div>
    </div>
  );
}
