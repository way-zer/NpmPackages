import {UniSSRHandler} from "./types";

// @ts-ignore
declare let viteSSR: UniSSRHandler = undefined
export default viteSSR

throw "You should use vite plugin"