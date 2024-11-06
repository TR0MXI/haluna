import path from 'node:path'
import fs from 'node:fs/promises'
import yaml from 'yaml'
import { Context } from 'koishi'
import { Config } from './config'
import { HaWsClinet } from './ws_client'
import { CallServiceYaml } from './types'
import { CreateCallServiceCommand, waitForAuth } from './utils'

export const name = 'haluna'
export * from './config'

export async function apply(ctx: Context, config: Config) {
        const logger = ctx.logger('haluna')
        const baseDir = ctx.baseDir
        const dataPath = path.join(baseDir, 'data', 'haluna')
        const ymlPath = path.join(dataPath, 'haluna.yml')
        const resourcesPath = path.join(baseDir, 'node_modules', 'koishi-plugin-haluna', 'resources')

        fs.mkdir(dataPath, { recursive: true })

        if (!(await fs.access(ymlPath).then(() => true).catch(() => false))) {
                await fs.copyFile(path.join(resourcesPath, 'haluna.yml'), ymlPath)
        }

        const data = await fs.readFile(ymlPath, 'utf-8')
        const configData = yaml.parse(data)

        const HaWs = new HaWsClinet(ctx, config)

        if (!HaWs) {
                logger.error('haluna初始化失败！')
                return
        }

        waitForAuth(HaWs).then(() => {
                configData.EventSubscribe.forEach((item: string) => {
                        HaWs.SubscribeEvents(item)
                })
        
                configData.CallService.forEach((item: CallServiceYaml) => {
                        CreateCallServiceCommand(ctx, item, HaWs)
                })

                logger.info('haluna已经准备好了！')
        })
}
