import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { epicGamesClient } from "./epic-games-client";
import { randomUUID } from "crypto";
import { z } from "zod";
import { removeFriendsRequestSchema } from "@shared/schema";

const SESSION_COOKIE_NAME = "epic_session_id";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/device-code", async (req: Request, res: Response) => {
    try {
      const clientToken = await epicGamesClient.getClientToken();
      const deviceCode = await epicGamesClient.createDeviceCode(clientToken);
      
      res.json(deviceCode);
    } catch (error) {
      console.error("Device code error:", error);
      res.status(500).json({ error: "Failed to generate device code" });
    }
  });

  app.post("/api/auth/verify", async (req: Request, res: Response) => {
    try {
      const { device_code } = req.body;
      
      if (!device_code) {
        return res.status(400).json({ error: "Device code is required" });
      }

      const verifyData = await epicGamesClient.verifyDeviceCode(device_code);
      
      const sessionId = randomUUID();
      const session = {
        account_id: verifyData.account_id,
        access_token: verifyData.access_token,
        display_name: verifyData.displayName,
        expires_at: Date.now() + verifyData.expires_in * 1000,
      };

      await storage.setSession(sessionId, session);

      res.cookie(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: verifyData.expires_in * 1000,
      });

      res.json(session);
    } catch (error) {
      if (error instanceof Error && error.message === "PENDING") {
        return res.status(400).json({ error: "Authorization pending" });
      }
      console.error("Verify error:", error);
      res.status(500).json({ error: "Failed to verify device code" });
    }
  });

  app.get("/api/friends", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies[SESSION_COOKIE_NAME];
      
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: "Session not found" });
      }

      if (Date.now() > session.expires_at) {
        await storage.deleteSession(sessionId);
        return res.status(401).json({ error: "Session expired" });
      }

      const friends = await epicGamesClient.getFriends(
        session.account_id,
        session.access_token
      );

      res.json(friends);
    } catch (error) {
      console.error("Get friends error:", error);
      res.status(500).json({ error: "Failed to fetch friends" });
    }
  });

  app.delete("/api/friends/remove", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies[SESSION_COOKIE_NAME];
      
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: "Session not found" });
      }

      if (Date.now() > session.expires_at) {
        await storage.deleteSession(sessionId);
        return res.status(401).json({ error: "Session expired" });
      }

      const validation = removeFriendsRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { friendIds } = validation.data;

      const removePromises = friendIds.map((friendId) =>
        epicGamesClient.removeFriend(
          session.account_id,
          friendId,
          session.access_token
        )
      );

      await Promise.all(removePromises);

      res.json({ success: true, removed: friendIds.length });
    } catch (error) {
      console.error("Remove friends error:", error);
      res.status(500).json({ error: "Failed to remove friends" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies[SESSION_COOKIE_NAME];
      
      if (sessionId) {
        const session = await storage.getSession(sessionId);
        
        if (session) {
          await epicGamesClient.killSession(session.access_token);
          await storage.deleteSession(sessionId);
        }
      }

      res.clearCookie(SESSION_COOKIE_NAME);
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
