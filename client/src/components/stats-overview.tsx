import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Images, Cloud, Tags } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<{ totalStories: number; totalPhotos: number; uniqueTags: string[] }>({
    queryKey: ["/api/stats"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border border-border animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border border-border hover-scale">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Images className="text-primary w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-stories">
                {stats?.totalStories || 0}
              </p>
              <p className="text-muted-foreground text-sm">Total Stories</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-border hover-scale">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Cloud className="text-accent w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-photos">
                {stats?.totalPhotos || 0}
              </p>
              <p className="text-muted-foreground text-sm">Photos Saved</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-border hover-scale">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
              <Tags className="text-secondary-foreground w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="text-unique-tags">
                {stats?.uniqueTags?.length || 0}
              </p>
              <p className="text-muted-foreground text-sm">Unique Tags</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
