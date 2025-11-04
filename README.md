# UW Small Business

A modern React application built with Vite, Tailwind CSS v4, and shadcn/ui components.

## Tech Stack

- **React 19** - Latest React with modern features
- **Vite 7** - Next generation frontend tooling
- **Tailwind CSS v4** - Latest version with CSS-first configuration
- **shadcn/ui** - Re-usable component system built with Radix UI and Tailwind

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
uw-small-business/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── lib/
│   │   └── utils.js      # Utility functions (cn helper)
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles with Tailwind v4 @theme configuration
├── public/               # Static assets
├── components.json       # shadcn/ui configuration
├── tailwind.config.js    # Tailwind configuration (minimal for v4)
├── postcss.config.js     # PostCSS configuration
├── jsconfig.json         # Path aliases configuration
└── vite.config.js        # Vite configuration
```

## Features

### Tailwind CSS v4 Setup

- **CSS-First Configuration**: Tailwind v4 uses `@theme` directive in CSS instead of JS config
- Fully configured with custom color scheme using CSS variables
- Dark mode support with `@media (prefers-color-scheme: dark)`
- PostCSS with @tailwindcss/postcss plugin
- Simplified configuration approach

### shadcn/ui Configuration

- Pre-configured component system
- Path aliases (`@/`) for clean imports
- Button component included as example
- Ready to add more components with shadcn CLI

### Adding More shadcn Components

To add additional shadcn/ui components, you can manually create them in `src/components/ui/` following the pattern of the Button component, or use the shadcn CLI if available:

```bash
npx shadcn@latest add [component-name]
```

Available components: button, card, input, form, dialog, dropdown-menu, and many more.

## Path Aliases

The project uses path aliases for cleaner imports:

```javascript
// Instead of: import { Button } from '../../components/ui/button'
// You can use: import { Button } from '@/components/ui/button'
```

## Tailwind CSS v4 Changes

Tailwind v4 introduces a new CSS-first configuration approach:

- **Theme configuration** is now done in CSS using `@theme` directive
- **Color system** uses CSS variables defined in `src/index.css`
- **Simplified config file** - `tailwind.config.js` only needs content paths
- **Import statement** - Use `@import "tailwindcss"` instead of `@tailwind` directives

### Customization

#### Colors

Edit the `@theme` block in `src/index.css` to customize colors:

```css
@theme {
  --color-primary: 222.2 47.4% 11.2%;
  --color-secondary: 210 40% 96.1%;
  /* ... more colors */
}
```

#### Dark Mode

Dark mode is configured using media queries:

```css
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: 222.2 84% 4.9%;
    /* ... dark mode colors */
  }
}
```

## Deployment

This app is configured for easy deployment to Vercel.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project" and import your repository
4. Vercel will auto-detect Vite settings
5. Click "Deploy" - done!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory, ready for deployment.

## License

MIT
