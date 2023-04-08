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
                index: 'index.ts',
                plugin: 'plugin.ts',
                prodHandler: 'prodHandler.ts',
                "entry-client": 'src/entry-client.ts',
                "entry-server": 'src/entry-server.ts',
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