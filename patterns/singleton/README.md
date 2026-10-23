# Singleton Pattern

> Ensure a class has only one instance and provide a global point of access to it.

## Quick Summary

| Aspect | Details |
|--------|---------|
| **Type** | Creational Design Pattern |
| **Problem** | Need to ensure only one instance of a class exists |
| **Solution** | Restrict instantiation and provide global access |
| **Key Benefit** | Efficient resource management, consistent shared state |
| **Difficulty** | ⭐⭐ Intermediate |

## What It Does

```
One instance = Created once, reused everywhere
```

Instead of creating a new instance every time:
```typescript
// ❌ Without Singleton
const db = new Database();  // Request 1
const db = new Database();  // Request 2 (new instance, wasteful)
const db = new Database();  // Request 3 (new instance, wasteful)

// ✅ With Singleton  
const db = dbFactory.get();  // Request 1 (created, cached)
const db = dbFactory.get();  // Request 2 (reused)
const db = dbFactory.get();  // Request 3 (reused)
```

## When to Use

| Scenario | Use Singleton? | Why |
|----------|----------------|----|
| Database connection | ✅ YES | Expensive initialization, connection pooling |
| Logger service | ✅ YES | Single handler, consistent formatting |
| App configuration | ✅ YES | Load once, reference everywhere |
| External API client | ✅ YES | Reuse auth tokens, respect rate limits |
| Request context | ❌ NO | Must be different per request |
| Lightweight utility | ❌ NO | No initialization cost, not worth it |
| Stateful domain object | ❌ NO | Violates separation of concerns |

## When NOT to Use

- **Request-scoped data** — Use constructor injection or context objects
- **Mutable shared state** — Creates concurrency bugs
- **Stateful objects** — Can't be safely shared
- **Testing doubles** — Hard to mock, complicates tests
- **Lightweight utilities** — No performance benefit

## Real-World Examples

### Example 1: Database Connection
```typescript
// Initialize once, reuse forever
export const databaseFactory = new SingletonFactory(
  () => new Database(config)
);

// In handler
const db = databaseFactory.get();
const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
```

### Example 2: Configuration
```typescript
// Load SSM parameters once at startup
export const configFactory = new SingletonFactory(
  () => new AppConfiguration()  // Reads from AWS SSM
);

// In any service
const apiUrl = configFactory.get().productApiUrl;
```

### Example 3: External API Client
```typescript
// Reuse auth tokens, connection pooling
export const productApiFactory = new SingletonFactory(
  () => new ProductAPIConnector(configFactory.get())
);

// Multiple requests reuse same client
const api = productApiFactory.get();
const product = await api.fetch(articleNumber);
```

## Key Concepts

### 1. Lazy Initialization
Instance is created on **first use**, not at startup.

```typescript
// Created on first call
const instance = singletonFactory.get();  // [INIT - expensive]

// Reused on subsequent calls
const same = singletonFactory.get();       // [CACHED - fast]
```

### 2. Single Instance
Exactly **one object** exists in memory for the entire application lifetime.

### 3. Global Access
Accessible from anywhere without passing it around.

### 4. Caching
Eliminates redundant initialization, improves performance.

## Performance Impact

For a service handling 1000 concurrent requests:

```
Without Singleton:
  Initialization time per request: 500ms
  Total: 500ms × 1000 = 500 seconds 😱

With Singleton:
  Initialization time (first request): 500ms
  Reuse time (remaining requests): 1ms each
  Total: 500ms + (1ms × 999) = 1.5 seconds 🚀

Improvement: 333× faster! 📈
```

## Implementation Approaches

### Approach 1: Static Singleton (Simple)
```typescript
class Database {
  private static instance: Database;
  
  static getInstance(): Database {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}
```

### Approach 2: Factory Pattern (Recommended for TypeScript)
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
```

## Common Pitfalls

1. **Circular Dependencies** — A depends on B, B depends on A
2. **Mutable Shared State** — Multiple requests corrupt each other's state
3. **Hard to Test** — No way to inject mocks
4. **Memory Leaks** — Unbounded singleton growth
5. **Over-singletonization** — Making everything a singleton

→ See [GUIDE.md](./GUIDE.md) for detailed solutions to each pitfall.

## Testing

Singletons complicate testing. Key strategies:

```typescript
// 1. Inject mock instead of singleton
const mockDb = new MockDatabase();
const service = new UserService(mockDb);  // Testable

// 2. Reset singleton between tests
singletonFactory.reset();  // Clear cache

// 3. Inject test instance
singletonFactory.inject(mockDb);  // Use mock
```

→ See [tests/](./tests/) folder for complete testing examples.

## Quick Reference

### Create a Singleton Factory
```typescript
export const myServiceFactory = new SingletonFactory<MyService>(
  () => new MyService(dependencyFactory.get())
);
```

### Use in Application
```typescript
const service = myServiceFactory.get();  // Returns cached instance
service.doWork();
```

### Testing Setup
```typescript
myServiceFactory.reset();         // Clear cache
myServiceFactory.inject(mockObj); // Use mock
```

## Files in This Pattern

- **GUIDE.md** — Complete deep-dive guide (read this for full understanding)
- **examples/typescript/** — Runnable TypeScript implementations
- **examples/generic/** — Language-agnostic pseudocode
- **tests/** — Unit/integration test examples and strategies
- **diagrams/** — Visual explanations
- **real-world/** — Production example from fleet-masterdata-service

## Next Steps

1. **Quick learner?** → Read this file + review examples
2. **Deep understanding?** → Read [GUIDE.md](./GUIDE.md) completely
3. **Hands-on?** → Run `examples/typescript/01-basic.ts`
4. **Testing focus?** → Check `tests/` folder

## Related Patterns

- **Factory Pattern** — Creates instances (often combined with Singleton)
- **Dependency Injection** — Alternative to global singleton access
- **Service Locator** — Anti-pattern that often replaces Singleton

---

**Status:** ✅ Complete  
**Last Updated:** October 23, 2026

**[→ Read the Complete Guide (GUIDE.md)](./GUIDE.md)**
