import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertStorySchema, insertPhotoSchema } from "@shared/schema";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Ensure uploads directory exists
  const uploadsDir = path.resolve(process.cwd(), 'dist/public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded images
  app.use('/uploads', express.static(uploadsDir));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Story routes
  app.get("/api/stories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { search, tags } = req.query;
      
      let tagArray: string[] | undefined;
      if (tags) {
        tagArray = Array.isArray(tags) ? tags : tags.split(',');
      }

      const userStories = await storage.getStoriesByUser(userId, search as string, tagArray);
      res.json(userStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const story = await storage.getStoryById(id, userId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post("/api/stories", isAuthenticated, upload.array('photos', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, content, tags } = req.body;
      
      // Validate story data
      const storyData = insertStorySchema.parse({
        title,
        content,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      });

      // Create story
      const newStory = await storage.createStory(userId, storyData);

      // Process and save photos
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const photoData = await Promise.all(
          files.map(async (file, index) => {
            const filename = `${randomUUID()}.webp`;
            const filepath = path.join(uploadsDir, filename);
            
            // Process image with sharp
            await sharp(file.path)
              .resize(1200, 1200, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .webp({ quality: 85 })
              .toFile(filepath);

            // Clean up temp file
            fs.unlinkSync(file.path);

            return {
              url: `/uploads/${filename}`,
              caption: '',
              order: index,
            };
          })
        );

        await storage.addPhotosToStory(newStory.id, photoData);
      }

      const storyWithPhotos = await storage.getStoryById(newStory.id, userId);
      res.json(storyWithPhotos);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  app.patch("/api/stories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const storyData = insertStorySchema.partial().parse(req.body);
      if (storyData.tags && typeof storyData.tags === 'string') {
        storyData.tags = storyData.tags.split(',').map((tag: string) => tag.trim());
      }

      const updatedStory = await storage.updateStory(id, userId, storyData);
      if (!updatedStory) {
        return res.status(404).json({ message: "Story not found" });
      }

      const storyWithPhotos = await storage.getStoryById(id, userId);
      res.json(storyWithPhotos);
    } catch (error) {
      console.error("Error updating story:", error);
      res.status(500).json({ message: "Failed to update story" });
    }
  });

  app.delete("/api/stories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteStory(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  // Stats route
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
