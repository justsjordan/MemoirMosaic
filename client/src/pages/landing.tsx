import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Heart, Shield, Smartphone } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 story-gradient rounded-full flex items-center justify-center">
                <Camera className="text-primary-foreground w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-foreground">My Stories</h1>
            </div>
            <Button 
              onClick={handleLogin}
              className="story-gradient text-primary-foreground hover:opacity-90"
              data-testid="button-login"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="w-24 h-24 story-gradient rounded-full flex items-center justify-center mx-auto mb-8">
            <Camera className="text-primary-foreground w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Your Personal Photo Journal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create beautiful photo stories, preserve your memories, and access them from anywhere. 
            Completely private, unlimited uploads, no restrictions.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="story-gradient text-primary-foreground text-lg px-8 py-4 hover:opacity-90"
            data-testid="button-get-started"
          >
            Start Your Story Collection
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center border border-border hover-scale">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Unlimited Photos</h3>
              <p className="text-muted-foreground text-sm">
                Upload up to 10 photos per story with no storage limits
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border border-border hover-scale">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-accent w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Beautiful Stories</h3>
              <p className="text-muted-foreground text-sm">
                Write detailed captions and organize with custom tags
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border border-border hover-scale">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-secondary-foreground w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Completely Private</h3>
              <p className="text-muted-foreground text-sm">
                Your photos and stories are yours alone, no sharing required
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border border-border hover-scale">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Access Anywhere</h3>
              <p className="text-muted-foreground text-sm">
                Sync across all your devices, optimized for mobile
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border border-border">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands who trust their memories with our secure, private photo journal
              </p>
              <Button 
                onClick={handleLogin}
                size="lg"
                className="story-gradient text-primary-foreground hover:opacity-90"
                data-testid="button-join-now"
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
