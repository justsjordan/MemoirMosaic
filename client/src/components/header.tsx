import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Search, Plus, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onNewStoryClick: () => void;
}

export default function Header({ search, onSearchChange, onNewStoryClick }: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 story-gradient rounded-full flex items-center justify-center">
              <Camera className="text-primary-foreground w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-foreground">My Stories</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            {!isMobile && (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search your stories..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-64 pl-10 pr-4 bg-muted border-border rounded-full focus:ring-ring"
                  data-testid="input-search"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
            )}
            
            {/* Mobile Search Toggle */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-toggle-search"
              >
                <Search className="w-4 h-4" />
              </Button>
            )}
            
            <Button 
              onClick={onNewStoryClick}
              className="story-gradient text-primary-foreground hover:opacity-90"
              data-testid="button-new-story"
            >
              <Plus className="w-4 h-4 mr-2" />
              {!isMobile && "New Story"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobile && showMobileSearch && (
          <div className="mt-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search your stories..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 bg-muted border-border rounded-full focus:ring-ring"
                data-testid="input-search-mobile"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
