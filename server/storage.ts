import {
  users,
  stories,
  photos,
  type User,
  type UpsertUser,
  type Story,
  type InsertStory,
  type Photo,
  type InsertPhoto,
  type StoryWithPhotos,
  type StoryWithFirstPhoto,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Story operations
  createStory(userId: string, story: InsertStory): Promise<Story>;
  getStoriesByUser(userId: string, search?: string, tags?: string[]): Promise<StoryWithFirstPhoto[]>;
  getStoryById(id: string, userId: string): Promise<StoryWithPhotos | undefined>;
  updateStory(id: string, userId: string, story: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: string, userId: string): Promise<boolean>;
  
  // Photo operations
  addPhotosToStory(storyId: string, photoData: InsertPhoto[]): Promise<Photo[]>;
  deletePhoto(id: string, userId: string): Promise<boolean>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    totalStories: number;
    totalPhotos: number;
    uniqueTags: string[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Story operations
  async createStory(userId: string, story: InsertStory): Promise<Story> {
    const [newStory] = await db
      .insert(stories)
      .values({ ...story, userId })
      .returning();
    return newStory;
  }

  async getStoriesByUser(userId: string, search?: string, tags?: string[]): Promise<StoryWithFirstPhoto[]> {
    let query = db
      .select({
        id: stories.id,
        userId: stories.userId,
        title: stories.title,
        content: stories.content,
        tags: stories.tags,
        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
        firstPhoto: photos,
        photoCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${photos} 
          WHERE ${photos.storyId} = ${stories.id}
        )`,
      })
      .from(stories)
      .leftJoin(photos, and(
        eq(photos.storyId, stories.id),
        eq(photos.order, 0)
      ))
      .where(eq(stories.userId, userId));

    if (search) {
      query = query.where(
        and(
          eq(stories.userId, userId),
          or(
            ilike(stories.title, `%${search}%`),
            ilike(stories.content, `%${search}%`)
          )
        )
      );
    }

    if (tags && tags.length > 0) {
      query = query.where(
        and(
          eq(stories.userId, userId),
          sql`${stories.tags} && ${tags}`
        )
      );
    }

    const results = await query.orderBy(desc(stories.createdAt));

    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      title: row.title,
      content: row.content,
      tags: row.tags,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      firstPhoto: row.firstPhoto || undefined,
      photoCount: row.photoCount,
    }));
  }

  async getStoryById(id: string, userId: string): Promise<StoryWithPhotos | undefined> {
    const [story] = await db
      .select()
      .from(stories)
      .where(and(eq(stories.id, id), eq(stories.userId, userId)));

    if (!story) return undefined;

    const storyPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.storyId, id))
      .orderBy(asc(photos.order));

    return {
      ...story,
      photos: storyPhotos,
    };
  }

  async updateStory(id: string, userId: string, storyData: Partial<InsertStory>): Promise<Story | undefined> {
    const [updatedStory] = await db
      .update(stories)
      .set({ ...storyData, updatedAt: new Date() })
      .where(and(eq(stories.id, id), eq(stories.userId, userId)))
      .returning();
    return updatedStory;
  }

  async deleteStory(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(stories)
      .where(and(eq(stories.id, id), eq(stories.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Photo operations
  async addPhotosToStory(storyId: string, photoData: InsertPhoto[]): Promise<Photo[]> {
    if (photoData.length === 0) return [];
    
    const newPhotos = await db
      .insert(photos)
      .values(photoData.map((photo, index) => ({
        ...photo,
        storyId,
        order: index,
      })))
      .returning();
    return newPhotos;
  }

  async deletePhoto(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(photos)
      .where(and(
        eq(photos.id, id),
        sql`${photos.storyId} IN (
          SELECT ${stories.id} 
          FROM ${stories} 
          WHERE ${stories.userId} = ${userId}
        )`
      ));
    return (result.rowCount || 0) > 0;
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    totalStories: number;
    totalPhotos: number;
    uniqueTags: string[];
  }> {
    // Get total stories
    const [{ count: totalStories }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(stories)
      .where(eq(stories.userId, userId));

    // Get total photos
    const [{ count: totalPhotos }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(photos)
      .leftJoin(stories, eq(photos.storyId, stories.id))
      .where(eq(stories.userId, userId));

    // Get unique tags
    const tagResults = await db
      .select({ tags: stories.tags })
      .from(stories)
      .where(eq(stories.userId, userId));

    const uniqueTagsSet = new Set<string>();
    tagResults.forEach(row => {
      if (row.tags) {
        row.tags.forEach(tag => uniqueTagsSet.add(tag));
      }
    });

    return {
      totalStories,
      totalPhotos,
      uniqueTags: Array.from(uniqueTagsSet),
    };
  }
}

export const storage = new DatabaseStorage();
