/**
 * Caches food analysis results using SQLite to avoid redundant API calls
 */

import * as SQLite from 'expo-sqlite';
import { MacroResult } from './openaiVision.shared';

let db: SQLite.SQLiteDatabase | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('vision_cache.db');
  
  // Create cache table if doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS vision_results (
      id TEXT PRIMARY KEY,
      result TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);

  return db;
}

const CACHE_EXPIRY_HOURS = 24;

export async function getCachedResult(imageHash: string): Promise<MacroResult | null> {
  try {
    const database = await getDatabase();
    const rows = await database.getAllAsync<{ result: string; timestamp: number }>(
      'SELECT result, timestamp FROM vision_results WHERE id = ?',
      [imageHash]
    );

    if (rows.length === 0) return null;

    const { result, timestamp } = rows[0];
    const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);

    if (ageHours > CACHE_EXPIRY_HOURS) {
      await database.runAsync('DELETE FROM vision_results WHERE id = ?', [imageHash]);
      return null;
    }

    console.log(`[Cache HIT] Using cached result`);
    return JSON.parse(result) as MacroResult;
  } catch (error) {
    console.error('Cache lookup failed:', error);
    return null;
  }
}

export async function cacheResult(imageHash: string, result: MacroResult): Promise<void> {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR REPLACE INTO vision_results (id, result, timestamp) VALUES (?, ?, ?)',
      [imageHash, JSON.stringify(result), Date.now()]
    );
    console.log(`[Cache SAVE] Cached result`);
  } catch (error) {
    console.error('Failed to cache result:', error);
  }
}

// Simple hash function for image data
export function hashImageData(base64Image: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(base64Image.length, 1000); i++) {
    const char = base64Image.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'img_' + Math.abs(hash).toString(36);
}
