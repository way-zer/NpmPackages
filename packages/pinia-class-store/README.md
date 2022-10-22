# Class Style Store for pinia

inspired by `vuex-class-modules`

## Install

`pnpm add pinia-class-store`

## Usage

```ts
//define Store
import {useStore} from 'pinia-class-store'

class TestStore {
    //state
    hello = "INIT"

    //getters
    get helloMe() {
        return this.hello + "me"
    }

    //actions
    changeHello() {
        this.hello = "hello"
    }

    async asyncHello() {
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.changeHello()
    }
}

setActivePinia(createPinia())
//use store
const store = useStore(TestStore)
//access store like normal class
console.log(store.hello)
await store.asyncHello()
console.log(store.helloMe)

//If you want name it
export const useAnotherTestStore = useStore.bind(undefined, TestStore, "another_name")
```

## License - MIT

I would thank you if you give this a star.  