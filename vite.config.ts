import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from /<repo-name>/ — update this to
// match the new repo's name once this template is moved.
export default defineConfig({
  base: '/game-template/',
  plugins: [react()],
})
