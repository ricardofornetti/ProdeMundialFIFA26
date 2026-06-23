const memoryStore: Record<string, string> = {};

export const storage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return memoryStore[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      memoryStore[key] = String(value);
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete memoryStore[key];
    }
  },
  clear: (): void => {
    try {
      window.localStorage.clear();
    } catch (e) {
      for (const key in memoryStore) {
        delete memoryStore[key];
      }
    }
  }
};
