import {Renderer, ServerContext} from "./types";
import {injectTemplate} from "./util";
import type {IncomingMessage, ServerResponse} from 'http'

interface Config {
    /** dist/client/ssr-manifest.json */
    manifest: any,
    /** dist/client/index.html?raw */
    indexFile: string,
    /** (await import("@/main")).default as Renderer */
    render: Renderer | void
}

export function createProdHandler({manifest, render, indexFile}: Config) {
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
            res.statusCode = status
            res.setHeader('Content-Type', 'text/html').end(html)
        } catch (e: any) {
            console.log(e.stack)
            res.statusCode = 500
            res.end(e.stack)
        }
    }
}