/**
 * Example 2: Factory Pattern (RECOMMENDED)
 *
 * This is the recommended approach for TypeScript.
 * More flexible, testable, and easier to reason about.
 */

// Generic singleton factory class
class SingletonFactory<T> {
  private instance: T | undefined;

  constructor(private factoryFunction: () => T) {}

  /**
   * Get the singleton instance.
   * Creates on first call, returns cached on subsequent calls.
   */
  get(): T {
    if (!this.instance) {
      console.log('🔄 [FACTORY] First call - creating instance');
      this.instance = this.factoryFunction();
    } else {
      console.log('♻️  [FACTORY] Returning cached instance');
    }
    return this.instance;
  }
}

// ============================================
// Dependency Layer 1: Configuration
// ============================================

class AppConfig {
  public readonly dbUrl = 'mongodb://localhost:27017/myapp';
  public readonly apiKey = 'secret-api-key-123';
  public readonly cacheHost = 'redis://localhost:6379';

  constructor() {
    console.log('📋 [CONFIG] Loading configuration...');
  }
}

// ============================================
// Dependency Layer 2: Database
// ============================================

class Database {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
    console.log(`🔌 [DATABASE] Connecting to ${config.dbUrl}...`);
    // Simulate expensive initialization
  }

  query(sql: string): string[] {
    console.log(`📝 [DATABASE] Query: ${sql}`);
    return ['result1', 'result2'];
  }
}

// ============================================
// Dependency Layer 3: Cache
// ============================================

class Cache {
  private config: AppConfig;
  private data: Map<string, any>;

  constructor(config: AppConfig) {
    this.config = config;
    this.data = new Map();
    console.log(`💾 [CACHE] Connecting to ${config.cacheHost}...`);
  }

  get<T>(key: string): T | undefined {
    return this.data.get(key);
  }

  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }
}

// ============================================
// Dependency Layer 4: API Connector
// ============================================

class ExternalAPIConnector {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
    console.log(`🌐 [API] Initializing connector with key: ${config.apiKey}`);
  }

  fetchProduct(id: string): { id: string; name: string } {
    console.log(`📡 [API] Fetching product ${id}`);
    return { id, name: 'Sample Product' };
  }
}

// ============================================
// Dependency Layer 5: Service
// ============================================

class ProductService {
  constructor(
    private db: Database,
    private cache: Cache,
    private api: ExternalAPIConnector
  ) {
    console.log('🎯 [SERVICE] ProductService initialized');
  }

  async getProduct(id: string): Promise<{ id: string; name: string }> {
    // Try cache first
    const cached = this.cache.get(id);
    if (cached) {
      console.log(`✅ [SERVICE] Found in cache: ${id}`);
      return cached;
    }

    // Fetch from external API
    const product = this.api.fetchProduct(id);

    // Store in cache
    this.cache.set(id, product);

    // Store in database
    this.db.query(`INSERT INTO products VALUES ('${id}', '${product.name}')`);

    return product;
  }
}

// ============================================
// Factory Instances (created once)
// ============================================

console.log('\n=== Factory Pattern Example (RECOMMENDED) ===\n');
console.log('Creating factories (no initialization yet)...\n');

const configFactory = new SingletonFactory(() => new AppConfig());

const databaseFactory = new SingletonFactory(() =>
  new Database(configFactory.get())
);

const cacheFactory = new SingletonFactory(() =>
  new Cache(configFactory.get())
);

const apiFactory = new SingletonFactory(() =>
  new ExternalAPIConnector(configFactory.get())
);

const productServiceFactory = new SingletonFactory(() =>
  new ProductService(
    databaseFactory.get(),
    cacheFactory.get(),
    apiFactory.get()
  )
);

// ============================================
// Simulation: Multiple Requests
// ============================================

console.log('Request 1: Get product ABC123');
console.log('---');
(async () => {
  const service = productServiceFactory.get();
  await service.getProduct('ABC123');
})();

setTimeout(() => {
  console.log('\nRequest 2: Get product XYZ789');
  console.log('---');
  (async () => {
    const service = productServiceFactory.get();
    await service.getProduct('XYZ789');
  })();
}, 100);

setTimeout(() => {
  console.log('\nRequest 3: Get product ABC123 (cached)');
  console.log('---');
  (async () => {
    const service = productServiceFactory.get();
    await service.getProduct('ABC123');
  })();
}, 200);

setTimeout(() => {
  console.log('\n\n✅ Summary:');
  console.log('- ALL factories created exactly ONCE');
  console.log('- All subsequent calls return cached instances');
  console.log('- Clean dependency chain: Config → DB/Cache/API → Service');
  console.log('- Transparent initialization (caller unaware of caching)');

  console.log('\n✨ Advantages of Factory Pattern:');
  console.log('✓ Easy to test (can inject mocks)');
  console.log('✓ Easy to reset between tests');
  console.log('✓ Supports mocking (see example 03)');
  console.log('✓ More functional style');
  console.log('✓ Clearer dependency management');
  console.log('✓ Flexible and composable');
}, 300);
