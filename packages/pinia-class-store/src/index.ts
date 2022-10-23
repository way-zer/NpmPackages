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

type Actions<T extends Record<string, any>> = {
    [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: T[P];
};
//we can't distinguish state and getter, so see getter as state for type
type StateAndGetter<T extends Record<string, any>> = Omit<T, keyof Actions<T>>;

/**
 * @param Module0 类名
 * @param id Store的id,可选，默认使用类名
 */
export function useStore<T extends (new (...args) => any), G extends InstanceType<T> = InstanceType<T>>(Module0: T, id?: string)
    : G & Store<string, StateAndGetter<G>, {}, Actions<G>> {
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
    return store as G
}