/**
 * Example 1: Basic Singleton Implementation
 *
 * The simplest approach using static methods.
 * This is the classic implementation but less flexible for testing.
 */

class Database {
  private static instance: Database | null = null;
  private connectionString: string;

  // Private constructor prevents external instantiation
  private constructor() {
    console.log('📊 [DATABASE] Initializing connection...');
    // Expensive initialization (e.g., connecting to DB)
    this.connectionString = 'mongodb://localhost:27017/myapp';
    console.log('✅ [DATABASE] Connection established');
  }

  // Static method provides global access point
  public static getInstance(): Database {
    if (Database.instance === null) {
      console.log('🔄 [SINGLETON] First call - creating instance');
      Database.instance = new Database();
    } else {
      console.log('♻️  [SINGLETON] Returning cached instance');
    }
    return Database.instance;
  }

  // Example method
  public query(sql: string): string[] {
    console.log(`📝 [QUERY] Executing: ${sql}`);
    return ['result1', 'result2'];
  }
}

// Usage
console.log('\n=== Basic Singleton Example ===\n');

console.log('Request 1:');
const db1 = Database.getInstance();
db1.query('SELECT * FROM users');

console.log('\nRequest 2:');
const db2 = Database.getInstance();
db2.query('SELECT * FROM products');

console.log('\nRequest 3:');
const db3 = Database.getInstance();
db3.query('SELECT COUNT(*) FROM orders');

console.log('\n✅ All requests used the SAME instance:');
console.log(`db1 === db2 === db3: ${db1 === db2 && db2 === db3}`);

console.log('\n📊 Key Points:');
console.log('- Instance created only once (on first call)');
console.log('- All subsequent calls return the same instance');
console.log('- Private constructor prevents new Database()');
console.log('- Static getInstance() method provides access');

console.log('\n⚠️  Limitations of this approach:');
console.log('- Hard to test (cannot mock)');
console.log('- Cannot reset instance between tests');
console.log('- Not thread-safe (in multi-threaded environments)');
console.log('- Tied to static method pattern (inflexible)');
