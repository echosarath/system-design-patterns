# Singleton Pattern: Language-Agnostic Pseudocode

This document shows the Singleton pattern in pseudocode, independent of any specific programming language.

## Basic Implementation

```pseudocode
CLASS Singleton
  PRIVATE STATIC instance = NULL
  
  PRIVATE CONSTRUCTOR()
    // Private: prevents external instantiation
  END
  
  PUBLIC STATIC getInstance()
    IF instance is NULL
      instance = NEW Singleton()
    END
    RETURN instance
  END
END

// Usage
singleton1 = Singleton.getInstance()    // First call: creates instance
singleton2 = Singleton.getInstance()    // Second call: returns same instance
singleton3 = Singleton.getInstance()    // Third call: returns same instance

ASSERT singleton1 == singleton2 == singleton3
```

## Factory Pattern (Recommended)

```pseudocode
CLASS SingletonFactory<T>
  PRIVATE instance = NULL
  PRIVATE factoryFunction = NULL
  
  CONSTRUCTOR(factory)
    factoryFunction = factory
  END
  
  PUBLIC get()
    IF instance is NULL
      instance = factoryFunction()
    END
    RETURN instance
  END
END

// Usage
myFactory = NEW SingletonFactory(() => NEW MyClass())

obj1 = myFactory.get()  // First: creates
obj2 = myFactory.get()  // Second: returns cached
obj3 = myFactory.get()  // Third: returns cached

ASSERT obj1 == obj2 == obj3
```

## Dependency Injection Chain

```pseudocode
// Layer 1: Configuration
configFactory = NEW SingletonFactory(
  () => NEW Config()
)

// Layer 2: Database (depends on config)
dbFactory = NEW SingletonFactory(
  () => NEW Database(configFactory.get())
)

// Layer 3: Repository (depends on database)
repoFactory = NEW SingletonFactory(
  () => NEW Repository(dbFactory.get())
)

// Layer 4: Service (depends on repository)
serviceFactory = NEW SingletonFactory(
  () => NEW Service(repoFactory.get())
)

// Usage
service = serviceFactory.get()
result = service.doSomething()

// All dependencies are reused across requests
service2 = serviceFactory.get()
ASSERT service == service2
```

## Testable Factory with Reset and Injection

```pseudocode
CLASS TestableSingletonFactory<T>
  PRIVATE instance = NULL
  PRIVATE factoryFunction = NULL
  
  CONSTRUCTOR(factory)
    factoryFunction = factory
  END
  
  PUBLIC get()
    IF instance is NULL
      instance = factoryFunction()
    END
    RETURN instance
  END
  
  PUBLIC reset()
    instance = NULL  // Clear cache for testing
  END
  
  PUBLIC inject(mockInstance)
    instance = mockInstance  // Replace with mock
  END
END

// Usage in production
userServiceFactory = NEW TestableSingletonFactory(
  () => NEW UserService(database)
)

service = userServiceFactory.get()

// Usage in tests
beforeEach()
  userServiceFactory.reset()
END

test("should fetch user")
  mockDb = NEW MockDatabase()
  userServiceFactory.inject(NEW UserService(mockDb))
  
  service = userServiceFactory.get()
  result = service.getUser("123")
  
  ASSERT result.name == "John Doe"
END
```

## Async Factory Pattern

```pseudocode
CLASS AsyncSingletonFactory<T>
  PRIVATE instance = NULL
  PRIVATE initPromise = NULL
  PRIVATE asyncFactory = NULL
  
  CONSTRUCTOR(asyncFactory)
    asyncFactory = asyncFactory
  END
  
  PUBLIC ASYNC get()
    IF instance is NOT NULL
      RETURN instance
    END
    
    IF initPromise is NOT NULL
      RETURN AWAIT initPromise
    END
    
    initPromise = asyncFactory()
      .THEN(instance => {
        instance = instance
        RETURN instance
      })
    
    RETURN AWAIT initPromise
  END
END

// Usage
dbFactory = NEW AsyncSingletonFactory(
  ASYNC () => {
    db = NEW Database()
    AWAIT db.connect()
    RETURN db
  }
)

// First request: initializes
db1 = AWAIT dbFactory.get()  // Connects to database

// Concurrent requests: wait for same initialization
db2 = AWAIT dbFactory.get()
db3 = AWAIT dbFactory.get()

ASSERT db1 == db2 == db3
```

## Circular Dependency Detection

```pseudocode
CLASS CircularDependencyDetectingFactory<T>
  PRIVATE instance = NULL
  PRIVATE isInitializing = FALSE
  PRIVATE initStack = []
  PRIVATE factoryName = ""
  
  CONSTRUCTOR(factory, name)
    factoryName = name
    factory = factory
  END
  
  PUBLIC get()
    IF instance is NOT NULL
      RETURN instance
    END
    
    IF isInitializing is TRUE
      stack = initStack.JOIN(" → ")
      THROW ERROR("Circular dependency: " + stack + " → " + factoryName)
    END
    
    isInitializing = TRUE
    initStack.PUSH(factoryName)
    
    TRY
      instance = factory()
      initStack.POP()
      RETURN instance
    CATCH error
      isInitializing = FALSE
      THROW error
    END
  END
END

// Circular dependency example (BAD)
serviceAFactory = NEW CircularDependencyDetectingFactory(
  () => NEW ServiceA(serviceBFactory.get()),
  "ServiceA"
)

serviceBFactory = NEW CircularDependencyDetectingFactory(
  () => NEW ServiceB(serviceAFactory.get()),
  "ServiceB"
)

// This will throw an error
TRY
  serviceAFactory.get()  // ❌ ERROR: Circular dependency detected!
CATCH error
  PRINT error.message
  // Output: "Circular dependency: ServiceA → ServiceB → ServiceA"
END
```

## Bounded Cache (Prevent Memory Leaks)

```pseudocode
CLASS BoundedCacheSingleton<T>
  PRIVATE instance = NULL
  PRIVATE createdAt = 0
  PRIVATE ttlMs = 0
  PRIVATE factoryFunction = NULL
  
  CONSTRUCTOR(factory, ttlSeconds)
    factoryFunction = factory
    ttlMs = ttlSeconds * 1000
  END
  
  PUBLIC get()
    now = CURRENT_TIME_MS()
    
    // Check if instance exists and hasn't expired
    IF instance is NOT NULL AND (now - createdAt) < ttlMs
      RETURN instance
    END
    
    // Create new instance
    instance = factoryFunction()
    createdAt = now
    RETURN instance
  END
  
  PUBLIC getMetrics()
    now = CURRENT_TIME_MS()
    ageMs = now - createdAt
    isExpired = ageMs >= ttlMs
    
    RETURN {
      isInitialized: instance is NOT NULL,
      ageMs: ageMs,
      ttlMs: ttlMs,
      isExpired: isExpired
    }
  END
END

// Usage
cacheFactory = NEW BoundedCacheSingleton(
  () => NEW Cache(),
  3600  // 1 hour TTL
)

cache1 = cacheFactory.get()
cache2 = cacheFactory.get()
ASSERT cache1 == cache2  // Same instance

WAIT 3601 SECONDS

cache3 = cacheFactory.get()
ASSERT cache1 != cache3  // Different instance (expired)
```

## Common Patterns Comparison

### Pattern 1: Static Singleton
```pseudocode
// Simplest, but least flexible
Database.getInstance()
Database.getInstance()
```
**Pros:** Simple, familiar  
**Cons:** Hard to test, hard to mock, not thread-safe

### Pattern 2: Factory Pattern
```pseudocode
// Recommended, more flexible
databaseFactory.get()
databaseFactory.get()
```
**Pros:** Easy to test, mockable, composable  
**Cons:** Slightly more code

### Pattern 3: Dependency Injection
```pseudocode
// Pass instances as parameters
service = NEW Service(database)
```
**Pros:** Very testable, explicit dependencies  
**Cons:** Requires passing dependencies everywhere

### Pattern 4: Service Locator
```pseudocode
// Anti-pattern, avoid
services.get("database")
services.get("database")
```
**Pros:** Flexible  
**Cons:** Hidden dependencies, hard to test, breaks encapsulation

## Best Practices Checklist

- [ ] Use Factory Pattern (not static methods)
- [ ] Lazy initialization (create on first use)
- [ ] Clear unidirectional dependency graph
- [ ] Provide reset() for testing
- [ ] Provide inject() for mocking
- [ ] No mutable shared state
- [ ] Document initialization sequence
- [ ] Consider TTL for cached data
- [ ] Detect circular dependencies
- [ ] Thread-safe (if multi-threaded)

## Summary Table

| Aspect | Static Singleton | Factory Pattern | Dependency Injection |
|--------|------------------|-----------------|----------------------|
| **Testability** | Poor | Good | Excellent |
| **Complexity** | Low | Medium | High |
| **Flexibility** | Low | High | Very High |
| **Mockability** | Difficult | Easy | Easy |
| **Recommended?** | No | **YES** | For complex systems |
| **Learning Curve** | Very Low | Low | Medium |

## Real-World Application Flow

```
User Request
  ↓
Router calls Service
  ↓
Service needs Database
  ↓
databaseFactory.get()
  ├─ First call: Create Database instance
  │  ├─ Read configuration
  │  ├─ Establish connection
  │  └─ Cache in factory
  └─ Subsequent calls: Return cached instance
  ↓
Query executes
  ↓
Response sent to user

All subsequent requests reuse cached Database instance!
```

---

**Key Takeaway:** The Singleton Pattern ensures one instance is created once and reused everywhere, eliminating expensive re-initialization while maintaining simplicity and consistency.
