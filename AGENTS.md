# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Project Overview

SimpleCalc - A collection of web calculators (age, mortgage, tax, student loans, retirement) built with TypeScript and vanilla web components. Deployed via Cloudflare Workers with R2 bucket storage.

## Build Commands

```bash
# Build TypeScript (compiles src/ to dist/)
npm run build

# Install dependencies
npm ci
```

**Note:** No test framework or linter is currently configured. Type checking is enforced via TypeScript strict mode.

## Project Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript output (do not edit directly)
- `worker.js` - Cloudflare Worker for serving static files from R2
- `.github/workflows/deploy.yml` - CI/CD pipeline

## Code Style Guidelines

### TypeScript Configuration
- Target: ESNext with ES modules
- Strict mode enabled
- DOM and ESNext libs available
- See `tsconfig.json` for full configuration

### Imports
- Use explicit `.js` extensions for all imports (even TypeScript files)
- Example: `import { foo } from "./store.js"`
- Group imports: external libraries first, then internal modules

### Formatting
- No semicolons (ASI)
- Double quotes for strings
- 4 spaces indentation
- No trailing commas in single-line objects/arrays

### Naming Conventions
- **Variables/functions**: camelCase (`calculateTotal`, `monthlyPayment`)
- **Types/interfaces**: PascalCase (`UnifiedStore`, `BracketDetail`)
- **Classes**: PascalCase (`CustomSlider`, `SimpleHeader`)
- **Enums**: PascalCase with UPPER_SNAKE_CASE members (`FilingType.SINGLE`)
- **Constants**: camelCase for local, export if needed (`const ageStorageKey`)

### Types
- Always use explicit types on function parameters
- Use return type annotations on exported functions
- Prefer `type` over `interface` for object shapes
- Use enums for fixed sets of values
- Use `Record<K, V>` for mapped types

### Error Handling
- For DOM elements, use nullish coalescing with IIFE to throw:
  ```typescript
  const element = document.getElementById('id') ?? (() => { throw new Error("id cannot be null") })()
  ```
- Log errors to console with descriptive messages
- Use try-catch when parsing localStorage JSON

### DOM and Event Handling
- Use custom events for component communication
- Listen for events on `document.body` or specific elements
- Cast event targets explicitly: `event.target as HTMLInputElement`
- Use `CustomEvent<T>` for type-safe custom events

### Web Components
- Use Shadow DOM with `mode: "open"`
- Define custom elements with `customElements.define("tag-name", Class)`
- Use kebab-case for custom element tag names
- Access shadow DOM elements with definite assignment assertions (`!`)

### State Management
- Use localStorage for persistence
- Define storage keys as constants
- Create typed store interfaces
- Use initialize functions with default values

### CSS
- Use CSS custom properties (variables) for theming
- Define variables in root HTML files
- Use BEM-like naming for classes

## Deployment

Automatically deploys on push to main when changes affect:
- `src/**`
- `package.json`
- `dist/**`

Files are uploaded to Cloudflare R2 bucket via GitHub Actions.

## Important Notes

- Do not edit files in `dist/` directly - they are generated
- HTML files in `dist/` are hand-written, not generated
- The `worker.js` file is plain JavaScript (not TypeScript)
- Always run `npm run build` after modifying TypeScript files
- Test changes by opening `dist/*.html` files in a browser
