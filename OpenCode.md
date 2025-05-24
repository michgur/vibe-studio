\
# OpenCode Rules for vibe-studio

## Commands

- **Build:** `npm run build`
- **Lint:** No lint command found. Consider adding one (e.g., ESLint with Vue plugin).
- **Test:** No test command found. Consider adding one (e.g., Vitest or Jest).
  - To run a single test (example, assuming Vitest): `vitest run -t "test name"`
- **Dev Client:** `npm run client`
- **Dev Server:** `npm run server`

## Code Style

- **Framework:** Vue 3 with TypeScript and Vite.
- **Component Style:** Use `<script setup>` SFCs.
- **Formatting:** Follow default Prettier/Volar or establish project-wide formatting.
- **Naming Conventions:**
    - Components: PascalCase (e.g., `MyComponent.vue`)
    - Variables/Functions: camelCase (e.g., `myVariable`)
- **Types:** Use TypeScript for strong typing.
- **Error Handling:** Implement consistent error handling mechanisms.
- **Imports:** Organize imports (e.g., by module type, then alphabetically).
