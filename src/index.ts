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
export const usage = `<div align="center">
  <a href="https://koishi.chat/" target="_blank">
    <img width="160" src="https://koishi.chat/logo.png" alt="logo">
  </a>
  <h1 id="koishi"><a href="https://koishi.chat/" target="_blank">Koishi</a></h1>
</div>

## 插件简介

这是一个将 Home Assistant 下的设备接入 Koishi 的插件，旨在实现通过 Koishi 控制家庭智能家居的功能。

## 支持的设备

- **已测试设备**：
  - 小米音箱
  - 部分小米智能家居设备

- **其他平台**：
  - 目前未进行测试

## 当前问题(没人催更的话或许...)

- **超时机制**：待优化
- **事件订阅**：只有在调试模式下有日志显示
- **触发器订阅**：尚未实现

### Home Assistant 安装教程

请参考 [Home Assistant 安装教程](https://www.cnblogs.com/lumia1998/p/18529649) 以及 Miot 接入教程。


## 使用教程
插件配置文件：资源管理器下data/haluna/haluna.yml
`

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
