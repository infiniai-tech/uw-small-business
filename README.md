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

### Deploy to GitHub Pages

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/uw-small-business.git
   git push -u origin main
   ```

2. **Update the base path** in `vite.config.js` if your repository name is different:
   - If your repo is `https://github.com/username/uw-small-business`, the base path is `/uw-small-business/`
   - If your repo name is different, update line 7 in `vite.config.js` to match your repo name

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **gh-pages** branch
   - Click **Save**
   - Your site will be live at: `https://YOUR_USERNAME.github.io/uw-small-business/`

**Note:** The first deployment may take a few minutes. After that, each time you run `npm run deploy`, your changes will be live within 1-2 minutes.

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

## License

MIT
