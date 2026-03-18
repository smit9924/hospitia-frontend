import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Localstorage {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Returns true if localStorage is available in the current environment.
   * Useful for guarding against SSR (Server-Side Rendering) environments.
   */
  private get isAvailable(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Stores a value under the given key.
   * Non-string values are automatically serialized to JSON.
   *
   * @param key - The key to store the value under.
   * @param value - The value to store. Can be any serializable type.
   */
  setItem<T>(key: string, value: T): void {
    if (!this.isAvailable) return;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`[LocalStorageService] Failed to set item "${key}":`, error);
    }
  }

  /**
   * Retrieves and deserializes a value by key.
   * Returns `null` if the key doesn't exist or parsing fails.
   *
   * @param key - The key to retrieve.
   * @returns The parsed value, or `null` if not found.
   */
  getItem<T>(key: string): T | null {
    if (!this.isAvailable) return null;

    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[LocalStorageService] Failed to get item "${key}":`, error);
      return null;
    }
  }

  /**
   * Removes the item associated with the given key.
   *
   * @param key - The key to remove.
   */
  removeItem(key: string): void {
    if (!this.isAvailable) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[LocalStorageService] Failed to remove item "${key}":`, error);
    }
  }

  /**
   * Clears all key-value pairs from localStorage.
   * Use with caution — this affects all stored data for the origin.
   */
  clear(): void {
    if (!this.isAvailable) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('[LocalStorageService] Failed to clear storage:', error);
    }
  }

  /**
   * Returns the key name at the given numeric index.
   *
   * @param index - The zero-based index of the key.
   * @returns The key name, or `null` if the index is out of range.
   */
  key(index: number): string | null {
    if (!this.isAvailable) return null;

    try {
      return localStorage.key(index);
    } catch (error) {
      console.error(`[LocalStorageService] Failed to get key at index ${index}:`, error);
      return null;
    }
  }

  /**
   * Returns the number of key-value pairs currently stored.
   *
   * @returns The count of stored items, or `0` if unavailable.
   */
  get length(): number {
    if (!this.isAvailable) return 0;

    try {
      return localStorage.length;
    } catch (error) {
      console.error('[LocalStorageService] Failed to read storage length:', error);
      return 0;
    }
  }

  /**
   * Returns all keys currently stored in localStorage.
   *
   * @returns An array of key strings.
   */
  getAllKeys(): string[] {
    if (!this.isAvailable) return [];

    try {
      return Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)!);
    } catch (error) {
      console.error('[LocalStorageService] Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Returns all key-value pairs as a plain object.
   * Values are deserialized from JSON where possible.
   *
   * @returns A record of all stored entries.
   */
  getAll(): Record<string, unknown> {
    if (!this.isAvailable) return {};

    try {
      return this.getAllKeys().reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = this.getItem(key);
        return acc;
      }, {});
    } catch (error) {
      console.error('[LocalStorageService] Failed to get all items:', error);
      return {};
    }
  }

  /**
   * Checks whether a specific key exists in localStorage.
   *
   * @param key - The key to check.
   * @returns `true` if the key exists, `false` otherwise.
   */
  hasItem(key: string): boolean {
    if (!this.isAvailable) return false;

    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`[LocalStorageService] Failed to check item "${key}":`, error);
      return false;
    }
  }
}
