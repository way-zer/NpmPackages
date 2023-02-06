import {App, Component} from "vue";
import type {Router} from "vue-router";

export interface SharedContext {
    app: App
    state: SSRState | Record<string, undefined>
}

export interface Options {
    router: Router
    afterRender?: () => void | Promise<void>
}

export interface SSRState {
    [key: string]: any
}


export interface ServerContext extends SharedContext {
    kind: 'server'
    state: SSRState

    ssrManifest?: Record<string, string[]>
    modules?: string[]
    teleports?: Record<string, string>
}

export interface ClientContext extends SharedContext {
    kind: 'client'
    state: Readonly<SSRState>
}

export interface NoSSRContext extends SharedContext {
    kind: 'noSSR'
    state: Record<string, undefined>
}

export type UniContext = ClientContext | NoSSRContext | ServerContext
export type Hook<Context extends SharedContext> = (ctx: Context) => Promise<Options>
export type Renderer = (url: string | URL, context: ServerContext) => Promise<{
    status: number,
    htmlParts: Record<string, string>,
}>

export type ClientSSRHandler = (App: Component, hook: Hook<ClientContext | NoSSRContext>) => void
export type ServerSSRHandler = (App: Component, hook: Hook<ServerContext>) => Renderer
export type UniSSRHandler = (App: Component, hook: Hook<UniContext>) => Renderer | void