import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        setupFiles: ['./vitest.setup.ts'],
        exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
        fileParallelism: false,
        globals: true,
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
