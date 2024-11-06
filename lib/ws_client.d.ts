import { Context, Service } from "koishi";
import { Config } from "./config";
import { CommandMessage } from "./types";
declare module 'koishi' {
    interface Context {
        haluna: HaWsClinet;
    }
}
declare module 'koishi' {
    interface Events {
        'haluna/event'(message: any): void;
    }
}
export declare class HaWsClinet extends Service {
    private socket;
    private path;
    private timeout;
    private debuglogger;
    private seq;
    private isAuth;
    private AuthMessage;
    private eventSubscriptions;
    private static pingMessage;
    constructor(ctx: Context, config: Config);
    private onOpen;
    private onMessage;
    private onError;
    private Auth;
    HaLogger(format: any, ...param: any[]): void;
    IsAuth(): boolean;
    GetTimeOut(): number;
    Send(data: CommandMessage): Promise<any>;
    GetStates(): Promise<void>;
    GetConfig(): Promise<void>;
    GetServices(): Promise<void>;
    GetPanels(): Promise<void>;
    SubscribeEvents(...events: string[]): Promise<void>;
    SubscribeTrigger(platform: string, options?: {
        [key: string]: any;
    }): Promise<void>;
    CallService(domain: string, service: string, serviceData?: any, target?: {
        entity_id: string;
    }, returnResponse?: boolean): Promise<void>;
}
