/**
 * Storage Service - Centralized persistence layer
 * Implements SOLID principles: Single Responsibility
 * Provides DRY abstraction for localStorage and API persistence
 */

export interface StorageService {
  get<T>(key: string, defaultValue: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  isAuthenticated(): boolean;
}

export class LocalStorageService implements StorageService {
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      throw error;
    }
  }
}

class ApiStorageService implements StorageService {
  private baseUrl: string;
  private localService: LocalStorageService;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.localService = new LocalStorageService();
  }

  isAuthenticated(): boolean {
    return this.localService.isAuthenticated();
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/storage/${encodeURIComponent(key)}`);
      if (!response.ok) {
        if (response.status === 404) {
          // 404 is expected for new keys, try localStorage as fallback
          console.log(`ℹ️ Key ${key} not found in API, checking localStorage...`);
          const localService = new LocalStorageService();
          const localValue = localService.get(key, defaultValue);
          // If found in localStorage, return it; otherwise use default
          if (localValue !== defaultValue) {
            console.log(`✅ Found ${key} in localStorage`);
            return localValue;
          }
          return defaultValue;
        }
        throw new Error(`Failed to fetch ${key}: ${response.statusText}`);
      }
      const data = await response.json();
      const value = (data.value ?? defaultValue) as T;
      // Also save to localStorage as backup
      if (value !== defaultValue) {
        try {
          const localService = new LocalStorageService();
          await localService.set(key, value);
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      return value;
    } catch (error) {
      console.error(`Failed to load ${key} from API:`, error);
      // Fallback to localStorage if API fails
      const localService = new LocalStorageService();
      return localService.get(key, defaultValue);
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    // If not authenticated, only save to localStorage
    if (!this.isAuthenticated()) {
      console.log(`⚠️ Not authenticated - saving ${key} to localStorage only`);
      await this.localService.set(key, value);
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/storage/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${key}: ${response.statusText}`);
      }

      console.log(`✅ Saved ${key} to API successfully`);
      
      // Also save to localStorage as backup
      try {
        await this.localService.set(key, value);
        console.log(`✅ Backed up ${key} to localStorage`);
      } catch (localError) {
        // Ignore localStorage errors, API is primary
        console.warn('⚠️ Failed to backup to localStorage:', localError);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to save ${key} to API, falling back to localStorage:`, error);
      // Fallback to localStorage if API fails
      await this.localService.set(key, value);
      console.log(`✅ Saved ${key} to localStorage (fallback)`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/storage/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to remove ${key}: ${response.statusText}`);
      }

      // Also remove from localStorage
      const localService = new LocalStorageService();
      try {
        await localService.remove(key);
      } catch (localError) {
        // Ignore localStorage errors
        console.warn('Failed to remove from localStorage:', localError);
      }
    } catch (error) {
      console.error(`Failed to remove ${key} from API:`, error);
      // Fallback to localStorage
      const localService = new LocalStorageService();
      await localService.remove(key);
    }
  }

  async clear(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/storage`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to clear storage: ${response.statusText}`);
      }

      // Also clear localStorage
      const localService = new LocalStorageService();
      try {
        await localService.clear();
      } catch (localError) {
        console.warn('Failed to clear localStorage:', localError);
      }
    } catch (error) {
      console.error('Failed to clear storage from API:', error);
      throw error;
    }
  }
}

// Factory function to get the appropriate storage service
export function getStorageService(): StorageService {
  // Always try to use API storage first (it has fallback to localStorage)
  // This ensures data is synced to server when available
  // In development, API might not be available, so it falls back to localStorage
  return new ApiStorageService();
}

// Export singleton instance
export const storageService = getStorageService();

