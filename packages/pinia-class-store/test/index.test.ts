import {assert, beforeAll, test} from "vitest";
import {asPiniaStore, useStore} from "../src";
import {createPinia, setActivePinia} from "pinia";

class TestStore {
    hello = "INIT"

    get helloMe() {
        return this.hello + " me"
    }

    get piniaStoreId() {
        return asPiniaStore(this).$id
    }

    changeHello() {
        this.hello = "hello"
    }

    async asyncHello() {
        await new Promise(resolve => setTimeout(resolve, 100))
        this.changeHello()
    }
}

beforeAll(() => {
    setActivePinia(createPinia())
})

test('store is class', () => {
    const store = useStore(TestStore)
    assert.instanceOf(store, TestStore)
})
test('store return the same', () => {
    assert.strictEqual(useStore(TestStore), useStore(TestStore))
})
test('getter and action works', () => {
    const store = useStore(TestStore)
    store.changeHello()
    assert.equal(store.helloMe, "hello me")
})
test('async action works', async () => {
    const store = useStore(TestStore)
    store.hello = ""
    await store.asyncHello()
    assert.equal(store.helloMe, "hello me")
})
test('pinia extra exists', async () => {
    const store = useStore(TestStore)
    assert.isDefined(store.$state.hello)
    assert.isDefined(store.$onAction)
    assert.isDefined(store.$patch)
})
test('asPiniaStore works', async () => {
    const store = useStore(TestStore)
    assert.equal(store.piniaStoreId, TestStore.name)
})