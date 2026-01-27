const AsyncStorage = {
    getItem: async (key: string): Promise<string | null> => {
        if (typeof window !== 'undefined') {
            return window.localStorage.getItem(key);
        }
        return null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
        }
    },
    clear: async (): Promise<void> => {
        if (typeof window !== 'undefined') {
            window.localStorage.clear();
        }
    },
    getAllKeys: async (): Promise<readonly string[]> => {
        if (typeof window !== 'undefined') {
            return Object.keys(window.localStorage);
        }
        return [];
    },
    multiGet: async (keys: readonly string[]): Promise<readonly [string, string | null][]> => {
        if (typeof window !== 'undefined') {
            return keys.map((key) => [key, window.localStorage.getItem(key)]);
        }
        return [];
    },
    multiSet: async (keyValuePairs: string[][]): Promise<void> => {
        if (typeof window !== 'undefined') {
            keyValuePairs.forEach(([key, value]) => {
                window.localStorage.setItem(key, value);
            });
        }
    },
    multiRemove: async (keys: readonly string[]): Promise<void> => {
        if (typeof window !== 'undefined') {
            keys.forEach((key) => {
                window.localStorage.removeItem(key);
            });
        }
    },
};

export default AsyncStorage;
