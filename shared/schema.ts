import { z } from "zod";
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const deviceCodeSchema = z.object({
  device_code: z.string(),
  verification_uri: z.string(),
  verification_uri_complete: z.string(),
  user_code: z.string(),
  expires_in: z.number(),
  interval: z.number(),
});

export const authSessionSchema = z.object({
  account_id: z.string(),
  access_token: z.string(),
  display_name: z.string(),
  expires_at: z.number(),
});

export const epicFriendSchema = z.object({
  accountId: z.string(),
  displayName: z.string(),
  alias: z.string().optional(),
  status: z.string().optional(),
  favorite: z.boolean().optional(),
  created: z.string().optional(),
});

export const friendsSummarySchema = z.object({
  friends: z.array(epicFriendSchema),
  incoming: z.array(z.any()).optional(),
  outgoing: z.array(z.any()).optional(),
  suggested: z.array(z.any()).optional(),
  blocklist: z.array(z.any()).optional(),
});

export const removeFriendsRequestSchema = z.object({
  friendIds: z.array(z.string()).min(1),
});

export const restoreFriendRequestSchema = z.object({
  friendId: z.string(),
});

export type FriendsSummary = z.infer<typeof friendsSummarySchema>;
export type RemoveFriendsRequest = z.infer<typeof removeFriendsRequestSchema>;
export type RestoreFriendRequest = z.infer<typeof restoreFriendRequestSchema>;

// Example Drizzle table (optional) — kept minimal so migrations can reference shared/schema
export const removalHistory = pgTable("removal_history", {
  id: text("id").primaryKey(),
  account_id: text("account_id").notNull(),
  friend_id: text("friend_id").notNull(),
  removed_at: timestamp("removed_at").defaultNow(),
});

export const insertRemovalHistorySchema = createInsertSchema(removalHistory);