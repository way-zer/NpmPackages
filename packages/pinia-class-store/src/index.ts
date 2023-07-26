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

//magic, see https://github.com/Microsoft/TypeScript/issues/27024
type Magic<X> = (<T>() => T extends X ? 1 : 2)
type Magic2<X> = (<T>() => T extends X ? 1 : 2)

type Actions<T extends Record<string, any>> = {
    [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: T[P];
};
type Getters<T extends Record<string, any>> = {
    [P in keyof T as Magic<Pick<T, P>> extends Magic2<Readonly<Pick<T, P>>> ? P : never]: T[P];
};
type States<T extends Record<string, any>> = Omit<{
    [P in keyof T as Magic<Pick<T, P>> extends Magic2<Readonly<Pick<T, P>>> ? never : P]: T[P];
}, keyof Actions<T>>;

type PiniaStore<G extends Record<string, any>> = Store<string, States<G>, Getters<G>, Actions<G>>

/**
 * @param Module0 类名
 * @param id Store的id,可选，默认使用类名
 */
export function useStore<T extends (new () => any), G extends InstanceType<T> = InstanceType<T>>(Module0: T, id?: string)
    : G & Omit<PiniaStore<G>, keyof G> {
    const Module = Module0 as T & ModuleExt
    id = id || Module.name
    if (!Module._storeOptions) {
        const option = {
            initialState: {} as any,
            getters: {} as any,
            actions: {} as any,
        }
        const instance = new Module()
        for (const key of Object.keys(instance)) {
            if (instance.hasOwnProperty(key))
                option.initialState[key] = instance[key]
        }
        for (const key of Object.getOwnPropertyNames(Module.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(Module.prototype, key)!!
            if (descriptor.get) {
                option.getters[key] = (state: G) => descriptor.get!!.call(state)
            }
            if (descriptor.value) {
                option.actions[key] = Module.prototype[key]
            }
        }
        Module._storeOptions = option
    }

    const {initialState, getters, actions} = Module._storeOptions
    const store = defineStore(id, {
        state: () => ({...initialState}),
        getters, actions
    })()
    Object.setPrototypeOf(store, Module.prototype)
    return store as G
}

/**
 * convert pinia class module as PiniaStore
 * @module should be this
 */
export function asPiniaStore<Module extends Record<any, any>>(module: Module): PiniaStore<Module> {
    if (!(module as PiniaStore<Module>).$id) throw new Error("This is not a pinia class module")
    return module as PiniaStore<Module>
}