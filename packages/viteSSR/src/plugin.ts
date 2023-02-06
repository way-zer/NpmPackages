import {Connect, Plugin, ViteDevServer} from "vite";
import {Renderer, ServerContext} from "./types";
import {injectTemplate} from "./util";
import {resolve} from "path";
import {readFileSync} from "fs";

const defaultConfig = {
    entryPoint: '/src/main.ts'
}
type Config = typeof defaultConfig

function createSSRHandler(config: Config, server: ViteDevServer): Connect.NextHandleFunction {
    return async (request, response, next) => {
        if (request.method !== 'GET' || request.url!.includes(".ico") || request.url!.includes(".json"))
            return next()
        let template: string
        try {
            const indexHtml = readFileSync(resolve(server.config.root, 'index.html'), 'utf-8')
            template = await server.transformIndexHtml(request.originalUrl!!, indexHtml)
        } catch (error) {
            return next(error)
        }

        try {
            let resolvedEntryPoint = await server.ssrLoadModule(config.entryPoint, {fixStacktrace: true})
            const render = (resolvedEntryPoint.default) as Renderer

            const ctx = {
                kind: 'server',
                state: {},
            } as ServerContext
            const {status, htmlParts} = await render(request.originalUrl!!, ctx)
            response.statusCode = status
            response.setHeader('Content-Type', 'text/html')
            response.end(injectTemplate(template, htmlParts))
        } catch (error) {
            // Send back template HTML to inject ViteErrorOverlay
            response.setHeader('Content-Type', 'text/html')
            response.end(template)

            // Wait until browser injects ViteErrorOverlay
            // custom element from the previous template
            setTimeout(() => next(error), 250)
            server.ssrFixStacktrace(error as Error)
        }
    }
}

export default function viteSSR(config: Config = defaultConfig): Plugin[] {
    return [
        {
            name: 'viteSSR', enforce: 'pre',
            async configureServer(server) {
                const handler = createSSRHandler(config, server)
                return () => {
                    server.middlewares.use(handler)
                }
            },
            resolveId(id, _, {ssr}) {
                if (id.endsWith("simple-vite-vue-ssr"))
                    return ssr ? (id + "/entry-server.ts") : (id + "/entry-client.ts")
            }
        } as Plugin
    ]
}