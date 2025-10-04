const TIMEOUT_IN_SECONDS = 10;
const CLIENT_ID = process.env.EPIC_CLIENT_ID || "98f7e42c2e3a4f86a74eb43fbb41ed39";
const CLIENT_SECRET = process.env.EPIC_CLIENT_SECRET || "0a2449a2-001a-451e-afec-3e812901c4d7";
const CLIENT_BASE64 = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface DeviceCodeResponse {
  device_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  user_code: string;
  expires_in: number;
  interval: number;
}

interface VerifyResponse {
  access_token: string;
  account_id: string;
  displayName: string;
  expires_in: number;
}

interface Friend {
  accountId: string;
  displayName: string;
  alias?: string;
  status?: string;
  favorite?: boolean;
  created?: string;
}

interface FriendsSummary {
  friends: Friend[];
  incoming?: any[];
  outgoing?: any[];
  suggested?: any[];
  blocklist?: any[];
}

export class EpicGamesClient {
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_IN_SECONDS * 1000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  async getClientToken(): Promise<string> {
    const response = await this.fetchWithTimeout(
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
      {
        method: "POST",
        headers: {
          Authorization: `basic ${CLIENT_BASE64}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to get client token:", response.status, errorText);
      throw new Error(`Failed to get client token: ${response.status}`);
    }

    const data = await response.json() as TokenResponse;
    return data.access_token;
  }

  async createDeviceCode(clientToken: string): Promise<DeviceCodeResponse> {
    const response = await this.fetchWithTimeout(
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/deviceAuthorization",
      {
        method: "POST",
        headers: {
          Authorization: `bearer ${clientToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create device code:", response.status, errorText);
      throw new Error(`Failed to create device code: ${response.status}`);
    }

    return await response.json() as DeviceCodeResponse;
  }

  async verifyDeviceCode(deviceCode: string): Promise<VerifyResponse> {
    const response = await this.fetchWithTimeout(
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
      {
        method: "POST",
        headers: {
          Authorization: `basic ${CLIENT_BASE64}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "device_code",
          device_code: deviceCode,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("PENDING");
      }
      throw new Error("Failed to verify device code");
    }

    return await response.json() as VerifyResponse;
  }

  async getFriends(accountId: string, accessToken: string): Promise<FriendsSummary> {
    const response = await this.fetchWithTimeout(
      `https://friends-public-service-prod.ol.epicgames.com/friends/api/v1/${accountId}/summary`,
      {
        method: "GET",
        headers: {
          Authorization: `bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get friends");
    }

    return await response.json() as FriendsSummary;
  }

  async removeFriend(accountId: string, friendId: string, accessToken: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      `https://friends-public-service-prod.ol.epicgames.com/friends/api/v1/${accountId}/friends/${friendId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to remove friend ${friendId}`);
    }
  }

  async killSession(accessToken: string): Promise<void> {
    try {
      await this.fetchWithTimeout(
        `https://account-public-service-prod.ol.epicgames.com/account/api/oauth/sessions/kill/${accessToken}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to kill session:", error);
    }
  }
}

export const epicGamesClient = new EpicGamesClient();
