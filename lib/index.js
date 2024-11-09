"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usage = exports.name = void 0;
exports.apply = apply;
const node_path_1 = __importDefault(require("node:path"));
const promises_1 = __importDefault(require("node:fs/promises"));
const yaml_1 = __importDefault(require("yaml"));
const ws_client_1 = require("./ws_client");
const utils_1 = require("./utils");
exports.name = 'haluna';
__exportStar(require("./config"), exports);
exports.usage = `<div align="center">
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
`;
async function apply(ctx, config) {
    const logger = ctx.logger('haluna');
    const baseDir = ctx.baseDir;
    const dataPath = node_path_1.default.join(baseDir, 'data', 'haluna');
    const ymlPath = node_path_1.default.join(dataPath, 'haluna.yml');
    const resourcesPath = node_path_1.default.join(baseDir, 'node_modules', 'koishi-plugin-haluna', 'resources');
    promises_1.default.mkdir(dataPath, { recursive: true });
    if (!(await promises_1.default.access(ymlPath).then(() => true).catch(() => false))) {
        await promises_1.default.copyFile(node_path_1.default.join(resourcesPath, 'haluna.yml'), ymlPath);
    }
    const data = await promises_1.default.readFile(ymlPath, 'utf-8');
    const configData = yaml_1.default.parse(data);
    const HaWs = new ws_client_1.HaWsClinet(ctx, config);
    if (!HaWs) {
        logger.error('haluna初始化失败！');
        return;
    }
    (0, utils_1.waitForAuth)(HaWs).then(() => {
        configData.EventSubscribe.forEach((item) => {
            HaWs.SubscribeEvents(item);
        });
        configData.CallService.forEach((item) => {
            (0, utils_1.CreateCallServiceCommand)(ctx, item, HaWs);
        });
        logger.info('haluna已经准备好了！');
    });
}
