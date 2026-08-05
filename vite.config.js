import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is published at https://yliu-fort.github.io/wcb2026website/, i.e. under
// a sub-path rather than the domain root. `base` makes Vite emit asset URLs with
// that prefix. It also applies to the dev server, so local development exercises
// the exact same paths as production — if a link works locally it works deployed.
// If the site ever moves to a custom domain at the root, change this to '/'.
export default defineConfig({
  base: '/wcb2026website/',
  plugins: [react()],
  server: {
    // Bind to loopback only: this machine has a public IP and no host firewall,
    // so the dev server must not be reachable from the internet. Reach it with
    // an SSH tunnel:  ssh -L 5173:localhost:5173 <user>@<host>
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
