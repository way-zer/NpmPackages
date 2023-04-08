import {UniSSRHandler} from "./src/types";
import viteSSRClient from "./src/entry-client.js";

console.warn("You are using viteSSR without plugin.")
const viteSSR: UniSSRHandler = viteSSRClient
export default viteSSR