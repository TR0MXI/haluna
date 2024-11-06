"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const koishi_1 = require("koishi");
exports.Config = koishi_1.Schema.object({
    path: koishi_1.Schema.string()
        .required()
        .description('Ha 地址'),
    token: koishi_1.Schema.string()
        .required()
        .description('Ha AuthToken'),
    ping: koishi_1.Schema.number()
        .default(5)
        .description('Ping 间隔(s)'),
    timeout: koishi_1.Schema.number()
        .default(5)
        .description('超时时间(s)'),
    debug: koishi_1.Schema.boolean()
        .default(false)
        .description('调试模式')
});
