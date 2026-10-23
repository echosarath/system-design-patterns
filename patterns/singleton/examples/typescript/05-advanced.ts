/**
 * Example 5: Advanced Patterns & Edge Cases
 *
 * Covers:
 * - Thread-safe implementations (conceptual)
 * - Double-checked locking
 * - Lazy initialization with Promise
 * - Memory leak prevention
 * - Circular dependency detection
 */

// ============================================
// Advanced Pattern 1: Thread-Safe Factory
// ============================================

/**
 * NOTE: JavaScript/TypeScript runs in a single-threaded event loop,
 * so traditional thread safety isn't needed. However, this example
 * shows the pattern you'd use in Java or other multi-threaded languages.
 */

class ThreadSafeFactory<T> {
  private instance: T | undefined;
  private initializing: boolean = false;
  private initPromise: Promise<T> | null = null;

  constructor(private factoryFunction: () => T | Promise<T>) {}

  async get(): Promise<T> {
    // Double-checked locking pattern (conceptual)
    if (this.instance) {
      return this.instance;
    }

    // If already initializing, wait for that promise
    if (this.initializing && this.initPromise) {
      return this.initPromise;
    }

    // First thread to get here starts initialization
    this.initializing = true;

    try {
      this.initPromise = Promise.resolve(this.factoryFunction()).then(
        (instance) => {
          this.instance = instance;
          return instance;
        }
      );

      return await this.initPromise;
    } finally {
      this.initializing = false;
    }
  }
}

// ============================================
// Advanced Pattern 2: Lazy Async Initialization
// ============================================

class AsyncSingletonFactory<T> {
  private instance: T | undefined;
  private initPromise: Promise<T> | null = null;

  constructor(private asyncFactory: () => Promise<T>) {}

  /**
   * Get the singleton instance asynchronously.
   * Multiple concurrent calls wait for same initialization.
   */
  async get(): Promise<T> {
    if (this.instance) {
      return this.instance;
    }

    // Reuse existing initialization promise if one is in flight
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start new initialization
    this.initPromise = this.asyncFactory().then((instance) => {
      this.instance = instance;
      return instance;
    });

    return this.initPromise;
  }

  reset(): void {
    this.instance = undefined;
    this.initPromise = null;
  }
}

// ============================================
// Advanced Pattern 3: Bounded Cache (Prevent Memory Leaks)
// ============================================

class BoundedCacheSingleton<T> {
  private instance: T | undefined;
  private createdAt: number = 0;
  private readonly ttl: number; // Time-to-live in milliseconds

  constructor(
    private factoryFunction: () => T,
    ttlSeconds: number = 3600
  ) {
    this.ttl = ttlSeconds * 1000;
  }

  get(): T {
    const now = Date.now();

    // Check if cache is expired
    if (
      this.instance !== undefined &&
      now - this.createdAt < this.ttl
    ) {
      return this.instance;
    }

    // Create new instance
    this.instance = this.factoryFunction();
    this.createdAt = now;
    return this.instance;
  }

  getMetrics(): {
    isInitialized: boolean;
    ageMs: number;
    ttlMs: number;
    isExpired: boolean;
  } {
    const now = Date.now();
    const ageMs = this.createdAt > 0 ? now - this.createdAt : 0;
    const isExpired = this.createdAt > 0 && ageMs >= this.ttl;

    return {
      isInitialized: this.instance !== undefined,
      ageMs,
      ttlMs: this.ttl,
      isExpired,
    };
  }
}

// ============================================
// Advanced Pattern 4: Circular Dependency Detection
// ============================================

class CircularDependencyDetectingFactory<T> {
  private instance: T | undefined;
  private isInitializing: boolean = false;
  private initializationStack: string[] = [];

  constructor(
    private factoryFunction: () => T,
    private factoryName: string
  ) {}

  get(): T {
    if (this.instance) {
      return this.instance;
    }

    // Detect circular dependency
    if (this.isInitializing) {
      const stack = this.initializationStack.join(' → ');
      throw new Error(
        `❌ CIRCULAR DEPENDENCY DETECTED: ${stack} → ${this.factoryName}`
      );
    }

    this.isInitializing = true;
    this.initializationStack.push(this.factoryName);

    try {
      this.instance = this.factoryFunction();
      this.initializationStack.pop();
      return this.instance;
    } catch (error) {
      this.isInitializing = false;
      throw error;
    }
  }
}

// ============================================
// Advanced Pattern 5: Lazy Reference Factory
// ============================================

/**
 * Useful for circular dependencies by deferring resolution.
 * Instead of passing instances, pass factory references.
 */

class LazyReferenceFactory<T> {
  private instance: T | undefined;

  constructor(private factoryFunction: () => T) {}

  /**
   * Get instance lazily (may be called during construction of other instances)
   */
  getOrThrow(): T {
    if (!this.instance) {
      throw new Error(
        'Instance not yet initialized. Use get() or ensure dependencies are created first.'
      );
    }
    return this.instance;
  }

  /**
   * Create instance (should be called after all dependencies exist)
   */
  create(): T {
    if (!this.instance) {
      this.instance = this.factoryFunction();
    }
    return this.instance;
  }

  reset(): void {
    this.instance = undefined;
  }
}

// ============================================
// Demo: Advanced Patterns
// ============================================

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║          Advanced Singleton Patterns                       ║');
console.log('╚════════════════════════════════════════════════════════════╝');

// ============================================
// Demo 1: Async Singleton
// ============================================

console.log('\n1️⃣  Async Singleton Factory');
console.log('─────────────────────────────────────');

class AsyncDatabase {
  private connected: boolean = false;

  async connect(): Promise<void> {
    console.log('  ⏳ Connecting to database...');
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
    this.connected = true;
    console.log('  ✅ Connected!');
  }

  query(sql: string): string {
    if (!this.connected) throw new Error('Not connected');
    return `Result of: ${sql}`;
  }
}

const asyncDbFactory = new AsyncSingletonFactory(async () => {
  const db = new AsyncDatabase();
  await db.connect();
  return db;
});

(async () => {
  console.log('Request 1: Get DB connection');
  const db1 = await asyncDbFactory.get();
  console.log(`  Result: ${db1.query('SELECT * FROM users')}`);

  console.log('\nRequest 2: Get DB connection (reused)');
  const db2 = await asyncDbFactory.get();
  console.log(`  Same instance: ${db1 === db2}`);

  // ============================================
  // Demo 2: Bounded Cache
  // ============================================

  console.log('\n\n2️⃣  Bounded Cache (TTL) Singleton');
  console.log('─────────────────────────────────────');

  let creationCount = 0;

  const boundedFactory = new BoundedCacheSingleton(
    () => {
      creationCount++;
      console.log(`  Creating instance #${creationCount}`);
      return { id: creationCount, data: 'some data' };
    },
    1 // 1 second TTL
  );

  console.log('Get instance 1:');
  const inst1 = boundedFactory.get();
  console.log(`  Metrics:`, boundedFactory.getMetrics());

  console.log('\nGet instance 2 (immediate - should be cached):');
  const inst2 = boundedFactory.get();
  console.log(`  Same instance: ${inst1 === inst2}`);
  console.log(`  Metrics:`, boundedFactory.getMetrics());

  console.log('\nWait 1.1 seconds (TTL expired)...');
  await new Promise((resolve) => setTimeout(resolve, 1100));

  console.log('Get instance 3 (TTL expired - new instance):');
  const inst3 = boundedFactory.get();
  console.log(`  Different instance: ${inst1 !== inst3}`);
  console.log(`  New creation count: ${creationCount}`);
  console.log(`  Metrics:`, boundedFactory.getMetrics());

  // ============================================
  // Demo 3: Circular Dependency Detection
  // ============================================

  console.log('\n\n3️⃣  Circular Dependency Detection');
  console.log('─────────────────────────────────────');

  class ServiceA {
    constructor(public b: ServiceB) {}
  }

  class ServiceB {
    constructor(public a: ServiceA) {}
  }

  // This will cause circular dependency
  const factoryA = new CircularDependencyDetectingFactory(
    () => new ServiceA(factoryB.get()),
    'ServiceA'
  );

  const factoryB = new CircularDependencyDetectingFactory(
    () => new ServiceB(factoryA.get()),
    'ServiceB'
  );

  try {
    console.log('Attempting to create ServiceA (which depends on ServiceB):');
    factoryA.get();
  } catch (error) {
    console.log(`  ${(error as Error).message}`);
  }

  // ============================================
  // Demo 4: Solution to Circular Dependency
  // ============================================

  console.log('\n\n4️⃣  Solving Circular Dependencies');
  console.log('─────────────────────────────────────');

  console.log('Solution: Restructure dependencies');
  console.log('Before: ServiceA → ServiceB → ServiceA (circular)');
  console.log('After:  ServiceBase → ServiceA → ServiceB (linear)');

  class ServiceBase {
    getValue(): string {
      return 'base';
    }
  }

  class GoodServiceA {
    constructor(public base: ServiceBase) {}
  }

  class GoodServiceB {
    constructor(public a: GoodServiceA) {}
  }

  const baseFactory = new CircularDependencyDetectingFactory(
    () => new ServiceBase(),
    'ServiceBase'
  );

  const goodFactoryA = new CircularDependencyDetectingFactory(
    () => new GoodServiceA(baseFactory.get()),
    'GoodServiceA'
  );

  const goodFactoryB = new CircularDependencyDetectingFactory(
    () => new GoodServiceB(goodFactoryA.get()),
    'GoodServiceB'
  );

  try {
    const result = goodFactoryB.get();
    console.log(`  ✅ Created successfully!`);
    console.log(`  Base value: ${result.a.base.getValue()}`);
  } catch (error) {
    console.log(`  ${(error as Error).message}`);
  }

  // ============================================
  // Demo 5: Memory Considerations
  // ============================================

  console.log('\n\n5️⃣  Memory Leak Prevention');
  console.log('─────────────────────────────────────');

  class LargeDataSet {
    private data: any[];

    constructor(size: number = 1000000) {
      this.data = new Array(size).fill({ value: 'x' });
      console.log(
        `  📦 Created dataset with ${size.toLocaleString()} items`
      );
    }

    getSize(): number {
      return this.data.length;
    }
  }

  // Without TTL: grows forever
  const unboundedFactory = new BoundedCacheSingleton(
    () => new LargeDataSet(1000000),
    Infinity // Never expires
  );

  // With TTL: expires and can be garbage collected
  const boundedDataFactory = new BoundedCacheSingleton(
    () => new LargeDataSet(1000000),
    5 // 5 seconds
  );

  console.log('Unbounded singleton (Infinity TTL):');
  unboundedFactory.get();
  console.log('  Problem: Never garbage collected!');

  console.log('\nBounded singleton (5 second TTL):');
  boundedDataFactory.get();
  console.log('  Benefit: Can be garbage collected after expiration');

  // ============================================
  // Summary
  // ============================================

  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log('\n🎯 Advanced Patterns Covered:');
  console.log('1. ThreadSafeFactory - For multi-threaded environments');
  console.log('2. AsyncSingletonFactory - For async initialization (promises)');
  console.log('3. BoundedCacheSingleton - Prevent memory leaks with TTL');
  console.log('4. CircularDependencyDetectingFactory - Catch issues early');
  console.log('5. LazyReferenceFactory - Handle circular dependencies via deferred resolution');

  console.log('\n⚠️  Common Pitfalls:');
  console.log('❌ Unbounded growth → Use TTL/bounded cache');
  console.log('❌ Circular dependencies → Restructure for linearity');
  console.log('❌ Concurrent initialization → Use promises/locks');
  console.log('❌ Memory leaks → Implement cache eviction');
  console.log('❌ Thread unsafe → Add synchronization (Java, Go, etc.)');

  console.log('\n✅ Best Practices:');
  console.log('✓ Use async factories for I/O operations');
  console.log('✓ Always add TTL for cache singletons');
  console.log('✓ Detect circular dependencies early');
  console.log('✓ Document initialization sequence');
  console.log('✓ Provide metrics/observability');
  console.log('✓ Test thoroughly (unit, integration, E2E)');

  console.log('\n');
})();
