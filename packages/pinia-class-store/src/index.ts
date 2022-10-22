/**
 @author WayZer
 inspired by vuex-class-modules
 */
import {defineStore, Store} from "pinia";

interface ModuleExt {
    _storeOptions?: {
        initialState: {},
        getters: {},
        actions: {}
    }
}

/**
 * @param Module0 类名
 * @param id Store的id,可选，默认使用类名
 */
export function useStore<T extends (new (...args) => any)>(Module0: T, id?: string): InstanceType<T> & Store<string, T, T, T> {
    const Module = Module0 as T & ModuleExt
    id = id || Module.name
    if (!Module._storeOptions) {
        const option = {
            initialState: {},
            getters: {},
            actions: {}
        }
        const instance = new Module()
        for (const key of Object.keys(instance)) {
            if (instance.hasOwnProperty(key))
                option.initialState[key] = instance[key]
        }
        for (const key of Object.getOwnPropertyNames(Module.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(Module.prototype, key)!!
            if (descriptor.get) {
                option.getters[key] = (state) => descriptor.get!!.call(state)
            }
            if (descriptor.value) {
                option.actions[key] = Module.prototype[key]
            }
        }
        Module._storeOptions = option
    }

    const {initialState, getters, actions} = Module._storeOptions
    const store = defineStore(id, {
        state: () => initialState,
        getters, actions
    })()
    Object.setPrototypeOf(store, Module.prototype)
    return store as InstanceType<T>
}