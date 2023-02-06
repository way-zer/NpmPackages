import {basename} from 'path'
//渲染内容 htmlParts teleports preload __INITIAL_STATE__

const templateTag = /<!--([a-zA-Z0-9-]+)-->/g

export function injectTemplate(template: string, htmlParts: Record<string, string>) {
    const notInjected = new Set(Object.keys(htmlParts))
    const html = template.replaceAll(templateTag, (raw, token: string) => {
        if (!notInjected.has(token))
            console.warn('Inject html part not found', token)
        notInjected.delete(token)
        return htmlParts[token] || raw
    })
    if (notInjected.size > 0)
        console.warn("Not inject html parts", notInjected)
    return html
}

const UNSAFE_CHARS_REGEXP = /[<>\/\u2028\u2029]/g
const ESCAPED_CHARS = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
}

function escapeUnsafeChars(unsafeChar: string) {
    return ESCAPED_CHARS[unsafeChar as keyof typeof ESCAPED_CHARS]
}

export function htmlEscape(input: string) {
    return input.replaceAll(UNSAFE_CHARS_REGEXP, escapeUnsafeChars)
}

export function renderPreloadLinks(modules?: string[], manifest?: Record<string, string[]>) {
    if (!modules || !manifest) return ''
    let links = ''
    const seen = new Set()
    modules.forEach((id) => {
        const files = manifest[id]
        if (files) {
            files.forEach((file) => {
                if (!seen.has(file)) {
                    seen.add(file)
                    const filename = basename(file)
                    if (manifest[filename]) {
                        for (const depFile of manifest[filename]) {
                            links += renderPreloadLink(depFile)
                            seen.add(depFile)
                        }
                    }
                    links += renderPreloadLink(file)
                }
            })
        }
    })
    return links
}

function renderPreloadLink(file: string) {
    if (file.endsWith('.js')) {
        return `<link rel="modulepreload" crossorigin href="${file}">`
    } else if (file.endsWith('.css')) {
        return `<link rel="stylesheet" href="${file}">`
    } else if (file.endsWith('.woff')) {
        return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`
    } else if (file.endsWith('.woff2')) {
        return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
    } else if (file.endsWith('.gif')) {
        return ` <link rel="preload" href="${file}" as="image" type="image/gif">`
    } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`
    } else if (file.endsWith('.png')) {
        return ` <link rel="preload" href="${file}" as="image" type="image/png">`
    } else {
        return `<!-- Not Support preload for ${file} -->`
    }
}

export function renderTeleports(teleports?: Record<string, string>): string {
    if (!teleports) return ""
    return Object.entries(teleports).map(([id, value]) => {
        if (id == "body") return value
        else if (id.startsWith("#"))
            return `<div id="${id.substring(1)}">${value}</div>`
        else return `<!--Not Handle Teleport ${id}-->`
    }).join("\n")
}