/**
 * Server-side storage service
 * Handles file-based persistence for architecture data
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, '..', 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'storage.json');

interface StorageData {
  [key: string]: any;
}

let storageCache: StorageData | null = null;

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create storage directory:', error);
    throw error;
  }
}

/**
 * Load storage data from file
 */
async function loadStorage(): Promise<StorageData> {
  if (storageCache !== null) {
    return storageCache;
  }

  try {
    await ensureStorageDir();
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    storageCache = JSON.parse(data);
    return storageCache!;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty storage
      storageCache = {};
      return storageCache;
    }
    console.error('Failed to load storage:', error);
    throw error;
  }
}

/**
 * Save storage data to file
 */
async function saveStorage(data: StorageData): Promise<void> {
  try {
    await ensureStorageDir();
    console.log(`[Storage] Saving to ${STORAGE_FILE}, ${Object.keys(data).length} keys`);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    storageCache = data;
    console.log(`[Storage] ✅ Successfully saved storage file`);
  } catch (error: any) {
    console.error('[Storage] ❌ Failed to save storage:', error);
    console.error('[Storage] Error details:', error.message, error.code, error.path);
    throw error;
  }
}

/**
 * Get a value from storage
 */
export async function getStorageValue(key: string): Promise<any> {
  try {
    const storage = await loadStorage();
    const value = storage[key];
    console.log(`[Storage] Getting ${key}:`, value === undefined ? 'not found' : typeof value, Array.isArray(value) ? `array[${value.length}]` : typeof value === 'object' ? `object[${Object.keys(value).length} keys]` : '');
    return value;
  } catch (error: any) {
    console.error(`[Storage] Error getting ${key}:`, error);
    throw error;
  }
}

/**
 * Set a value in storage
 */
export async function setStorageValue(key: string, value: any): Promise<void> {
  try {
    console.log(`[Storage] Setting ${key}:`, typeof value, Array.isArray(value) ? `array[${value.length}]` : typeof value === 'object' ? `object[${Object.keys(value).length} keys]` : '');
    const storage = await loadStorage();
    storage[key] = value;
    await saveStorage(storage);
    console.log(`[Storage] ✅ Successfully set ${key}`);
  } catch (error: any) {
    console.error(`[Storage] ❌ Error setting ${key}:`, error);
    throw error;
  }
}

/**
 * Remove a value from storage
 */
export async function removeStorageValue(key: string): Promise<void> {
  const storage = await loadStorage();
  delete storage[key];
  await saveStorage(storage);
}

/**
 * Clear all storage
 */
export async function clearStorage(): Promise<void> {
  storageCache = {};
  await saveStorage({});
}

/**
 * Get all storage keys
 */
export async function getAllStorageKeys(): Promise<string[]> {
  const storage = await loadStorage();
  return Object.keys(storage);
}

