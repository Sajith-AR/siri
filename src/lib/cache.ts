// Advanced caching system with TTL and intelligent invalidation
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

export class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000;

  set<T>(
    key: string,
    data: T,
    ttlMs: number = 300000, // 5 minutes default
    tags: string[] = []
  ): void {
    // Clean up expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      tags
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  invalidateByPattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need hit/miss tracking
      memoryUsage: JSON.stringify([...this.cache.entries()]).length
    };
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
export const cache = new AdvancedCache();

// Cache decorators and utilities
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 300000,
  tags: string[] = []
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    cache.set(key, data, ttlMs, tags);
    return data;
  });
}

// Smart caching for medical data
export class MedicalDataCache extends AdvancedCache {
  // Cache patient data with privacy considerations
  cachePatientData(patientId: string, data: any, ttlMs: number = 600000): void {
    // 10 minutes for patient data
    this.set(`patient:${patientId}`, data, ttlMs, ['patient', patientId]);
  }

  // Cache symptom analysis results
  cacheSymptomAnalysis(symptomsHash: string, analysis: any): void {
    // 1 hour for symptom analysis
    this.set(`symptoms:${symptomsHash}`, analysis, 3600000, ['symptoms']);
  }

  // Cache AI responses with context awareness
  cacheAIResponse(contextHash: string, response: any): void {
    // 30 minutes for AI responses
    this.set(`ai:${contextHash}`, response, 1800000, ['ai']);
  }

  // Cache health risk assessments
  cacheRiskAssessment(patientId: string, assessment: any): void {
    // 24 hours for risk assessments
    this.set(`risk:${patientId}`, assessment, 86400000, ['risk', patientId]);
  }

  // Invalidate patient-specific data
  invalidatePatientData(patientId: string): void {
    this.invalidateByTag(patientId);
  }
}

export const medicalCache = new MedicalDataCache();

// Utility functions
export function generateCacheKey(...parts: (string | number)[]): string {
  return parts.map(p => String(p)).join(':');
}

export function hashObject(obj: any): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 16);
}