import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Photo } from "@shared/schema";

interface PhotoCarouselProps {
  photos: Photo[];
}

export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) {
    return null;
  }

  const nextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative">
      <div className="carousel-container overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {photos.map((photo, index) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-96 object-cover flex-shrink-0"
              data-testid={`img-carousel-${index}`}
            />
          ))}
        </div>
      </div>
      
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={previousPhoto}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 hover:bg-black/70 disabled:opacity-50"
            data-testid="button-previous-photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextPhoto}
            disabled={currentIndex === photos.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 hover:bg-black/70 disabled:opacity-50"
            data-testid="button-next-photo"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Photo Counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          <span data-testid="text-photo-counter">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  );
}
