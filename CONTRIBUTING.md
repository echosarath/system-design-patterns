# Contributing to System Design Patterns

Thank you for considering contributing to this repository! This is a learning resource that benefits from community input, corrections, and additions.

## How to Contribute

### 1. Report Issues

Found a mistake, unclear explanation, or want to suggest a new pattern?

- **Check existing issues** first to avoid duplicates
- **Create a new issue** with:
  - Clear title describing the problem
  - Detailed description of the issue
  - Relevant code snippets or examples
  - Screenshots if applicable

### 2. Suggest New Patterns

Want to add a new design pattern or architectural pattern?

- **Create an issue** with the "pattern-suggestion" label
- Include:
  - Pattern name and category (Creational, Structural, Behavioral, Architectural)
  - Brief description of the pattern
  - Why it's important
  - Real-world use cases
  - Difficulty level (Beginner, Intermediate, Advanced)

### 3. Improve Documentation

Help make explanations clearer or more comprehensive:

- **Report unclear sections** in an issue
- **Suggest better examples** with concrete code
- **Improve diagrams** or add new visualizations
- **Add missing edge cases** or anti-patterns

### 4. Add Code Examples

Contribute implementations in additional languages:

- TypeScript examples already exist
- Consider adding: Java, Python, Go, C#, Rust, etc.
- Follow the existing structure and code style
- Include comments explaining each step
- Add both basic and advanced examples

### 5. Add Tests

Improve test coverage and testing strategies:

- Add unit tests for examples
- Add integration tests
- Demonstrate testing best practices
- Add mocking/stubbing examples

## Contribution Guidelines

### Before You Start

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/system-design-patterns.git
   cd system-design-patterns
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/add-factory-pattern
   # or
   git checkout -b fix/typo-in-singleton-guide
   ```

3. **Set up development environment**
   ```bash
   npm install
   npm run test
   ```

### Code Style

- **TypeScript:** Follow Prettier + ESLint configuration
  ```bash
  npm run lint
  npm run format
  ```

- **Markdown:** 
  - Use clear, concise language
  - Use code fences with language specification
  - Add table of contents for long documents
  - Include proper spacing and headings

- **File naming:**
  - Examples: `01-basic.ts`, `02-factory-pattern.ts`
  - Documentation: `GUIDE.md`, `README.md`
  - Tests: `*.test.ts` or `*.spec.ts`

### Documentation Standards

When adding a new pattern, include:

1. **README.md** - Quick overview with:
   - One-line summary
   - Key concepts
   - When to use / when NOT to use
   - Real-world examples
   - Links to full guide

2. **GUIDE.md** - Comprehensive guide with:
   - Core concepts and mental models
   - Multiple implementation approaches
   - Real-world examples
   - Testing strategies
   - Common pitfalls and solutions
   - Best practices
   - Quick reference/cheat sheet

3. **examples/** - Working code with:
   - Progressive complexity (basic → advanced)
   - Clear comments
   - Real-world scenarios
   - Error handling

4. **tests/** - Testing examples with:
   - Unit tests
   - Integration tests
   - Mocking strategies
   - Best practices

5. **diagrams/** - Visual explanations with:
   - ASCII art diagrams
   - State transitions
   - Dependency graphs

### Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New pattern or feature
- `docs:` Documentation improvements
- `fix:` Bug fixes
- `test:` Test additions or improvements
- `refactor:` Code restructuring
- `style:` Code style changes

**Examples:**
```
feat(singleton): add factory pattern implementation

docs(singleton): improve GUIDE.md clarity

fix(examples): correct async initialization bug

test(singleton): add circular dependency tests
```

### Pull Request Process

1. **Update** your branch with latest changes
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests** and linting
   ```bash
   npm test
   npm run lint
   ```

3. **Create PR** with:
   - Clear title describing changes
   - Description of what was changed and why
   - Reference to related issues (#123)
   - Checklist of completion

4. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Motivation
   Why these changes are needed

   ## Type of Change
   - [ ] New pattern
   - [ ] Documentation improvement
   - [ ] Code example
   - [ ] Bug fix
   - [ ] Test addition

   ## Related Issues
   Closes #123

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Documentation is updated
   - [ ] Tests are added/updated
   - [ ] No new warnings generated
   - [ ] Changes reviewed locally
   ```

## Review Process

- **Maintainers** will review PRs within a few days
- **Feedback** will be provided if changes are needed
- **Approval** required before merging
- **Automated checks** must pass (linting, tests)

## Community Guidelines

### Be Respectful

- Treat all contributors with respect
- Assume good intent
- Provide constructive feedback
- Accept criticism gracefully

### Share Knowledge

- Explain your reasoning
- Help others learn
- Share resources and references
- Ask questions if unclear

### Give Credit

- Acknowledge sources and references
- Link to related work
- Mention contributors by name
- Respect intellectual property

## Questions?

- **Check the FAQ** section in README
- **Search existing issues** for answers
- **Create a discussion** for questions
- **Reach out** via email or LinkedIn

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Thanked in commit messages
- Recognized in release notes
- Featured in project README

## Additional Resources

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Markdown Guide](https://www.markdownguide.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Thank you for contributing!** Your help makes this resource better for everyone. 🙏
