import { Context, Fragment } from "koishi"
import {} from '@koishijs/plugin-help'
import { CallServiceYaml } from "./types"
import { HaWsClinet } from "./ws_client"

export function CheckUrl(url: string): string {
        let newUrl = url

        newUrl = newUrl.replace(/\s/g, '')

        if (newUrl.endsWith('/')) {
                newUrl = newUrl.slice(0, -1)
        }

        if (newUrl.startsWith('http://')) {
                newUrl = newUrl.replace('http://', 'ws://')
        }

        if (newUrl.startsWith('https://')) {
                newUrl = newUrl.replace('https://', 'wss://')
        }

        if (!newUrl.startsWith('ws://') && !newUrl.startsWith('wss://')) {
                newUrl = 'ws://' + newUrl
        }

        return newUrl
}

export async function waitForAuth(ws: HaWsClinet) {
        while (!ws.IsAuth()) {
                await new Promise(resolve => setTimeout(resolve, 100))
        }
}


function replacePlaceholdersInString(template: string, args: string[]) {
        return template.replace(/\${input_(\d+)}/g, (_, index) => args[parseInt(index)] || '')
}

function replacePlaceholdersInObject(obj: any, args: string[]) {
        if (typeof obj === 'string') {
                return replacePlaceholdersInString(obj, args)
        }

        if (typeof obj !== 'object' || obj === null) {
                return obj
        }

        const objCopy = {  ...obj }

        const stack: { parent: any, key: string | null, value: any }[] = []

        for (const k in objCopy) {
                stack.push({ parent: objCopy, key: k, value: objCopy[k] })
        }

        while (stack.length > 0) {
                const { parent, key, value } = stack.pop()!
                let newValue: any
                
                if (typeof value === 'string') {
                        newValue = replacePlaceholdersInString(value, args)
                } else if (typeof value === 'object' && value !== null) {
                        newValue = Array.isArray(value) ? [] : {}
                } else {
                        newValue = value
                }

                parent[key!] = newValue

                if (typeof value !== 'object' || value === null) continue

                for (const k in value) {
                        stack.push({ parent: newValue, key: k, value: value[k] })
                }
        }

        return objCopy
}

export function CreateCallServiceCommand(
        ctx: Context,
        CallServiceYaml: CallServiceYaml,
        HaWsClinet: HaWsClinet
) {
        const { command, domain, service, service_data, target, return_response, responsepath } = CallServiceYaml
        let { name, level } = command

        if (!level) level = 3

        ctx.command( `${name}`, { hidden: true, authority: 3 })
                .action(({session}, ...args) => {
                        if (responsepath) {
                                let isOk: boolean = false
                                const dispose = ctx.on('haluna/event', (data) => {
                                        ctx.setTimeout(() => {
                                                dispose()
                                                if (isOk) return
                                                HaWsClinet.HaLogger('error ', name, ' Timeout')
                                                session.send('Timeout')
                                        }, HaWsClinet.GetTimeOut() * 1000)

                                        let response: any = null
                                        
                                        responsepath.some(responsepath => {
                                                if (data.type !== responsepath.type) return false

                                                const re = searchObjectByPath(data, responsepath.path)

                                                if (!re) return false

                                                response = re
                                                return true
                                        })

                                        if (!response) return

                                        isOk = true
                                        session.send(response)
                                        dispose()
                                })
                        }

                        HaWsClinet.CallService(
                                replacePlaceholdersInObject(domain, args),
                                replacePlaceholdersInObject(service, args),
                                replacePlaceholdersInObject(service_data, args),
                                {
                                        entity_id: replacePlaceholdersInObject(target.entity_id, args)
                                },
                                return_response
                        )
                })
}

export function searchObjectByPath(obj: any, path: string): any {
        const keys = path.split(':').reduce((acc, key) => {
                const arrayMatch = key.match(/(.+)\[(\d+)\]/)
                if (arrayMatch) {
                        acc.push(arrayMatch[1], parseInt(arrayMatch[2]))
                } else {
                        acc.push(key)
                }
                return acc
        }, [] as (string | number)[])

        let current = obj
        for (const key of keys) {
                if (current === undefined || current === null) return undefined

                current = current[key]
        }

        return current
}