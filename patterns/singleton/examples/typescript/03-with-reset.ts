/**
 * Example 3: Testable Factory with Reset & Injection
 *
 * Extended factory pattern with methods for testing.
 * Allows resetting cache and injecting mock instances.
 */

// Enhanced factory with testing capabilities
class TestableSingletonFactory<T> {
  private instance: T | undefined;

  constructor(private factoryFunction: () => T) {}

  /**
   * Get or create the singleton instance
   */
  get(): T {
    if (!this.instance) {
      this.instance = this.factoryFunction();
    }
    return this.instance;
  }

  /**
   * Clear the cached instance (useful for testing)
   */
  reset(): void {
    this.instance = undefined;
  }

  /**
   * Inject a test double or mock instance
   */
  inject(testInstance: T): void {
    this.instance = testInstance;
  }

  /**
   * Check if instance is initialized
   */
  isInitialized(): boolean {
    return this.instance !== undefined;
  }
}

// ============================================
// Service Implementation
// ============================================

interface IUserRepository {
  findById(id: string): Promise<{ id: string; name: string } | null>;
  save(user: { id: string; name: string }): Promise<void>;
}

class UserRepository implements IUserRepository {
  constructor(private dbUrl: string) {
    console.log(`🔌 [REPOSITORY] Connecting to ${dbUrl}`);
  }

  async findById(id: string): Promise<{ id: string; name: string } | null> {
    console.log(`📖 [REPOSITORY] Querying database for user ${id}`);
    // Simulated database query
    return { id, name: 'John Doe' };
  }

  async save(user: { id: string; name: string }): Promise<void> {
    console.log(`💾 [REPOSITORY] Saving user ${user.id} to database`);
  }
}

class UserService {
  constructor(private repository: IUserRepository) {}

  async getUser(id: string): Promise<{ id: string; name: string } | null> {
    return this.repository.findById(id);
  }

  async updateUser(id: string, name: string): Promise<void> {
    await this.repository.save({ id, name });
  }
}

// ============================================
// Factory Setup
// ============================================

const userRepositoryFactory = new TestableSingletonFactory<IUserRepository>(
  () => new UserRepository('mongodb://localhost:27017/myapp')
);

const userServiceFactory = new TestableSingletonFactory<UserService>(
  () => new UserService(userRepositoryFactory.get())
);

// ============================================
// Production Usage
// ============================================

console.log('\n=== Testable Factory Example ===\n');

console.log('Production Code:');
console.log('Request 1:');
(async () => {
  const service = userServiceFactory.get();
  const user = await service.getUser('123');
  console.log(`Result: ${JSON.stringify(user)}\n`);

  // ============================================
  // Testing Example
  // ============================================

  console.log('\n--- TESTING CODE ---\n');

  // Mock repository
  class MockUserRepository implements IUserRepository {
    async findById(id: string): Promise<{ id: string; name: string } | null> {
      console.log(`🧪 [MOCK REPO] Returning mock data for user ${id}`);
      return { id, name: 'Mock User' };
    }

    async save(user: { id: string; name: string }): Promise<void> {
      console.log(`🧪 [MOCK REPO] Mock save for user ${user.id}`);
    }
  }

  console.log('Test 1: Basic user fetch');
  console.log('---');

  // Reset factories to clean state
  userServiceFactory.reset();
  userRepositoryFactory.reset();

  // Inject mock
  const mockRepo = new MockUserRepository();
  userRepositoryFactory.inject(mockRepo);

  // Test the service with mock
  const testService = userServiceFactory.get();
  const mockUser = await testService.getUser('456');
  console.log(`Test Result: ${JSON.stringify(mockUser)}`);

  console.log('\nTest 2: Verify caching');
  console.log('---');

  const service1 = userServiceFactory.get();
  const service2 = userServiceFactory.get();
  console.log(`service1 === service2: ${service1 === service2}`);
  console.log('✅ Same instance reused!');

  console.log('\nTest 3: Reset between tests');
  console.log('---');

  userServiceFactory.reset();
  console.log(`Before reset - initialized: ${userServiceFactory.isInitialized()}`);
  userServiceFactory.get(); // Trigger initialization
  console.log(`After get() - initialized: ${userServiceFactory.isInitialized()}`);

  // ============================================
  // Advanced Testing Pattern
  // ============================================

  console.log('\n\n=== Advanced Testing Pattern ===\n');

  class ErrorThrowingRepository implements IUserRepository {
    async findById(id: string): Promise<{ id: string; name: string } | null> {
      throw new Error('Database connection failed');
    }

    async save(user: { id: string; name: string }): Promise<void> {
      throw new Error('Database connection failed');
    }
  }

  console.log('Test: Error handling');
  console.log('---');

  userServiceFactory.reset();
  userRepositoryFactory.reset();

  const errorRepo = new ErrorThrowingRepository();
  userRepositoryFactory.inject(errorRepo);

  const errorService = userServiceFactory.get();

  try {
    await errorService.getUser('999');
  } catch (error) {
    console.log(`✅ Caught error: ${(error as Error).message}`);
  }

  // ============================================
  // Summary
  // ============================================

  console.log('\n\n=== Summary ===\n');

  console.log('✨ Key Testing Capabilities:');
  console.log('1. reset() - Clear singleton cache between tests');
  console.log('2. inject() - Replace with mock/stub instances');
  console.log('3. isInitialized() - Check if instance was created');
  console.log('');
  console.log('💡 Testing Strategies:');
  console.log('✓ Unit tests: Use constructor injection + mocks');
  console.log('✓ Integration tests: Use real singletons');
  console.log('✓ E2E tests: Let singletons initialize naturally');
  console.log('');
  console.log('🎯 Best Practices:');
  console.log('✓ Always provide reset() for testing');
  console.log('✓ Always provide inject() for mocking');
  console.log('✓ Use interface/abstract class for dependencies');
  console.log('✓ Reset before each test to avoid cross-contamination');
})();
