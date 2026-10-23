# The Singleton Pattern: Complete Guide

> A comprehensive reference on implementing, testing, and troubleshooting the Singleton creational design pattern in production systems.

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Why Use Singletons?](#why-use-singletons)
4. [How It Works](#how-it-works)
5. [Implementation Patterns](#implementation-patterns)
6. [Real-World Production Example](#real-world-production-example)
7. [Testing & Mocking Singletons](#testing--mocking-singletons)
8. [Language Implementations](#language-implementations)
9. [Common Pitfalls](#common-pitfalls)
10. [Best Practices](#best-practices)
11. [Quick Reference](#quick-reference)

---

## Overview

The **Singleton Pattern** is a foundational creational design pattern that solves a critical architectural problem: ensuring a class has exactly **one instance** throughout the application lifetime while providing a **global point of access** to that instance.

### Why This Guide?

This guide documents practical implementations, trade-offs, and lessons learned from implementing singletons in production systems. It bridges the gap between textbook definitions and real-world constraints like testability, concurrency, and dependency management.

---

## Core Concepts

### Simple Definition

```
One instance = Created once, reused everywhere
```

### The Three Pillars

| Pillar | Meaning | Benefit |
|--------|---------|---------|
| **Single Instance** | Exactly one object exists in memory | Consistent state, no duplicates |
| **Lazy Initialization** | Created on first use, not before | Faster startup, minimal memory waste |
| **Global Access** | Accessible from anywhere in the app | Simple, predictable retrieval |

### Mental Model

Think of a singleton like a **library's checkout system**:
- **Without singleton**: Every student carries their own copy of the card catalog (wasteful)
- **With singleton**: All students share one authoritative catalog (efficient, consistent)

---

## Why Use Singletons?

Singletons solve specific resource and performance problems:

| Problem | Without Singleton | With Singleton |
|---------|-------------------|----------------|
| **Database connections** | New connection per request → pool exhaustion | One pooled connection → sustainable load |
| **Configuration loading** | Read SSM/Vault on every request → latency | Load once → subsequent requests fast |
| **External API auth** | New auth token per call → rate limits | Reuse same token → compliant usage |
| **Cache layer** | Multiple cache connections → memory leak | Single Redis connection → efficient |
| **Logger/Telemetry** | Multiple log handlers → duplicate logs | Single handler → consistent output |
| **Heavy initialization** | 50ms init × 1000 requests = 50s wasted | 50ms init × 1 request = 50ms total |

### Quantified Benefits

In a production service handling 1000 concurrent requests:

```
Database connections:    500 → 10 (98% reduction)
Memory footprint:        2GB → 200MB (90% reduction)
Config reads/sec:        1000 → 1 (99.9% reduction)
P95 latency:             250ms → 45ms (82% improvement)
```

---

## How It Works

### Conceptual Flow

**First Request:**
```
Client Request
    ↓
Check: Singleton instance exists?
    ↓ NO
Execute factory/constructor
    ↓
Initialize expensive resources (DB, config, etc.)
    ↓
Store instance in memory (cache)
    ↓
Return instance to caller
    ↓
[Instance now resident in memory for lifetime]
```

**Second+ Requests:**
```
Client Request
    ↓
Check: Singleton instance exists?
    ↓ YES
Return cached instance (instant)
    ↓
[No initialization, no resource allocation]
```

### Implementation Mechanics

#### TypeScript/JavaScript Pattern (Lazy Initialization)

```typescript
class Singleton<T> {
  private static instance: T | null = null;
  
  // Private constructor prevents external instantiation
  private constructor() {}
  
  public static getInstance(): T {
    if (Singleton.instance === null) {
      // Create only on first call
      Singleton.instance = new Singleton<T>();
    }
    // Return cached instance
    return Singleton.instance;
  }
}
```

#### Factory Pattern (Recommended for TypeScript)

```typescript
class MyService {
  constructor(private config: Config) {}
  
  doWork() {
    return `Working with ${this.config.apiKey}`;
  }
}

class SingletonFactory<T> {
  private instance: T | undefined;
  
  constructor(private factory: () => T) {}
  
  get(): T {
    if (!this.instance) {
      this.instance = this.factory();  // Create once
    }
    return this.instance;  // Return cached
  }
}

// Usage
export const myServiceFactory = new SingletonFactory<MyService>(
  () => new MyService(new Config())
);

// Caller never knows about caching - transparent
const service = myServiceFactory.get();
```

---

## Implementation Patterns

### Pattern 1: Basic Singleton with Factory

```typescript
import { SingletonFactory } from './singleton-factory';

// Define your class
export class DatabaseConnection {
  private pool: ConnectionPool;
  
  constructor(private config: DatabaseConfig) {
    this.pool = new ConnectionPool(config);
  }
  
  async query(sql: string): Promise<any[]> {
    return this.pool.query(sql);
  }
}

// Create factory (typically exported from a module)
export const databaseFactory = new SingletonFactory<DatabaseConnection>(
  () => new DatabaseConnection(new DatabaseConfig())
);

// Usage in application
async function getUserById(id: string) {
  const db = databaseFactory.get();  // First call: creates, second+: cached
  return db.query(`SELECT * FROM users WHERE id = ${id}`);
}
```

### Pattern 2: Dependency Injection Chain (Layered)

```typescript
// Layer 1: Configuration (no dependencies)
export const configFactory = new SingletonFactory(() => 
  new AppConfiguration()
);

// Layer 2: Infrastructure (depends on Layer 1)
export const databaseFactory = new SingletonFactory(() => 
  new Database(configFactory.get())
);

// Layer 3: Repository (depends on Layer 2)
export const userRepositoryFactory = new SingletonFactory(() => 
  new UserRepository(databaseFactory.get())
);

// Layer 4: Service (depends on Layer 3)
export const userServiceFactory = new SingletonFactory(() => 
  new UserService(userRepositoryFactory.get())
);

// Layer 5: Router (depends on Layer 4)
export function setupRouter(app: Express) {
  const userService = userServiceFactory.get();
  
  app.get('/users/:id', async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  });
}
```

### Pattern 3: Multiple Dependencies

```typescript
export class OrderProcessingService {
  constructor(
    private inventory: InventoryService,
    private payment: PaymentGateway,
    private notifications: NotificationService,
    private logger: Logger
  ) {}
  
  async processOrder(order: Order) {
    // Each dependency is also a singleton
    // Reused across all order processing
  }
}

export const orderProcessingServiceFactory = new SingletonFactory<OrderProcessingService>(
  () => new OrderProcessingService(
    inventoryServiceFactory.get(),
    paymentGatewayFactory.get(),
    notificationServiceFactory.get(),
    loggerFactory.get()
  )
);
```

### Pattern 4: Reset for Testing

```typescript
class TestableSingletonFactory<T> extends SingletonFactory<T> {
  // Expose method to clear cache for testing
  reset(): void {
    this.instance = undefined;
  }
  
  // Inject a test double
  inject(instance: T): void {
    this.instance = instance;
  }
}

// Usage in tests
const mockService = new MockUserService();
userServiceFactory.inject(mockService);
// All subsequent calls use the mock
```

---

## Real-World Production Example

### Scenario: Product Information Microservice

Endpoint: `GET /products/:articleNumber`

Each request needs:
- MongoDB connection
- External Product API connector
- Redis cache
- AWS SSM configuration
- Logging service

### ❌ Problem: Without Singletons

```typescript
// Every request creates new instances
app.get('/products/:articleNumber', async (req, res) => {
  const config = new AppConfiguration();              // NEW
  const db = new MongoDB(config);                     // NEW
  const apiConnector = new ProductAPIConnector(config); // NEW
  const cache = new RedisCache(config);               // NEW
  const logger = new Logger(config);                  // NEW
  
  // Cost per request:
  // - 5 SSM reads
  // - 5 new connection attempts
  // - ~500ms initialization
  // - Memory spikes
  
  const product = await apiConnector.fetch(req.params.articleNumber);
  res.json(product);
});
```

### ✅ Solution: With Singletons

```typescript
// Create factory chain once at startup
const configFactory = new SingletonFactory(() => new AppConfiguration());
const dbFactory = new SingletonFactory(() => new MongoDB(configFactory.get()));
const apiFactory = new SingletonFactory(() => new ProductAPIConnector(configFactory.get()));
const cacheFactory = new SingletonFactory(() => new RedisCache(configFactory.get()));
const loggerFactory = new SingletonFactory(() => new Logger(configFactory.get()));

// First request: initialization
app.get('/products/:articleNumber', async (req, res) => {
  const connector = apiFactory.get();  // [CREATE + CACHE]
  const cache = cacheFactory.get();    // [CREATE + CACHE]
  const logger = loggerFactory.get();  // [CREATE + CACHE]
  
  const product = await connector.fetch(req.params.articleNumber);
  res.json(product);
});

// Second+ requests: use cached instances
app.get('/products/:articleNumber', async (req, res) => {
  const connector = apiFactory.get();  // [CACHED] ✅
  const cache = cacheFactory.get();    // [CACHED] ✅
  const logger = loggerFactory.get();  // [CACHED] ✅
  
  const product = await connector.fetch(req.params.articleNumber);
  res.json(product);
});
```

### Performance Comparison

```
Request 1:
  ├─ ConfigFactory.get()     [INIT] ← 50ms (SSM reads)
  ├─ DatabaseFactory.get()   [INIT] ← 100ms (connection)
  ├─ APIFactory.get()        [INIT] ← 150ms (auth handshake)
  ├─ CacheFactory.get()      [INIT] ← 75ms (Redis connect)
  ├─ LoggerFactory.get()     [INIT] ← 25ms
  └─ Total: ~400ms

Requests 2-1000:
  ├─ ConfigFactory.get()     [CACHED] ← <1ms
  ├─ DatabaseFactory.get()   [CACHED] ← <1ms
  ├─ APIFactory.get()        [CACHED] ← <1ms
  ├─ CacheFactory.get()      [CACHED] ← <1ms
  ├─ LoggerFactory.get()     [CACHED] ← <1ms
  └─ Total: ~5ms each

Savings: 995 requests × (400ms - 5ms) = ~396 seconds saved!
```

---

## Testing & Mocking Singletons

### The Challenge

Singletons create a global dependency, making unit tests tricky:

```typescript
// ❌ Hard to test: DatabaseFactory is global state
export const databaseFactory = new SingletonFactory(
  () => new Database()
);

describe('UserService', () => {
  test('should fetch user', async () => {
    // Problem: Uses real database, not mock
    const service = userServiceFactory.get();
    const user = await service.getUser('123');
    expect(user).toBeDefined();
  });
});
```

### Solution 1: Injection Point in Tests

```typescript
class MockDatabase extends Database {
  async query(sql: string) {
    if (sql.includes('SELECT')) {
      return [{ id: '123', name: 'Mock User' }];
    }
  }
}

// Create a test factory
const testDatabaseFactory = new SingletonFactory<Database>(
  () => new MockDatabase()
);

describe('UserService', () => {
  test('should fetch user', async () => {
    // Use test factory instead
    const service = new UserService(testDatabaseFactory.get());
    const user = await service.getUser('123');
    expect(user.name).toBe('Mock User');
  });
});
```

### Solution 2: Factory Reset Pattern

```typescript
class ResettableSingletonFactory<T> {
  private instance: T | undefined;
  private readonly factoryFunction: () => T;
  
  constructor(factory: () => T) {
    this.factoryFunction = factory;
  }
  
  get(): T {
    if (!this.instance) {
      this.instance = this.factoryFunction();
    }
    return this.instance;
  }
  
  // ✅ For testing: clear cache
  reset(): void {
    this.instance = undefined;
  }
  
  // ✅ For testing: inject mock
  inject(testInstance: T): void {
    this.instance = testInstance;
  }
}

// Usage in tests
export const databaseFactory = new ResettableSingletonFactory(
  () => new Database()
);

describe('UserService', () => {
  beforeEach(() => {
    // Clean slate for each test
    databaseFactory.reset();
  });
  
  test('should handle database errors', async () => {
    // Inject mock that throws
    const mockDb = new MockDatabase();
    mockDb.throwError = true;
    databaseFactory.inject(mockDb);
    
    const service = new UserService(databaseFactory.get());
    await expect(service.getUser('123')).rejects.toThrow();
  });
  
  afterEach(() => {
    // Restore for next test
    databaseFactory.reset();
  });
});
```

### Solution 3: Dependency Inversion (Constructor Injection)

```typescript
// Instead of accessing factory globally, inject dependency
export class UserService {
  constructor(private database: Database) {}
  
  async getUser(id: string): Promise<User> {
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// Production: Use singleton
const prodService = new UserService(databaseFactory.get());

// Testing: Use mock
describe('UserService', () => {
  test('should fetch user', async () => {
    const mockDb = new MockDatabase();
    const service = new UserService(mockDb);  // ✅ Testable!
    
    const user = await service.getUser('123');
    expect(user).toBeDefined();
  });
});
```

### Solution 4: Integration Test with Real Singleton

```typescript
// For integration tests: use real instances
describe('UserService Integration', () => {
  let userService: UserService;
  
  beforeAll(async () => {
    // Initialize singletons once for entire test suite
    userService = userServiceFactory.get();
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    // Cleanup
    await teardownTestDatabase();
  });
  
  test('should fetch user from database', async () => {
    // Real test: queries actual test DB
    const user = await userService.getUser('123');
    expect(user).toBeDefined();
  });
  
  test('should cache results', async () => {
    // Verify singleton reuse
    const service1 = userServiceFactory.get();
    const service2 = userServiceFactory.get();
    expect(service1).toBe(service2);  // Same object!
  });
});
```

### Recommended Testing Strategy

```
┌─────────────────────────────────────────┐
│         Testing Strategy                │
├─────────────────────────────────────────┤
│ Unit Tests (Fast, No DB)                │
│  └─ Constructor injection               │
│  └─ Mock all dependencies               │
│  └─ Test business logic only            │
│                                         │
│ Integration Tests (Slower, With DB)     │
│  └─ Use real singletons                 │
│  └─ Reset between tests (or use suites) │
│  └─ Test actual interactions            │
│                                         │
│ E2E Tests (Full app)                    │
│  └─ Let singletons initialize naturally │
│  └─ Test complete request flows         │
│  └─ Verify caching behavior             │
└─────────────────────────────────────────┘
```

---

## Language Implementations

### TypeScript/JavaScript (Recommended Pattern)

```typescript
class SingletonFactory<T> {
  private instance: T | undefined;
  
  constructor(private factory: () => T) {}
  
  get(): T {
    if (!this.instance) {
      this.instance = this.factory();
    }
    return this.instance;
  }
}

export const databaseFactory = new SingletonFactory(
  () => new Database()
);

const db = databaseFactory.get();
```

**Why factory over static?** Easier to test, supports mocking, more functional.

### Java (Classic Implementation)

```java
public class Database {
  private static Database instance;
  
  private Database() {
    // Private constructor
  }
  
  public static synchronized Database getInstance() {
    if (instance == null) {
      instance = new Database();
    }
    return instance;
  }
}

Database db = Database.getInstance();
```

**Note:** Must use `synchronized` for thread safety.

### Python (Module-Level Singleton)

```python
class Database:
  def __init__(self):
    self.connection = None
  
  def connect(self):
    if not self.connection:
      self.connection = create_connection()
    return self.connection

# Module-level singleton (simplest in Python)
database = Database()

# Usage
connection = database.connect()
```

**Python pattern:** Often use module-level instances or decorators, less verbose than Java.

### Go (Sync.Once Pattern)

```go
package database

import "sync"

var (
  db *Database
  once sync.Once
)

func GetDatabase() *Database {
  once.Do(func() {
    db = &Database{} // Create once
  })
  return db
}
```

**Why sync.Once?** Thread-safe, idiomatic Go.

### C# (.NET)

```csharp
public sealed class Database {
  private static readonly Lazy<Database> instance = 
    new Lazy<Database>(() => new Database());
  
  public static Database Instance => instance.Value;
  
  private Database() { }
}

var db = Database.Instance;
```

**Why Lazy<T>?** Thread-safe and concise.

---

## Common Pitfalls

### ❌ Pitfall 1: Circular Dependencies

```typescript
// ❌ BAD: A → B → A (infinite loop)
export const serviceAFactory = new SingletonFactory(() =>
  new ServiceA(serviceBFactory.get())
);

export const serviceBFactory = new SingletonFactory(() =>
  new ServiceB(serviceAFactory.get())
);

// Result: Stack overflow when either factory.get() is called
```

**Root Cause:** Singletons amplify architectural issues.

**Solution:** Restructure for unidirectional dependency:

```typescript
// ✅ GOOD: Clear dependency direction
export const baseServiceFactory = new SingletonFactory(() =>
  new BaseService()  // No dependencies
);

export const serviceAFactory = new SingletonFactory(() =>
  new ServiceA(baseServiceFactory.get())  // Depends on base
);

export const serviceBFactory = new SingletonFactory(() =>
  new ServiceB(serviceAFactory.get())  // Depends on A
);

// Call order: baseServiceFactory → serviceAFactory → serviceBFactory
```

**Dependency Graph Visualization:**

```
BaseService
    ↑
    │ (depends on)
ServiceA
    ↑
    │ (depends on)
ServiceB

✅ Linear, no cycles
```

### ❌ Pitfall 2: Mutable Shared State

```typescript
// ❌ BAD: Singleton holds request-scoped data
export class UserContext {
  currentUser: User;  // ← Shared across ALL requests!
  
  setUser(user: User) {
    this.currentUser = user;  // Thread-unsafe mutation
  }
}

// Request 1 (Thread A)
userContext.setUser(alice);

// Request 2 (Thread B) 
userContext.setUser(bob);

// Request 1 continues, expects alice, but sees bob! ← BUG
```

**Problem:** Singletons are shared across concurrent requests; mutations cause data corruption.

**Solutions:**

```typescript
// ✅ Option 1: No mutable state
export class UserService {
  getUser(userId: string): User {
    // Returns different data per request
    return this.repository.find(userId);
  }
}

// ✅ Option 2: Request-scoped context (not singleton)
export class RequestContext {
  private requestStore = new WeakMap<Request, UserData>();
  
  setUser(req: Request, user: User) {
    this.requestStore.set(req, user);  // Keyed per request
  }
  
  getUser(req: Request): User {
    return this.requestStore.get(req);
  }
}

// ✅ Option 3: Immutable singleton
export class ImmutableConfig {
  readonly apiKey: string;
  readonly dbUrl: string;
  
  // No setters, no mutations
  constructor(apiKey: string, dbUrl: string) {
    this.apiKey = apiKey;
    this.dbUrl = dbUrl;
  }
}
```

### ❌ Pitfall 3: Testing Nightmare (No Reset)

```typescript
// ❌ BAD: No way to clear singleton between tests
export const databaseFactory = new SingletonFactory(
  () => new Database()
);

describe('Tests', () => {
  test('Test 1', () => {
    databaseFactory.get().insertUser('Alice');
  });
  
  test('Test 2', () => {
    // Still has Alice from Test 1! Test isolation broken.
    const users = databaseFactory.get().getUsers();
    expect(users.length).toBe(0);  // ← FAILS
  });
});
```

**Solution:** Provide reset/injection methods (see Testing section).

### ❌ Pitfall 4: Premature Singletonization

```typescript
// ❌ BAD: Singleton everything
const userServiceFactory = new SingletonFactory(() => new UserService());
const helperFactory = new SingletonFactory(() => new Helper());
const utilFactory = new SingletonFactory(() => new Util());
const formatterFactory = new SingletonFactory(() => new Formatter());
const validatorFactory = new SingletonFactory(() => new Validator());
// ... 50 more factories

// Creates noise, adds complexity, no benefit
```

**Rule:** Only singleton expensive resources

```typescript
// ✅ GOOD: Only cache what matters
const databaseFactory = new SingletonFactory(() => new Database());       // Expensive ✓
const configFactory = new SingletonFactory(() => new Config());           // SSM reads ✓
const cacheFactory = new SingletonFactory(() => new Redis());             // Connection ✓

// Don't singleton these:
const transformer = new Transformer();  // Stateless, lightweight
const validator = new Validator();      // Fast, no I/O
const helper = helper();                // Simple function
```

### ❌ Pitfall 5: Memory Leaks

```typescript
// ❌ BAD: Singleton grows unbounded
export class EventCache {
  private events: Event[] = [];
  
  addEvent(event: Event) {
    this.events.push(event);  // Never cleared! → Memory leak
  }
}

// After 1M requests: 1M events in memory forever
```

**Solution:** Implement cache eviction

```typescript
// ✅ GOOD: Bounded cache
export class EventCache {
  private events: Event[] = [];
  private maxSize = 10000;
  
  addEvent(event: Event) {
    this.events.push(event);
    
    // Evict oldest if full
    if (this.events.length > this.maxSize) {
      this.events.shift();  // Remove oldest
    }
  }
}

// Or use LRU cache library
import LRU from 'lru-cache';

export const eventCacheFactory = new SingletonFactory(() =>
  new LRU({ max: 10000, ttl: 1000 * 60 * 5 })  // 5 min TTL
);
```

---

## Best Practices

### 1. Use Factory Pattern (Not Static Methods)

```typescript
// ❌ Less flexible
class Database {
  static getInstance() { return db; }
}

// ✅ More flexible
class SingletonFactory<T> {
  get(): T { /* ... */ }
}

// Why? Easier to mock, test, and reason about
```

### 2. Clear Dependency Graph

```typescript
// ✅ GOOD: Obvious what depends on what
const layer1 = new SingletonFactory(() => new Config());
const layer2 = new SingletonFactory(() => new Database(layer1.get()));
const layer3 = new SingletonFactory(() => new Service(layer2.get()));

// Reading the code tells the story
```

### 3. Lazy Initialization by Default

```typescript
// ✅ GOOD: Create only when needed
const dbFactory = new SingletonFactory(() => new Database());

// At startup: nothing happens
// On first request: database initializes
// Subsequent requests: cached instance

// ✅ GOOD: Deferring initialization to request time
function setupRoutes(app: Express) {
  const service = serviceFactory.get();  // Lazy: init here
  app.get('/endpoint', (req, res) => {
    // Use service
  });
}
```

### 4. Thread-Safe (if needed)

```typescript
// TypeScript in Node.js: Single-threaded, no lock needed
let instance: T | undefined;

// ✅ Java: Add synchronization
public synchronized T get() {
  if (instance == null) {
    instance = factory();
  }
  return instance;
}

// ✅ Go: Use sync.Once
sync.Once can be used
```

### 5. Document the Dependency Chain

```typescript
/**
 * Singleton Factory for UserService
 * 
 * Dependency Chain:
 *   Config (SSM reads: 50ms)
 *     ↓
 *   Database (connection: 100ms)
 *     ↓
 *   UserRepository (initialization: 10ms)
 *     ↓
 *   UserService (ready for use)
 * 
 * First call: ~160ms
 * Cached calls: <1ms
 */
export const userServiceFactory = new SingletonFactory(
  () => new UserService(/* dependencies */)
);
```

### 6. Expose Reset/Inject for Testing

```typescript
// ✅ Always provide test hooks
export class TestableFactory<T> {
  private instance: T | undefined;
  
  get(): T {
    if (!this.instance) {
      this.instance = this.create();
    }
    return this.instance;
  }
  
  // For unit tests
  reset(): void {
    this.instance = undefined;
  }
  
  // For mocking
  inject(testInstance: T): void {
    this.instance = testInstance;
  }
  
  protected create(): T {
    throw new Error('Implement in subclass');
  }
}
```

### 7. Consider Alternatives First

Ask: "Do I really need a singleton?"

| Need | Solution |
|------|----------|
| Single connection pool | Use connection pool library (not singleton) |
| Shared config | Environment variables or config service |
| Logger | Logging library (has own pooling) |
| Cache | Cache library (Redis, Memcached) |
| Database | ORM with connection pool |

**Singleton is best when:** You're wrapping something that's already expensive and you control the initialization.

---

## Quick Reference

### When to Use Singleton

| Use Case | Example | Benefit |
|----------|---------|---------|
| Database connection | MongoDB, PostgreSQL | Reuse connection, avoid exhaustion |
| External API client | PayPal, Stripe API | Reuse auth, respect rate limits |
| Configuration | App settings from SSM/Vault | Load once, reference forever |
| Cache/Redis | Session cache, user cache | Single connection, efficient |
| Logger | Structured logging service | Consistent format, single handler |
| Thread/execution pool | Worker threads, async tasks | Reuse resources, avoid thrashing |

### When NOT to Use Singleton

| Case | Why Not | Do This Instead |
|------|---------|-----------------|
| Request-scoped data | Mutations across requests | Pass as parameter, use context |
| Stateful objects | Hard to reset in tests | Create new per request/test |
| Lightweight utilities | No performance benefit | Regular class/function |
| Domain entities | Violates DDD principles | Use repository pattern |
| Test doubles | Hard to mock | Dependency injection |

### Templates

#### Basic Template

```typescript
import { SingletonFactory } from './singleton-factory';

export class MyClass {
  constructor(private config: Config) {}
  doWork() { /* ... */ }
}

export const myClassFactory = new SingletonFactory<MyClass>(
  () => new MyClass(new Config())
);

// Usage
const instance = myClassFactory.get();
instance.doWork();
```

#### Dependency Chain Template

```typescript
// L1: Configuration
export const configFactory = new SingletonFactory(() => 
  new Configuration()
);

// L2: Infrastructure
export const databaseFactory = new SingletonFactory(() => 
  new Database(configFactory.get())
);

// L3: Repository
export const userRepositoryFactory = new SingletonFactory(() => 
  new UserRepository(databaseFactory.get())
);

// L4: Service
export const userServiceFactory = new SingletonFactory(() => 
  new UserService(userRepositoryFactory.get())
);

// L5: Router
export function setupRouter(app: Express) {
  const service = userServiceFactory.get();
  app.get('/users/:id', (req, res) => service.getUser(req.params.id));
}
```

#### Testing Template

```typescript
describe('UserService', () => {
  let mockDatabase: MockDatabase;
  let userService: UserService;
  
  beforeEach(() => {
    // Inject mock for each test
    mockDatabase = new MockDatabase();
    userService = new UserService(mockDatabase);
  });
  
  test('should fetch user', async () => {
    mockDatabase.mockUser = { id: '123', name: 'Test' };
    const user = await userService.getUser('123');
    expect(user.name).toBe('Test');
  });
});
```

### Initialization Checklist

- [ ] Identify expensive resource (DB, API, config)
- [ ] Wrap in factory function
- [ ] Add lazy initialization check
- [ ] Cache instance in closure/class variable
- [ ] Return cached instance on subsequent calls
- [ ] Provide `reset()` for testing
- [ ] Document the initialization cost
- [ ] Add to dependency graph documentation
- [ ] Consider thread safety (if multi-threaded)
- [ ] Plan testing strategy

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| **One instance** | Created once, reused forever |
| **Lazy initialization** | Created on first call, not startup |
| **Global access** | Visible throughout application |
| **Caching** | Eliminates redundant initialization |
| **Testability** | Requires reset/injection hooks |
| **Thread safety** | Use synchronization when needed |
| **Performance** | First request initializes, rest are fast |
| **Resource efficiency** | Single DB/API connection saves resources |

---

## References & Further Reading

### Classic Resources
- Gang of Four: *Design Patterns* (Singleton chapter)
- Refactoring Guru: https://refactoring.guru/design-patterns/singleton

### Implementation References

- **TypeScript/Node.js:** This guide (Factory pattern recommended)
- **Java:** Use `Lazy<T>` or `synchronized getInstance()`
- **Python:** Module-level instances or decorators
- **Go:** `sync.Once` pattern

### Related Patterns

- **Factory Pattern:** Creates instances (often combined with Singleton)
- **Dependency Injection:** Alternative to singleton access
- **Service Locator:** Anti-pattern often replacing Singleton
- **Monostate:** "Singleton lite" - all instances share state

---

**Last Updated:** October 23, 2026  
**Status:** Production-Ready ✅

---

## Appendix: Production Checklist

Before deploying a singleton-based system:

- [ ] All factories have `get()` method
- [ ] No mutable shared state in singletons
- [ ] Dependency graph is acyclic
- [ ] Unit tests mock dependencies
- [ ] Integration tests reset between suites
- [ ] Startup time acceptable (<500ms)
- [ ] Memory footprint acceptable
- [ ] Thread-safety verified (if multi-threaded)
- [ ] Logging shows initialization sequence
- [ ] Failover strategy documented
- [ ] Rollback plan exists
