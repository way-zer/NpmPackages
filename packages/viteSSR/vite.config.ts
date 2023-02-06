import {defineConfig} from "vite";
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [dts()],
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ["es", 'cjs'],
        },
        rollupOptions: {
            external: ['vue', 'vue-router', 'vite', 'connect', 'path', 'fs'],
            input: {
                index: 'src/index.ts',
                plugin: 'src/plugin.ts',
                entryClient: 'src/entry-client.ts',
                entryServer: 'src/entry-server.ts',
                prodHandler: 'src/prodHandler.ts',
            },
            output: [
                {
                    format: 'es',
                    entryFileNames: ({name}) => `${name}.js`
                },
                {
                    format: 'cjs',
                    entryFileNames: ({name}) => `${name}.cjs`
                }
            ]
        }
    }
})