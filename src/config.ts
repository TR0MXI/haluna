import { Schema } from "koishi"

export interface Config {
        path: string
        token: string
        ping: number
        timeout: number
        debug: boolean
}

export const Config: Schema<Config> = Schema.object({
        path: Schema.string()
                .required()
                .description('Ha 地址'),
        token: Schema.string()
                .required()
                .description('Ha AuthToken'),
        ping: Schema.number()
                .default(5)
                .description('Ping 间隔(s)'),
        timeout: Schema.number()
                .default(5)
                .description('超时时间(s)'),
        debug: Schema.boolean()
                .default(false)
                .description('调试模式')
})