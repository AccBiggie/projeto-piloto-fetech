import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.tsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    server: {
        // Roda dentro do container "node"; o navegador acessa por localhost
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: { host: 'localhost' },
        watch: {
            ignored: ['**/storage/framework/views/**', '**/vendor/**'],
        },
    },
});
