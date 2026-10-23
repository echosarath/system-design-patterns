/**
 * Example 4: Real-World Dependency Chain
 *
 * A realistic scenario with a complete dependency chain:
 * Config → Database → Repository → Service → Router
 */

// ============================================
// Utility: Singleton Factory
// ============================================

class SingletonFactory<T> {
  private instance: T | undefined;
  private initTime: number = 0;

  constructor(
    private factoryFunction: () => T,
    private name: string
  ) {}

  get(): T {
    if (!this.instance) {
      const start = Date.now();
      console.log(`⏱️  [${this.name}] Initializing...`);
      this.instance = this.factoryFunction();
      this.initTime = Date.now() - start;
      console.log(`✅ [${this.name}] Initialized in ${this.initTime}ms`);
    } else {
      console.log(`♻️  [${this.name}] Using cached instance`);
    }
    return this.instance;
  }

  reset(): void {
    this.instance = undefined;
  }

  inject(testInstance: T): void {
    this.instance = testInstance;
  }
}

// ============================================
// Layer 1: Configuration
// ============================================

class AppConfiguration {
  readonly dbUrl = 'mongodb://localhost:27017/products_db';
  readonly apiUrl = 'https://api.example.com/v1';
  readonly cacheUrl = 'redis://localhost:6379';
  readonly apiKey = 'secret-key-12345';
  readonly env = 'production';

  constructor() {
    // Simulate reading from SSM, Vault, .env file, etc.
    console.log('    📋 Reading configuration from SSM Parameter Store...');
    this.simulateDelay(100);
  }

  private simulateDelay(ms: number): void {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  }
}

// ============================================
// Layer 2: Infrastructure - Database Connection
// ============================================

class DatabaseConnection {
  private isConnected: boolean = false;

  constructor(private config: AppConfiguration) {
    console.log(`    🔌 Connecting to ${config.dbUrl}...`);
    this.simulateDelay(150); // Simulate connection delay
    this.isConnected = true;
    console.log('    ✅ Database connection pool established');
  }

  async query(sql: string): Promise<any[]> {
    if (!this.isConnected) throw new Error('Database not connected');
    return [{ id: '123', name: 'Product' }];
  }

  private simulateDelay(ms: number): void {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  }
}

// ============================================
// Layer 3: Infrastructure - Cache Connection
// ============================================

class CacheConnection {
  private cache: Map<string, any> = new Map();

  constructor(private config: AppConfiguration) {
    console.log(`    💾 Connecting to ${config.cacheUrl}...`);
    this.simulateDelay(75); // Simulate connection delay
    console.log('    ✅ Cache connection established');
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  set<T>(key: string, value: T, ttl: number = 3600): void {
    this.cache.set(key, { value, expires: Date.now() + ttl * 1000 });
  }

  private simulateDelay(ms: number): void {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  }
}

// ============================================
// Layer 4: External API Connector
// ============================================

class ExternalProductAPIConnector {
  private authToken: string = '';
  private isAuthenticated: boolean = false;

  constructor(private config: AppConfiguration) {
    console.log(`    🌐 Authenticating with ${config.apiUrl}...`);
    this.simulateDelay(200); // Simulate API auth delay
    this.authToken = `bearer_${this.config.apiKey}`;
    this.isAuthenticated = true;
    console.log('    ✅ API authentication successful');
  }

  async fetchProductByArticleNumber(articleNumber: string): Promise<{
    id: string;
    name: string;
    price: number;
  }> {
    if (!this.isAuthenticated) throw new Error('API not authenticated');
    console.log(
      `    📡 API call: GET /products/${articleNumber} (token: ${this.authToken.substring(0, 10)}...)`
    );
    return {
      id: articleNumber,
      name: 'Premium Product',
      price: 99.99,
    };
  }

  private simulateDelay(ms: number): void {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  }
}

// ============================================
// Layer 5: Repository (Data Access Layer)
// ============================================

interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cached: boolean;
}

class ProductRepository implements IProductRepository {
  constructor(
    private db: DatabaseConnection,
    private cache: CacheConnection,
    private api: ExternalProductAPIConnector
  ) {
    console.log('    📖 Repository initialized');
  }

  async findById(id: string): Promise<Product | null> {
    // Try cache first
    const cached = this.cache.get<Product>(id);
    if (cached) {
      console.log(`    💾 [CACHE HIT] Product ${id}`);
      return { ...cached.value, cached: true };
    }

    // Fetch from API
    console.log(`    📡 [CACHE MISS] Fetching product ${id} from API`);
    const product = await this.api.fetchProductByArticleNumber(id);

    // Cache the result
    this.cache.set(id, product);

    // Store in database
    await this.db.query(
      `INSERT INTO products (id, name, price) VALUES ('${product.id}', '${product.name}', ${product.price})`
    );

    return { ...product, cached: false };
  }

  async save(product: Product): Promise<void> {
    await this.db.query(
      `UPDATE products SET name='${product.name}', price=${product.price} WHERE id='${product.id}'`
    );
    this.cache.set(product.id, product);
  }
}

// ============================================
// Layer 6: Service (Business Logic)
// ============================================

class ProductService {
  constructor(
    private repository: IProductRepository,
    private cache: CacheConnection
  ) {
    console.log('    🎯 Service initialized');
  }

  async getProduct(articleNumber: string): Promise<Product | null> {
    console.log(`\n  🔍 Service: Finding product ${articleNumber}`);
    const product = await this.repository.findById(articleNumber);
    return product;
  }

  async updateProduct(
    articleNumber: string,
    updates: Partial<Product>
  ): Promise<void> {
    console.log(`\n  ✏️  Service: Updating product ${articleNumber}`);
    const product = await this.repository.findById(articleNumber);
    if (product) {
      const updated = { ...product, ...updates };
      await this.repository.save(updated);
    }
  }
}

// ============================================
// Factories
// ============================================

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║       Real-World Dependency Chain Example                  ║');
console.log('║  Config → DB → Cache → API → Repository → Service         ║');
console.log('╚════════════════════════════════════════════════════════════╝');

console.log('\n📦 Creating factories (no initialization yet)...\n');

const configFactory = new SingletonFactory(
  () => new AppConfiguration(),
  'AppConfiguration'
);

const dbFactory = new SingletonFactory(
  () => new DatabaseConnection(configFactory.get()),
  'DatabaseConnection'
);

const cacheFactory = new SingletonFactory(
  () => new CacheConnection(configFactory.get()),
  'CacheConnection'
);

const apiFactory = new SingletonFactory(
  () => new ExternalProductAPIConnector(configFactory.get()),
  'ExternalProductAPIConnector'
);

const repositoryFactory = new SingletonFactory(
  () =>
    new ProductRepository(
      dbFactory.get(),
      cacheFactory.get(),
      apiFactory.get()
    ),
  'ProductRepository'
);

const serviceFactory = new SingletonFactory(
  () => new ProductService(repositoryFactory.get(), cacheFactory.get()),
  'ProductService'
);

// ============================================
// Simulate Multiple Requests
// ============================================

(async () => {
  console.log('\n┌──────────────────────────────────────────────────────────┐');
  console.log('│ REQUEST 1: Get product ABC123 (First time)               │');
  console.log('└──────────────────────────────────────────────────────────┘');

  const service = serviceFactory.get();
  const product1 = await service.getProduct('ABC123');
  console.log(`  Result: ${JSON.stringify(product1)}`);

  console.log('\n┌──────────────────────────────────────────────────────────┐');
  console.log('│ REQUEST 2: Get product XYZ789 (Different product)        │');
  console.log('└──────────────────────────────────────────────────────────┘');

  const product2 = await service.getProduct('XYZ789');
  console.log(`  Result: ${JSON.stringify(product2)}`);

  console.log('\n┌──────────────────────────────────────────────────────────┐');
  console.log('│ REQUEST 3: Get product ABC123 (Cached - INSTANT)         │');
  console.log('└──────────────────────────────────────────────────────────┘');

  const product3 = await service.getProduct('ABC123');
  console.log(`  Result: ${JSON.stringify(product3)}`);

  // ============================================
  // Analysis
  // ============================================

  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ANALYSIS                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log('\n✨ What Happened:');
  console.log('1. Request 1: Entire chain initialized');
  console.log('   - AppConfiguration created (100ms)');
  console.log('   - DatabaseConnection created (150ms)');
  console.log('   - CacheConnection created (75ms)');
  console.log('   - ExternalProductAPIConnector created (200ms)');
  console.log('   - ProductRepository created');
  console.log('   - ProductService created');
  console.log('   - Total initialization: ~525ms');
  console.log('   - Product fetched from API (not in cache)');
  console.log('');
  console.log('2. Request 2: All factories cached, only service logic runs');
  console.log('   - No initialization');
  console.log('   - Product fetched from API (not in cache)');
  console.log('   - Time: ~1ms + API call');
  console.log('');
  console.log('3. Request 3: Cache hit!');
  console.log('   - No initialization');
  console.log('   - No API call');
  console.log('   - Product returned from cache');
  console.log('   - Time: <1ms');

  console.log('\n📊 Performance Impact:');
  console.log('Without Singleton:');
  console.log('  - Each request: 525ms (initialization) + service logic');
  console.log('  - 3 requests: ~1575ms total');
  console.log('');
  console.log('With Singleton:');
  console.log('  - Request 1: 525ms (initialization)');
  console.log('  - Request 2: 1ms (cached)');
  console.log('  - Request 3: <1ms (cache hit)');
  console.log('  - Total: ~526ms (2.99× faster!)');

  console.log('\n🎯 Key Learnings:');
  console.log('✓ Single initialization amortized across many requests');
  console.log('✓ Clear dependency hierarchy prevents circular dependencies');
  console.log('✓ Each layer reuses instances from layers below');
  console.log('✓ Transparent to caller (they just call service.getProduct())');
  console.log('✓ First request pays initialization cost, rest are cheap');
  console.log('✓ Cache layer amplifies benefit (cache hits are instant)');

  console.log('\n💡 Production Considerations:');
  console.log('✓ Monitor initialization times at startup');
  console.log('✓ Implement health checks for singleton dependencies');
  console.log('✓ Plan graceful degradation if cache/DB fails');
  console.log('✓ Document initialization sequence');
  console.log('✓ Provide test hooks (reset/inject) for testing');
  console.log('✓ Consider connection pooling limits');
})();
