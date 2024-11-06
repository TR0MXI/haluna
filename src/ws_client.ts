import { Context, Service } from "koishi"
import { Config } from "./config"
import { 
        AuthMessage, 
        CommandMessage, 
        EventSubscribeMessage, 
        CallServiceMessage, 
        TriggerMessage
} from "./types"
import { CheckUrl } from "./utils"

declare module 'koishi' {
        interface Context {
                haluna: HaWsClinet
        }
}

declare module 'koishi' {
        interface Events {
                'haluna/event'(message: any): void
        }
}

export class HaWsClinet extends Service{
        private socket: WebSocket
        private path: string
        private timeout: number
        private debuglogger: Function
        private seq: number = 0
        private isAuth: boolean = false
        private AuthMessage: AuthMessage
        private eventSubscriptions: Map<number, string> = new Map()
        private static pingMessage: CommandMessage = {
                id: 1,
                type: 'ping'
        }

        constructor(ctx: Context, config: Config){
                super(ctx, 'haluna')
                this.path = CheckUrl(config.path)
                this.timeout = config.timeout
                this.AuthMessage = {
                        type: 'auth',
                        access_token: config.token
                }

                if (config.debug) {
                        this.debuglogger = ctx.logger.info.bind(ctx.logger)
                } else {
                        this.debuglogger = ctx.logger.debug.bind(ctx.logger)
                }
                
                try {
                        this.socket = ctx.http.ws(this.path+ '/api/websocket')
                        this.socket.onopen = this.onOpen
                        this.socket.onmessage = this.onMessage
                        this.socket.onerror = this.onError
                } catch(error) {
                        ctx.logger.error(error)
                }

                if (this.socket) {
                        ctx.setInterval(() => {
                                this.Send(HaWsClinet.pingMessage)
                        }, config.ping * 1000)
                }
        }

        private onOpen = () => {
                this.ctx.logger.info(`唉呀！正在尝试连接到${this.path}了啦~`)
        }
            
        private onMessage = (event: MessageEvent<any>) => {
                let message = null
            
                try {
                        message = JSON.parse(event.data)
                } catch (error) {
                        this.ctx.logger.info('八...八嘎! 你这家伙，发了什么乱七八糟的东西过来啊！' + error)
                        return
                }
            
                const type = message.type
            
                if (!type) {
                        this.ctx.logger.warn('你这笨蛋！message里居然没有type内容，真是让人头疼啊！')
                        return
                }

                switch(type) {
                        case 'auth_required':
                                this.Auth()
                                break

                        case 'auth_ok':
                                this.ctx.logger.info('哼！终于认证成功了！')
                                this.isAuth = true
                                break

                        case 'auth_invalid':
                                this.ctx.logger.error('你这个笨蛋！认证失败了！')
                                break

                        case 'result':
                                this.debuglogger('哼！收到了结果！' + JSON.stringify(message))
                                break

                        case 'event':
                                this.debuglogger('哼！收到了事件' + JSON.stringify(message))
                                this.ctx.emit('haluna/event', message)
                                break

                        case 'pong':
                                this.debuglogger('哼！收到了pong！')
                                break
                }
        }

        private onError = (event: Event) => {
                this.ctx.logger.error('哎呀！出错了！' + JSON.stringify(event))
        }

        private Auth(): void {
                this.socket.send(JSON.stringify(this.AuthMessage))
        }

        public HaLogger(format: any, ...param: any[]): void {
                this.debuglogger(format, ...param)
        }

        public IsAuth(): boolean {
                return this.isAuth
        }

        public GetTimeOut(): number {
                return this.timeout
        }

        public async Send(data: CommandMessage): Promise<any>{
                data.id = ++this.seq
                const message = JSON.stringify(data)
                this.socket.send(message)
        }
        
        public async GetStates(): Promise<void> {
                const message: CommandMessage = {
                        id: 1,
                        type: 'get_states'
                }
                await this.Send(message)
        }
        
        public async GetConfig(): Promise<void> {
                const message: CommandMessage = {
                        id: 1,
                        type: 'get_config'
                }
                await this.Send(message)
        }
        
        public async GetServices(): Promise<void> {
                const message: CommandMessage = {
                        id: 1,
                        type: 'get_services'
                }
                await this.Send(message)
        }
        
        public async GetPanels(): Promise<void> {
                const message: CommandMessage = {
                        id: 1,
                        type: 'get_panels'
                }
                await this.Send(message)
        }
        
        public async SubscribeEvents(...events: string[]): Promise<void> {
                for (const event of events) {
                                const message: EventSubscribeMessage = {
                                id: 1,
                                type: 'subscribe_events',
                                event_type: event
                        }
                        this.eventSubscriptions.set(await this.Send(message), event)
                }
        }

        public async SubscribeTrigger(
                platform: string, 
                options?: {
                        [key: string]: any
                }
        ): Promise<void> {
                const message: TriggerMessage = {
                        id: 1,
                        type: 'subscribe_trigger',
                        trigger: {
                                platform: platform,
                                ...options
                        }
                }
                await this.Send(message)
        }
        
        public async CallService(
                domain: string, 
                service: string, 
                serviceData?: any, 
                target?: {
                        entity_id: string
                }, 
                returnResponse: boolean = false
        ): Promise<void> {
                const message: CallServiceMessage = {
                        id: 1,
                        type: 'call_service',
                        domain,
                        service,
                        service_data: serviceData,
                        target,
                        return_response: returnResponse
                }
                await this.Send(message)
        }
}