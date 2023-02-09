import {App, Component, createApp, createSSRApp} from 'vue'
import type {ClientContext, ClientSSRHandler, NoSSRContext, SharedContext} from './types'

declare interface Window {
    __INITIAL_STATE__?: object
}

function createContext(app: Component) {
    const state = (window as Window).__INITIAL_STATE__
    if (state) {
        return {
            kind: "client",
            app: createSSRApp(app),
            state: state
        } as ClientContext
    } else {
        return {
            kind: "noSSR",
            app: createApp(app),
            state: {}
        } as NoSSRContext
    }
}

const viteSSR: ClientSSRHandler = async function (App, hook) {
    const context = createContext(App)
    const {router} = await hook(context)
    context.app.use(router)
    await router.isReady()
    context.app.mount('#app', context.kind == "client")
}

export default viteSSR
