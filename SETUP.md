# Setup Instructions

This guide will help you set up and run the examples in this repository.

## Prerequisites

- **Node.js** 16+ (https://nodejs.org/)
- **npm** 8+ (comes with Node.js)
- **Git** (https://git-scm.com/)
- A code editor (VS Code recommended)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/system-design-patterns.git
cd system-design-patterns
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install dependencies for TypeScript examples
cd patterns/singleton/examples/typescript
npm install
```

### 3. Verify Setup

```bash
# Run TypeScript compilation
npx tsc --version

# Should output: Version X.X.X
```

## Running Examples

### Run Individual Examples

From the `patterns/singleton/examples/typescript/` directory:

```bash
# Example 1: Basic Singleton
npm run example:01

# Example 2: Factory Pattern (Recommended)
npm run example:02

# Example 3: Testable with Reset/Inject
npm run example:03

# Example 4: Real-World Dependency Chain
npm run example:04

# Example 5: Advanced Patterns
npm run example:05
```

### Run All Examples

```bash
npm run run:all
```

### Run with ts-node directly

```bash
# If npm scripts don't work, run directly with ts-node
npx ts-node 01-basic.ts
npx ts-node 02-factory-pattern.ts
npx ts-node 03-with-reset.ts
npx ts-node 04-dependency-chain.ts
npx ts-node 05-advanced.ts
```

## Learning Path

### For First-Time Learners

1. **Read Overview**
   ```bash
   cat patterns/singleton/README.md
   ```

2. **Watch the progression**
   - Run Example 1 (basic concept)
   - Read its code to understand static singleton
   - Run Example 2 (factory pattern)
   - Notice how it's more flexible

3. **Deep Dive**
   ```bash
   cat patterns/singleton/GUIDE.md
   ```

4. **Run real-world scenario**
   ```bash
   npm run example:04
   ```

### For Experienced Developers

1. **Skim README.md** for quick context
2. **Review GUIDE.md** best practices section
3. **Run Example 4** to see production patterns
4. **Review Example 5** for advanced techniques
5. **Check tests/** for testing strategies

### For Interview Prep

1. **Read:** Pitfalls section in GUIDE.md
2. **Read:** Best Practices section
3. **Code:** Implement from scratch (use examples as reference, not copy)
4. **Test:** Write your own tests
5. **Discuss:** Explain trade-offs and alternatives

## Project Structure

```
system-design-patterns/
├── README.md                                    # Start here
├── SETUP.md                                     # This file
├── CONTRIBUTING.md                              # Contribution guidelines
├── LICENSE                                      # MIT License
│
└── patterns/
    └── singleton/
        ├── README.md                            # Quick overview
        ├── GUIDE.md                             # Complete guide
        │
        ├── examples/
        │   ├── typescript/
        │   │   ├── package.json                 # npm scripts
        │   │   ├── 01-basic.ts
        │   │   ├── 02-factory-pattern.ts
        │   │   ├── 03-with-reset.ts
        │   │   ├── 04-dependency-chain.ts
        │   │   ├── 05-advanced.ts
        │   │   └── tsconfig.json
        │   │
        │   └── generic/
        │       └── pseudocode.md                # Language-agnostic code
        │
        ├── tests/
        │   ├── unit/
        │   ├── integration/
        │   └── patterns/
        │
        ├── diagrams/
        │   ├── initialization-flow.md
        │   ├── dependency-graph.md
        │   └── state-transitions.md
        │
        └── real-world/
            └── fleet-masterdata-service.md      # Production example
```

## Development Commands

```bash
# From patterns/singleton/examples/typescript/

# Run examples
npm run example:01          # Run example 1
npm run run:all             # Run all examples

# Testing (when test files are added)
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test -- --coverage  # Run with coverage report

# Code quality
npm run lint                # Check for linting errors
npm run format              # Format code with Prettier

# Build
npx tsc                     # Compile TypeScript to JavaScript
npx tsc --watch             # Watch mode compilation
```

## Troubleshooting

### `ts-node: command not found`

Install TypeScript globally:
```bash
npm install -g typescript ts-node
```

### `Module not found` errors

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Examples won't run

Check Node.js version:
```bash
node --version  # Should be v16.0.0 or higher
npm --version   # Should be v8.0.0 or higher
```

### Permission denied on shell scripts

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

## Next Steps

1. **Read the docs** - Start with README.md in patterns/singleton/
2. **Run the examples** - Execute all 5 examples to see progression
3. **Study the code** - Review source code and comments
4. **Write tests** - Add your own test cases
5. **Implement yourself** - Code from scratch (no copying)
6. **Discuss** - Explain concepts to someone else
7. **Contribute** - Add improvements or new patterns

## IDE Setup (VS Code)

### Recommended Extensions

```bash
# From command line
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension firsttris.vscode-jest-runner
code --install-extension orta.vscode-jest
```

### Settings (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Additional Resources

- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **Design Patterns:** https://refactoring.guru/design-patterns
- **Node.js Docs:** https://nodejs.org/docs/
- **Jest Testing:** https://jestjs.io/docs/getting-started

## Getting Help

1. **Check CONTRIBUTING.md** for issue guidelines
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Clear title
   - Steps to reproduce
   - Error messages
   - Environment (Node version, OS, etc.)

## Tips for Success

✅ **Do:**
- Run examples multiple times
- Modify examples to experiment
- Write your own implementations
- Discuss concepts out loud
- Read the GUIDE.md thoroughly

❌ **Don't:**
- Just copy code without understanding
- Skip the "Why" and focus only on "How"
- Assume you understand without testing
- Move on before concepts click
- Try all patterns at once

---

**Happy Learning!** 🚀

For questions, check the [FAQ](./README.md#-faq) section in README.md
