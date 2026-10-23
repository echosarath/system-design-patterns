# System Design Patterns

> A comprehensive collection of design patterns, programming paradigms, and architectural approaches with detailed explanations, real-world examples, and production-ready implementations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Last Updated](https://img.shields.io/badge/last%20updated-2026--10-brightgreen)]()

## 📚 Table of Contents

- [Overview](#overview)
- [Patterns Included](#patterns-included)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [How to Use This Repository](#how-to-use-this-repository)
- [Contributing](#contributing)

---

## Overview

This repository is a **learning and reference resource** for software architects, senior engineers, and developers looking to deepen their understanding of system design patterns and programming paradigms.

Each pattern includes:
- **Conceptual explanation** with visual diagrams
- **Real-world problem it solves** 
- **Multiple implementation approaches**
- **Production-ready code examples** (TypeScript + generic pseudocode)
- **Complete testing strategies** (unit, integration, mocking)
- **Common pitfalls and how to avoid them**
- **Best practices and anti-patterns**

**Target Audience:**
- 👨‍💼 Engineering leads designing systems
- 👨‍💻 Developers preparing for system design interviews
- 📖 Anyone learning advanced programming concepts
- 🏗️ Architects making technology decisions

---

## 🎯 Patterns Included

### Creational Patterns

| Pattern | Status | Focus | Difficulty |
|---------|--------|-------|------------|
| **[Singleton](./patterns/singleton/)** | ✅ Complete | Single instance, lazy initialization, caching | Intermediate |
| Factory | 🔄 In Progress | Object creation abstractions | Intermediate |
| Builder | 📅 Planned | Complex object construction | Intermediate |
| Abstract Factory | 📅 Planned | Family of related objects | Advanced |
| Prototype | 📅 Planned | Object cloning and duplication | Intermediate |

### Structural Patterns

| Pattern | Status | Focus | Difficulty |
|---------|--------|-------|------------|
| Adapter | 📅 Planned | Interface compatibility | Intermediate |
| Decorator | 📅 Planned | Dynamic behavior addition | Intermediate |
| Facade | 📅 Planned | Simplified complex subsystems | Beginner |
| Proxy | 📅 Planned | Controlled access | Intermediate |
| Bridge | 📅 Planned | Abstraction-implementation separation | Advanced |

### Behavioral Patterns

| Pattern | Status | Focus | Difficulty |
|---------|--------|-------|------------|
| Observer | 📅 Planned | Event-driven communication | Intermediate |
| Strategy | 📅 Planned | Algorithm selection | Beginner |
| Command | 📅 Planned | Encapsulated requests | Intermediate |
| State | 📅 Planned | State-dependent behavior | Intermediate |
| Template Method | 📅 Planned | Algorithm skeleton | Intermediate |

### Architectural Patterns

| Pattern | Status | Focus | Difficulty |
|---------|--------|-------|------------|
| MVC / MVVM | 📅 Planned | UI architecture | Beginner |
| Repository Pattern | 📅 Planned | Data access abstraction | Intermediate |
| Dependency Injection | 📅 Planned | Loose coupling | Intermediate |
| Event Sourcing | 📅 Planned | Event-based architecture | Advanced |
| CQRS | 📅 Planned | Command-Query separation | Advanced |

---

## 📁 Repository Structure

```
system-design-patterns/
│
├── README.md (this file)
├── LICENSE
├── .gitignore
│
└── patterns/
    │
    ├── singleton/
    │   ├── README.md                          # Quick overview
    │   ├── GUIDE.md                           # Complete guide (the deep dive)
    │   │
    │   ├── examples/
    │   │   ├── typescript/
    │   │   │   ├── 01-basic.ts                # Simplest implementation
    │   │   │   ├── 02-factory-pattern.ts      # Recommended approach
    │   │   │   ├── 03-with-reset.ts           # Testable version
    │   │   │   ├── 04-dependency-chain.ts     # Real-world scenario
    │   │   │   └── 05-advanced.ts             # Thread safety, edge cases
    │   │   │
    │   │   └── generic/
    │   │       ├── pseudocode.md              # Language-agnostic pseudocode
    │   │       └── conceptual.md              # Pure conceptual explanation
    │   │
    │   ├── tests/
    │   │   ├── unit/
    │   │   │   ├── singleton.unit.test.ts     # Core functionality
    │   │   │   └── mocking.unit.test.ts       # Mock patterns
    │   │   │
    │   │   ├── integration/
    │   │   │   └── singleton.integration.test.ts
    │   │   │
    │   │   └── patterns/
    │   │       └── testing-strategies.md      # How to test singletons
    │   │
    │   ├── diagrams/
    │   │   ├── initialization-flow.md         # ASCII diagrams
    │   │   ├── dependency-graph.md            # How dependencies connect
    │   │   └── state-transitions.md           # State over time
    │   │
    │   └── real-world/
    │       └── fleet-masterdata-service.md    # Your production example
    │
    └── [other patterns...]
```

---

## 🚀 Quick Start

### For Learning a Specific Pattern

1. **Start here:** Go to `patterns/[pattern-name]/README.md`
2. **Deep dive:** Read `patterns/[pattern-name]/GUIDE.md`
3. **See code:** Check `patterns/[pattern-name]/examples/`
4. **Run examples:** Follow setup instructions in pattern's README
5. **Test it:** Review `patterns/[pattern-name]/tests/`

### Example: Learning Singleton Pattern

```bash
# Clone the repo
git clone https://github.com/yourusername/system-design-patterns.git
cd system-design-patterns

# Navigate to singleton
cd patterns/singleton

# Read the guide
cat GUIDE.md

# Run TypeScript examples
npm install
npx ts-node examples/typescript/01-basic.ts

# Run tests
npm test
```

---

## 📖 How to Use This Repository

### As a Learning Resource

- **New to design patterns?** Start with the **README.md** in each pattern folder for a quick overview
- **Want deep knowledge?** Read the **GUIDE.md** file (comprehensive explanation)
- **Prefer code?** Jump to `examples/` folder and run the implementations
- **Preparing for interviews?** Read GUIDE.md + review Common Pitfalls section

### As a Reference

- **Working on a project?** Find your pattern, review Best Practices section
- **Debugging an issue?** Check Common Pitfalls for known problems
- **Need a code template?** Copy from `examples/typescript/` and adapt

### As a Showcase

- **Demonstrating expertise?** Reference specific patterns and their trade-offs
- **Technical discussion?** Link to relevant pattern documentation
- **Teaching teammates?** Share pattern-specific README files

---

## 🛠️ Running Examples

### TypeScript Examples

All TypeScript examples require Node.js 16+ and TypeScript.

```bash
cd patterns/singleton/examples/typescript

# Install dependencies
npm install

# Run specific example
npx ts-node 01-basic.ts
npx ts-node 02-factory-pattern.ts
npx ts-node 04-dependency-chain.ts

# Run all tests
npm test

# Watch mode for development
npm run dev
```

### Generic Examples

Generic examples (pseudocode, conceptual) are in Markdown and don't require setup.

---

## 📋 Pattern Anatomy

Each pattern folder contains:

### 📄 README.md
- One-paragraph summary
- Key concepts (bulleted)
- Quick "when to use" decision matrix
- Link to full GUIDE.md

### 📖 GUIDE.md
- Complete explanation with diagrams
- Core concepts and mental models
- Multiple implementation approaches
- Real-world examples
- Testing strategies
- Common pitfalls and solutions
- Best practices
- Quick reference/cheat sheet

### 💻 examples/typescript/
- Progressive complexity: `01-basic.ts` → `05-advanced.ts`
- Each file builds on previous concepts
- Runnable, well-commented code
- Real-world scenarios

### 🧪 tests/
- Unit tests (isolated functionality)
- Integration tests (components together)
- Mocking and testing strategies
- Examples of how to test this pattern

### 🎨 diagrams/
- ASCII art visualizations
- State transitions
- Dependency graphs
- Timing diagrams

### 🏭 real-world/
- Production examples from real codebases
- How the pattern was actually applied
- Performance metrics and lessons learned

---

## 🎓 Learning Path

### For Beginners
1. Read pattern README.md
2. Study conceptual diagrams
3. Run basic examples (`01-basic.ts`)
4. Review test cases

### For Intermediate
1. Read full GUIDE.md
2. Review multiple implementations
3. Study Common Pitfalls section
4. Run advanced examples (`04-advanced.ts`)
5. Write your own unit tests

### For Advanced
1. Review Best Practices
2. Study real-world production examples
3. Analyze performance trade-offs
4. Read about alternative patterns
5. Contribute improvements

---

## 🔍 When to Use Each Pattern

### Singleton Pattern

**Use When:**
- ✅ You need exactly one instance of an expensive resource
- ✅ Caching initialization cost (DB, API auth, config)
- ✅ Single connection pool, logger, cache layer
- ✅ Shared immutable configuration

**Don't Use When:**
- ❌ You need request-scoped state
- ❌ Testing requires mocking different instances
- ❌ Resource is lightweight (no initialization cost)
- ❌ You need multiple instances for flexibility

→ See `patterns/singleton/GUIDE.md` for complete guidance

---

## 📚 Key Resources

- **Gang of Four:** *Design Patterns: Elements of Reusable Object-Oriented Software*
- **Refactoring Guru:** https://refactoring.guru/design-patterns
- **System Design Interview:** https://www.systemdesigninterview.com/
- **Martin Fowler:** https://martinfowler.com/articles/

---

## ❓ FAQ

**Q: Why should I learn design patterns?**  
A: They're time-tested solutions to common problems. Understanding them makes you a better architect and communicates ideas clearly.

**Q: Can I use these in production?**  
A: Yes! All examples are production-ready. However, always adapt to your specific needs.

**Q: Are these patterns language-specific?**  
A: No. Patterns are universal concepts. We provide TypeScript implementations + generic pseudocode.

**Q: How often is this updated?**  
A: New patterns are added monthly. Existing patterns are updated based on feedback and new learnings.

**Q: Can I contribute?**  
A: Absolutely! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 🤝 Contributing

This is a living document. Contributions are welcome!

### Ways to Contribute

- **Suggest a pattern** to document
- **Add language implementations** (Java, Python, Go, etc.)
- **Improve explanations** or fix errors
- **Add more examples** or test cases
- **Share production experiences** with a pattern
- **Report issues** or suggest improvements

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This repository is licensed under the MIT License. See [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Your Name** — Software Architect & System Design Enthusiast

- 🔗 GitHub: [@yourusername](https://github.com/yourusername)
- 💼 LinkedIn: [your-linkedin](https://linkedin.com/in/yourprofile)
- 📧 Email: your.email@example.com

---

## 🌟 Show Your Support

If this repository helped you learn or was useful for your work, please consider:
- ⭐ **Star this repository** (it helps others discover it)
- 🔀 **Share it** with colleagues and friends
- 💬 **Provide feedback** via issues or discussions
- 🤝 **Contribute** patterns or improvements

---

**Happy Learning!** 🚀

---

## Roadmap

- [x] Singleton pattern (complete)
- [ ] Factory pattern (Q4 2026)
- [ ] Builder pattern (Q1 2027)
- [ ] Observer pattern (Q1 2027)
- [ ] Multi-language examples (ongoing)
- [ ] Interactive visualizations (TBD)
- [ ] Video explanations (TBD)

Last Updated: October 23, 2026
# system-design-patterns
