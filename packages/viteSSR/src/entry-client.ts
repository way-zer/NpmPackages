import {App, createSSRApp} from 'vue'
import type {ClientContext, ClientSSRHandler, NoSSRContext, SharedContext} from './types'

declare interface Window {
    __INITIAL_STATE__?: object
}

function createContext(app: App) {
    const state = (window as Window).__INITIAL_STATE__
    const shared = {
        app
    } as SharedContext
    if (state) {
        return {
            ...shared,
            kind: "client",
            state: state
        } as ClientContext
    } else {
        return {
            ...shared,
            kind: "noSSR",
            state: {}
        } as NoSSRContext
    }
}

const viteSSR: ClientSSRHandler = async function (App, hook) {
    const app = createSSRApp(App)
    const context = createContext(app)
    const {router} = await hook(context)
    app.use(router)
    await router.isReady()
    app.mount('#app', true)
}

export default viteSSR
