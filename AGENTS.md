# Ugly Cry Vintage

Ugly Cry Vintage is a Next.js storefront for Shopify, deployed to Vercel, with agent skills in `.agents/skills/`.

## About this store

- Ugly Cry Vintage is a vintage clothing store. There is only one of each product available in one size and color. This means that certain elements that are typical in other e-commerce stores, such as quantity selectors, are unnecessary.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Code Style

### Ordering & Organization

- Alphabetize named export specifiers, object destructuring patterns, interface and type properties, config object keys, i18n JSON keys (within each section and at the top level), and string union type members.
- No barrel files — never create an `index.ts` that only re-exports. Import from the source file directly.

### Component Boundaries

- Push `"use client"` as far down the tree as possible. Pages, layouts, and data-fetching wrappers stay as server components.
- Fetch data in server components or server actions; pass promises or resolved data down to client children.

### File Organization

- Keep sub-components in the same file as their consumer when they share the same directive (or lack one). Only split into a separate file when the components need different directives (e.g., one is `"use client"` and the other is a server component) or when the file becomes unwieldy.
- A single file per logical component is preferred.
- When a directive split is necessary, suffix the carved-out file with the directive: `foo.tsx` (the entry, typically a server component) is paired with `foo-client.tsx` for `"use client"` sub-components — e.g. `sidebar.tsx` + `sidebar-client.tsx`, `mobile-tabs.tsx` + `mobile-tabs-client.tsx`. Use `foo-server.tsx` symmetrically if a server-only piece needs to be carved out of an otherwise-client file. The suffix keeps the pair adjacent in the directory listing.

### Naming

- Files: `PascalCase.tsx`
- Components: `PascalCase`
- Server actions: verb + `Action` suffix (`addToCartAction`)
- Props interfaces: `{ComponentName}Props`. Use `interface` (not `type`) so consumers can extend or augment.
- Native-element prop pass-through: use `React.ComponentProps<"div">` (with `import type * as React from "react"`), not `ComponentPropsWithoutRef`. Refs are regular props in React 19, so the extra type is unnecessary noise.
- Constants: `SCREAMING_SNAKE_CASE`

### Tailwind & Styling

- Style with utilities, not `app/globals.css`. Register new values in `@theme`; keep `globals.css` to tokens, resets, keyframes, and shared utilities, with no global element rules.
- `@theme inline` does not emit `:root` variables; outside utilities, reference the underlying variable.
- Prefer scale utilities (`h-18`, `top-1/2`) to arbitrary values, which are for off-scale values such as `calc()` or grid templates.
- Prefer `data-[attr=value]` selectors to conditional classes; use `cn()` when classes must be conditional, `data-slot` as styling hooks, and `cva` for variants.
- Interactive elements use `cursor-pointer`; disabled ones use `cursor-not-allowed`.

### Exports

- Named exports only in component files. Pages use default exports per Next.js convention.
- Alphabetize specifiers in export statements.

### Comments

Default to none. A comment is one line stating a hidden constraint, an upstream workaround, a non-obvious invariant, or a cross-system quirk, and survives only if an agent would otherwise break behavior. Never restate names, narrate code, reference current work or PRs, add banners, leave a `TODO` without `TODO(handle): reason`, or write multi-line prose. Keep tooling directives and generated or license headers.
