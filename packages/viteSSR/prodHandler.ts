import {Renderer, ServerContext} from "./src/types";
import {injectTemplate} from "./src/util";
import type {IncomingMessage, ServerResponse} from 'http'

interface Config {
    /** dist/client/ssr-manifest.json */
    manifest: any,
    /** dist/client/index.html?raw */
    indexFile: string,
    /** (await import("@/main")).default as Renderer */
    render: Renderer | void
    cache?: (url: string, html: string) => void
}

export function createProdHandler({manifest, render, indexFile, cache}: Config) {
    if (typeof render !== 'function')
        throw 'Error renderer, require function'
    return async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const ctx = {
                kind: 'server',
                state: {},
                ssrManifest: manifest
            } as ServerContext
            const {status, htmlParts} = await render(req.url!!, ctx)
            const html = injectTemplate(indexFile, htmlParts)
            if (cache) cache(req.url!!, html)
            res.statusCode = status
            res.setHeader('Content-Type', 'text/html').end(html)
        } catch (e: any) {
            console.log(e.stack)
            res.statusCode = 500
            res.end(e.stack)
        }
    }
}