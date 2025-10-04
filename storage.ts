import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, and, isNull, desc } from "drizzle-orm";
import type { AuthSession, InsertRemovalHistory, RemovalHistory } from "@shared/schema";
import { removalHistory } from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  getSession(sessionId: string): Promise<AuthSession | undefined>;
  setSession(sessionId: string, session: AuthSession): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Removal history operations
  addRemovalHistory(entries: InsertRemovalHistory[]): Promise<void>;
  getRemovalHistory(userAccountId: string): Promise<RemovalHistory[]>;
  getRemovalHistoryById(id: number): Promise<RemovalHistory | undefined>;
  markAsRestored(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, AuthSession>;

  constructor() {
    this.sessions = new Map();
  }

  async getSession(sessionId: string): Promise<AuthSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async setSession(sessionId: string, session: AuthSession): Promise<void> {
    this.sessions.set(sessionId, session);
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async addRemovalHistory(entries: InsertRemovalHistory[]): Promise<void> {
    if (entries.length === 0) return;
    await db.insert(removalHistory).values(entries);
  }

  async getRemovalHistory(userAccountId: string): Promise<RemovalHistory[]> {
    return await db
      .select()
      .from(removalHistory)
      .where(eq(removalHistory.userAccountId, userAccountId))
      .orderBy(desc(removalHistory.removedAt));
  }

  async getRemovalHistoryById(id: number): Promise<RemovalHistory | undefined> {
    const results = await db
      .select()
      .from(removalHistory)
      .where(eq(removalHistory.id, id))
      .limit(1);
    return results[0];
  }

  async markAsRestored(id: number): Promise<void> {
    await db
      .update(removalHistory)
      .set({ restoredAt: new Date() })
      .where(eq(removalHistory.id, id));
  }
}

export const storage = new MemStorage();
