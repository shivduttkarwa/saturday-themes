import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  /* This shell exports NODE_ENV=production, and Vite honours it even for
     `vite dev`. That flips isProduction on, which makes @vitejs/plugin-react
     skip the Fast Refresh preamble in index.html while the JSX transform still
     emits $RefreshSig$() calls — so every component module dies with
     "$RefreshSig$ is not defined". Pin dev to development. */
  if (command === 'serve') process.env.NODE_ENV = 'development'

  return {
    plugins: [react()],
  }
})
