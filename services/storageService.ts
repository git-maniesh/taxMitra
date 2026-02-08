
import { User, CAProfile, DirectMessage, Conversation, Review } from '../types';

/**
 * Production Storage Service
 * Communicates with the Node.js / MongoDB backend via REST API.
 */

class StorageService {
  private async apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`API Route not found (404). Check if server.js is running and routes are prefixed with /api.`);
        }
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (err) {
      console.error(`[Storage] Fetch failed for ${endpoint}:`, err);
      throw err;
    }
  }

  async init() {
    try {
      const health = await this.apiFetch<{status: string, database: string}>('/health');
      console.log(`[Storage] Backend connected: ${health.status}, DB: ${health.database}`);
    } catch (e) {
      console.error('[Storage] FAILED to connect to backend. Ensure "npm run server" is active.');
    }
  }

  // USERS COLLECTION
  async findUsers(): Promise<User[]> {
    return this.apiFetch<User[]>('/users');
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.findUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.apiFetch<User>(`/users/${id}`);
  }

  async updateOneUser(userId: string, update: Partial<User>): Promise<User | undefined> {
    return this.apiFetch<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  }

  async insertOneUser(user: User): Promise<User> {
    return this.apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  // PROFILES COLLECTION
  async findProfiles(): Promise<CAProfile[]> {
    return this.apiFetch<CAProfile[]>('/profiles');
  }

  async findProfileById(id: string): Promise<CAProfile | undefined> {
    return this.apiFetch<CAProfile>(`/profiles/${id}`);
  }

  async findProfileByUserId(userId: string): Promise<CAProfile | undefined> {
    const profiles = await this.findProfiles();
    return profiles.find(p => p.userId === userId);
  }

  async updateOneProfile(profileId: string, update: Partial<CAProfile>): Promise<CAProfile | undefined> {
    return this.apiFetch<CAProfile>(`/profiles/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  }

  async insertOneProfile(profile: CAProfile): Promise<CAProfile> {
    return this.apiFetch<CAProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // MESSAGES COLLECTION
  async findMessagesByUserId(userId: string): Promise<DirectMessage[]> {
    return this.apiFetch<DirectMessage[]>(`/messages/${userId}`);
  }

  async insertOneMessage(message: DirectMessage): Promise<DirectMessage> {
    return this.apiFetch<DirectMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async markMessagesAsRead(userId: string, contactId: string): Promise<void> {
    await this.apiFetch('/messages/read', {
      method: 'PATCH',
      body: JSON.stringify({ userId, contactId }),
    });
  }

  // REVIEWS COLLECTION
  async findReviewsByProfileId(profileId: string): Promise<Review[]> {
    return this.apiFetch<Review[]>(`/reviews/${profileId}`);
  }

  // GEOLOCATION
  async getNearbyProfiles(lat: number, lon: number): Promise<(CAProfile & { distance?: number })[]> {
    return this.apiFetch<CAProfile[]>(`/nearby?lat=${lat}&lon=${lon}`);
  }

  // AGGREGATION
  async getConversations(userId: string): Promise<Conversation[]> {
    const messages = await this.findMessagesByUserId(userId);
    const users = await this.findUsers();
    const convoMap = new Map<string, Conversation>();

    messages.forEach(m => {
      const contactId = m.senderId === userId ? m.receiverId : m.senderId;
      if (!convoMap.has(contactId)) {
        const contactUser = users.find(u => u.id === contactId);
        convoMap.set(contactId, {
          contactId,
          contactName: contactUser?.name || 'User',
          contactAvatar: contactUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${contactId}`,
          lastMessage: m.content,
          lastTimestamp: m.timestamp,
          unreadCount: (!m.isRead && m.receiverId === userId) ? 1 : 0,
          messages: [m]
        });
      } else {
        const convo = convoMap.get(contactId)!;
        convo.messages.push(m);
        if (new Date(m.timestamp) > new Date(convo.lastTimestamp)) {
          convo.lastMessage = m.content;
          convo.lastTimestamp = m.timestamp;
        }
        if (!m.isRead && m.receiverId === userId) convo.unreadCount++;
      }
    });

    return Array.from(convoMap.values()).sort((a, b) => 
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  }

  async toggleOnlineStatus(profileId: string): Promise<CAProfile | undefined> {
    const profile = await this.findProfileById(profileId);
    if (!profile) return undefined;
    return this.updateOneProfile(profileId, { isOnline: !profile.isOnline });
  }
}

export const storageService = new StorageService();
