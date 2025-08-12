// Offline-first storage system for rural areas with poor connectivity
export class OfflineHealthStorage {
  private static instance: OfflineHealthStorage;
  private dbName = 'HealthCareOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): OfflineHealthStorage {
    if (!OfflineHealthStorage.instance) {
      OfflineHealthStorage.instance = new OfflineHealthStorage();
    }
    return OfflineHealthStorage.instance;
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline symptom assessments
        if (!db.objectStoreNames.contains('assessments')) {
          const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id' });
          assessmentStore.createIndex('timestamp', 'timestamp');
          assessmentStore.createIndex('synced', 'synced');
        }

        // Store for offline vital signs
        if (!db.objectStoreNames.contains('vitals')) {
          const vitalsStore = db.createObjectStore('vitals', { keyPath: 'id' });
          vitalsStore.createIndex('timestamp', 'timestamp');
          vitalsStore.createIndex('synced', 'synced');
        }

        // Store for offline messages
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('timestamp', 'timestamp');
          messageStore.createIndex('synced', 'synced');
        }

        // Store for emergency contacts and info
        if (!db.objectStoreNames.contains('emergency')) {
          const emergencyStore = db.createObjectStore('emergency', { keyPath: 'id' });
          emergencyStore.createIndex('location', 'location');
        }

        // Store for health education content
        if (!db.objectStoreNames.contains('education')) {
          const educationStore = db.createObjectStore('education', { keyPath: 'id' });
          educationStore.createIndex('category', 'category');
          educationStore.createIndex('language', 'language');
        }
      };
    });
  }

  // Store data offline when internet is unavailable
  async storeOfflineData(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const dataWithSync = {
        ...data,
        id: data.id || Date.now().toString(),
        timestamp: new Date().toISOString(),
        synced: false
      };

      const request = store.add(dataWithSync);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get unsynced data when connection is restored
  async getUnsyncedData(storeName: string): Promise<any[]> {
    if (!this.db) await this.initDB();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mark data as synced
  async markAsSynced(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          data.synced = true;
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Store emergency information for offline access
  async storeEmergencyInfo(location: string, emergencyData: any): Promise<void> {
    const data = {
      id: `emergency_${location}`,
      location,
      ...emergencyData,
      lastUpdated: new Date().toISOString()
    };

    await this.storeOfflineData('emergency', data);
  }

  // Get emergency info for current location
  async getEmergencyInfo(location: string): Promise<any> {
    if (!this.db) await this.initDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emergency'], 'readonly');
      const store = transaction.objectStore('emergency');
      const request = store.get(`emergency_${location}`);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Store health education content for offline access
  async storeHealthEducation(content: any): Promise<void> {
    await this.storeOfflineData('education', content);
  }

  // Get health education content by category and language
  async getHealthEducation(category?: string, language?: string): Promise<any[]> {
    if (!this.db) await this.initDB();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['education'], 'readonly');
      const store = transaction.objectStore('education');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;
        
        if (category) {
          results = results.filter(item => item.category === category);
        }
        
        if (language) {
          results = results.filter(item => item.language === language);
        }
        
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Network status manager
export class NetworkManager {
  private static instance: NetworkManager;
  private isOnline: boolean = true;
  private listeners: ((online: boolean) => void)[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.setOnlineStatus(true));
      window.addEventListener('offline', () => this.setOnlineStatus(false));
    }
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    this.listeners.forEach(listener => listener(online));
    
    if (online) {
      this.syncOfflineData();
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public addStatusListener(listener: (online: boolean) => void): void {
    this.listeners.push(listener);
  }

  public removeStatusListener(listener: (online: boolean) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private async syncOfflineData(): Promise<void> {
    const storage = OfflineHealthStorage.getInstance();
    
    try {
      // Sync assessments
      const assessments = await storage.getUnsyncedData('assessments');
      for (const assessment of assessments) {
        try {
          await fetch('/api/assess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessment)
          });
          await storage.markAsSynced('assessments', assessment.id);
        } catch (error) {
          console.error('Failed to sync assessment:', error);
        }
      }

      // Sync vitals
      const vitals = await storage.getUnsyncedData('vitals');
      for (const vital of vitals) {
        try {
          await fetch('/api/vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vital)
          });
          await storage.markAsSynced('vitals', vital.id);
        } catch (error) {
          console.error('Failed to sync vitals:', error);
        }
      }

      // Sync messages
      const messages = await storage.getUnsyncedData('messages');
      for (const message of messages) {
        try {
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
          });
          await storage.markAsSynced('messages', message.id);
        } catch (error) {
          console.error('Failed to sync message:', error);
        }
      }

      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }
}