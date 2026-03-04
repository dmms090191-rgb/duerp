// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { copyFileSync, readdirSync, statSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
var __vite_injected_original_dirname = "/home/project";
function customPublicCopy() {
  return {
    name: "custom-public-copy",
    apply: "build",
    closeBundle() {
      const publicDir = join(__vite_injected_original_dirname, "public");
      const outDir = join(__vite_injected_original_dirname, "dist");
      function copyDir(src, dest) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }
        const entries = readdirSync(src);
        for (const entry of entries) {
          const srcPath = join(src, entry);
          const destPath = join(dest, entry);
          if (entry.includes("image copy copy copy copy copy copy copy copy copy.png")) {
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
        console.error("Error in custom public copy:", error);
      }
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), customPublicCopy()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    copyPublicDir: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIHJlYWRkaXJTeW5jLCBzdGF0U3luYywgbWtkaXJTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG4vLyBDdXN0b20gcGx1Z2luIHRvIGNvcHkgcHVibGljIGZpbGVzIGV4Y2x1ZGluZyBwcm9ibGVtYXRpYyBvbmVzXG5mdW5jdGlvbiBjdXN0b21QdWJsaWNDb3B5KCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjdXN0b20tcHVibGljLWNvcHknLFxuICAgIGFwcGx5OiAnYnVpbGQnIGFzIGNvbnN0LFxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgY29uc3QgcHVibGljRGlyID0gam9pbihfX2Rpcm5hbWUsICdwdWJsaWMnKTtcbiAgICAgIGNvbnN0IG91dERpciA9IGpvaW4oX19kaXJuYW1lLCAnZGlzdCcpO1xuXG4gICAgICBmdW5jdGlvbiBjb3B5RGlyKHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRlc3QpKSB7XG4gICAgICAgICAgbWtkaXJTeW5jKGRlc3QsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW50cmllcyA9IHJlYWRkaXJTeW5jKHNyYyk7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgY29uc3Qgc3JjUGF0aCA9IGpvaW4oc3JjLCBlbnRyeSk7XG4gICAgICAgICAgY29uc3QgZGVzdFBhdGggPSBqb2luKGRlc3QsIGVudHJ5KTtcblxuICAgICAgICAgIC8vIFNraXAgcHJvYmxlbWF0aWMgZmlsZVxuICAgICAgICAgIGlmIChlbnRyeS5pbmNsdWRlcygnaW1hZ2UgY29weSBjb3B5IGNvcHkgY29weSBjb3B5IGNvcHkgY29weSBjb3B5IGNvcHkucG5nJykpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gc3RhdFN5bmMoc3JjUGF0aCk7XG5cbiAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgY29weURpcihzcmNQYXRoLCBkZXN0UGF0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb3B5RmlsZVN5bmMoc3JjUGF0aCwgZGVzdFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFNraXBwaW5nICR7ZW50cnl9OiAke2Vycm9yfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb3B5RGlyKHB1YmxpY0Rpciwgb3V0RGlyKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGN1c3RvbSBwdWJsaWMgY29weTonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIGN1c3RvbVB1YmxpY0NvcHkoKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgY29weVB1YmxpY0RpcjogZmFsc2UsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsY0FBYyxhQUFhLFVBQVUsV0FBVyxrQkFBa0I7QUFDM0UsU0FBUyxZQUFZO0FBSHJCLElBQU0sbUNBQW1DO0FBTXpDLFNBQVMsbUJBQW1CO0FBQzFCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLGNBQWM7QUFDWixZQUFNLFlBQVksS0FBSyxrQ0FBVyxRQUFRO0FBQzFDLFlBQU0sU0FBUyxLQUFLLGtDQUFXLE1BQU07QUFFckMsZUFBUyxRQUFRLEtBQWEsTUFBYztBQUMxQyxZQUFJLENBQUMsV0FBVyxJQUFJLEdBQUc7QUFDckIsb0JBQVUsTUFBTSxFQUFFLFdBQVcsS0FBSyxDQUFDO0FBQUEsUUFDckM7QUFFQSxjQUFNLFVBQVUsWUFBWSxHQUFHO0FBRS9CLG1CQUFXLFNBQVMsU0FBUztBQUMzQixnQkFBTSxVQUFVLEtBQUssS0FBSyxLQUFLO0FBQy9CLGdCQUFNLFdBQVcsS0FBSyxNQUFNLEtBQUs7QUFHakMsY0FBSSxNQUFNLFNBQVMsd0RBQXdELEdBQUc7QUFDNUU7QUFBQSxVQUNGO0FBRUEsY0FBSTtBQUNGLGtCQUFNLE9BQU8sU0FBUyxPQUFPO0FBRTdCLGdCQUFJLEtBQUssWUFBWSxHQUFHO0FBQ3RCLHNCQUFRLFNBQVMsUUFBUTtBQUFBLFlBQzNCLE9BQU87QUFDTCwyQkFBYSxTQUFTLFFBQVE7QUFBQSxZQUNoQztBQUFBLFVBQ0YsU0FBUyxPQUFPO0FBQ2Qsb0JBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFBQSxVQUM1QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBRUEsVUFBSTtBQUNGLGdCQUFRLFdBQVcsTUFBTTtBQUFBLE1BQzNCLFNBQVMsT0FBTztBQUNkLGdCQUFRLE1BQU0sZ0NBQWdDLEtBQUs7QUFBQSxNQUNyRDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDO0FBQUEsRUFDckMsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLEVBQ2pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
