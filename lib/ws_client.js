"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HaWsClinet = void 0;
const koishi_1 = require("koishi");
const utils_1 = require("./utils");
class HaWsClinet extends koishi_1.Service {
    socket;
    path;
    timeout;
    debuglogger;
    seq = 0;
    isAuth = false;
    AuthMessage;
    eventSubscriptions = new Map();
    static pingMessage = {
        id: 1,
        type: 'ping'
    };
    constructor(ctx, config) {
        super(ctx, 'haluna');
        this.path = (0, utils_1.CheckUrl)(config.path);
        this.timeout = config.timeout;
        this.AuthMessage = {
            type: 'auth',
            access_token: config.token
        };
        if (config.debug) {
            this.debuglogger = ctx.logger.info.bind(ctx.logger);
        }
        else {
            this.debuglogger = ctx.logger.debug.bind(ctx.logger);
        }
        try {
            this.socket = ctx.http.ws(this.path + '/api/websocket');
        }
        catch (error) {
            ctx.logger(error);
        }
        if (this.socket) {
            this.socket.onopen = this.onOpen;
            this.socket.onmessage = this.onMessage;
        }
        ctx.setInterval(() => {
            this.Send(HaWsClinet.pingMessage);
        }, config.ping * 1000);
    }
    onOpen = () => {
        this.ctx.logger.info(`唉呀！正在尝试连接到${this.path}了啦~`);
    };
    onMessage = (event) => {
        let message = null;
        try {
            message = JSON.parse(event.data);
        }
        catch (error) {
            this.ctx.logger.info('八...八嘎! 你这家伙，发了什么乱七八糟的东西过来啊！' + error);
            return;
        }
        const type = message.type;
        if (!type) {
            this.ctx.logger.warn('你这笨蛋！message里居然没有type内容，真是让人头疼啊！');
            return;
        }
        switch (type) {
            case 'auth_required':
                this.Auth();
                break;
            case 'auth_ok':
                this.ctx.logger.info('哼！终于认证成功了！');
                this.isAuth = true;
                break;
            case 'auth_invalid':
                this.ctx.logger.error('你这个笨蛋！认证失败了！');
                break;
            case 'result':
                this.debuglogger('哼！收到了结果！' + JSON.stringify(message));
                break;
            case 'event':
                this.debuglogger('哼！收到了事件' + JSON.stringify(message));
                this.ctx.emit('haluna/event', message);
                break;
            case 'pong':
                this.debuglogger('哼！收到了pong！');
                break;
        }
    };
    Auth() {
        this.socket.send(JSON.stringify(this.AuthMessage));
    }
    HaLogger(format, ...param) {
        this.debuglogger(format, ...param);
    }
    IsAuth() {
        return this.isAuth;
    }
    GetTimeOut() {
        return this.timeout;
    }
    async Send(data) {
        data.id = ++this.seq;
        const message = JSON.stringify(data);
        this.socket.send(message);
    }
    async GetStates() {
        const message = {
            id: 1,
            type: 'get_states'
        };
        await this.Send(message);
    }
    async GetConfig() {
        const message = {
            id: 1,
            type: 'get_config'
        };
        await this.Send(message);
    }
    async GetServices() {
        const message = {
            id: 1,
            type: 'get_services'
        };
        await this.Send(message);
    }
    async GetPanels() {
        const message = {
            id: 1,
            type: 'get_panels'
        };
        await this.Send(message);
    }
    async SubscribeEvents(...events) {
        for (const event of events) {
            const message = {
                id: 1,
                type: 'subscribe_events',
                event_type: event
            };
            this.eventSubscriptions.set(await this.Send(message), event);
        }
    }
    async SubscribeTrigger(platform, options) {
        const message = {
            id: 1,
            type: 'subscribe_trigger',
            trigger: {
                platform: platform,
                ...options
            }
        };
        await this.Send(message);
    }
    async CallService(domain, service, serviceData, target, returnResponse = false) {
        const message = {
            id: 1,
            type: 'call_service',
            domain,
            service,
            service_data: serviceData,
            target,
            return_response: returnResponse
        };
        await this.Send(message);
    }
}
exports.HaWsClinet = HaWsClinet;
