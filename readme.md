<div align="center">
  <a href="https://koishi.chat/" target="_blank">
    <img width="160" src="https://koishi.chat/logo.png" alt="logo">
  </a>
  <h1 id="koishi"><a href="https://koishi.chat/" target="_blank">Koishi</a></h1>
</div>

<div align="center">
 [![npm](https://img.shields.io/npm/v/koishi-plugin-haluna?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-haluna)

</div>


## 插件简介

这是一个将 Home Assistant 下的设备接入 Koishi 的插件，旨在实现通过 Koishi 控制家庭智能家居的功能。

## 支持的设备

- **已测试设备**：
  - 小米音箱
  - 部分小米智能家居设备

- **其他平台**：
  - 目前未进行测试

## 当前问题

- **超时机制**：待优化
- **事件订阅**：只有在调试模式下有日志显示
- **触发器订阅**：尚未实现

### Home Assistant 安装教程

请参考 [Home Assistant 安装教程](https://www.cnblogs.com/lumia1998/p/18529649) 以及 Miot 接入教程。


## 使用教程
插件配置页：
Ha地址：填写自己局域网或者内网穿透后的homeassistant的登录地址，如http://10.1.2.10:8123。
token：登录web的homeassistant的界面点击左下角账号名，如admin，进入管理界面，点击顶部右侧的安全标签页，拉到下面有个长期访问令牌，建立一个后填入。
接入设备要修改插件目录的/resources/haluna.yaml文件，目前仅测试了我的米家插座（别名水壶）和小爱同学pro，这2个算是通用模板，其他开关改成对应米家里的插座的名字和型号。具体的名字在homeassistant里点击首页的设备，有个实体标识符可以查看，小爱音箱同理。
开关配置的aiid和siid可在https://home.miot-spec.com/s这里查看
