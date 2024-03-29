# SSR for vite+vue

## Install

`pnpm add simple-vite-vue-ssr`

## Usage
### vite.config.ts
```ts
import viteSSR from "simple-vite-vue-ssr/plugin";

export default defineConfig(({mode, ssrBuild}) => {
    return {
        plugins: [
            viteSSR({
                // entryPoint: '/src/main.ts'
            }),
        ],
        build: {
            outDir: "dist/client",
        },
        ssr: {}
    }
})

```
### Index.ts
```ts
import App from "@/App.vue";
import viteSSR from "@/util/viteSSR";
import createRouter from "@/plugins/router";
import {createPinia} from "pinia";

export default viteSSR(App, async (ctx) => {
    //you must provide router
    ctx.router = createRouter()
    
    //use any state store you like
    const pinia = createPinia()
    ctx.app.use(pinia)
    if (ctx.kind == 'server') {
        //pass state to client
        ctx.state.pinia = pinia.state.value
    } else if (ctx.kind == 'client') {
        //read state from SSR rendered
        pinia.state.value = ctx.state.pinia
    }
})
```
### prodServer.ts
Build with `vite build --outDir dist/server --ssr src/prodServer.ts`
```ts
import * as http from "http";

import indexProd from '../dist/client/index.html?raw'
import manifest from '../dist/client/ssr-manifest.json'
import {createProdHandler} from "@/util/viteSSR/prodHandler";

const port = +(process.env["PORT"] || 6173)

;(async () => {
    http.createServer(createProdHandler({
        manifest, indexFile: indexProd,
        render: (await import("@/main")).default //split package
    })).listen(port)
    console.log('http://localhost:' + port)
})()
```
## License - MIT

I would thank you if you give this a star.  