import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Custom plugin to copy public files excluding problematic ones
function customPublicCopy() {
  return {
    name: 'custom-public-copy',
    apply: 'build' as const,
    closeBundle() {
      const publicDir = join(__dirname, 'public');
      const outDir = join(__dirname, 'dist');

      function copyDir(src: string, dest: string) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }

        const entries = readdirSync(src);

        for (const entry of entries) {
          const srcPath = join(src, entry);
          const destPath = join(dest, entry);

          // Skip problematic file
          if (entry.includes('image copy copy copy copy copy copy copy copy copy.png')) {
            continue;
          }

          try {
            const stat = statSync(srcPath);

            if (stat.isDirectory()) {
              copyDir(srcPath, destPath);
            } else {
              copyFileSync(srcPath, destPath);
            }
          } catch (error) {
            console.warn(`Skipping ${entry}: ${error}`);
          }
        }
      }

      try {
        copyDir(publicDir, outDir);
      } catch (error) {
        console.error('Error in custom public copy:', error);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), customPublicCopy()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    copyPublicDir: false,
  },
});
