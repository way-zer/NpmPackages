import {UniSSRHandler} from "./types";
import viteSSRClient from "./entry-client.js";

console.warn("You are using viteSSR without plugin.")
const viteSSR: UniSSRHandler = viteSSRClient
export default viteSSR