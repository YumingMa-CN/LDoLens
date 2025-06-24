# L站评论筛选器（LDoLens）

<p align="center">   <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">&nbsp;&nbsp;   <a href="README-en.md">     <img src="https://img.shields.io/badge/Switch%20Language-EN-blue" alt="Switch Language">   </a> </p>

------

## 介绍

L站评论筛选器（LDoLens）是为 LinuxDo（L站）论坛定制的 Chrome 扩展，可以在帖子评论中筛选和聚焦你关注的用户发言，只看你想看的内容，提升浏览体验。

- 支持在 [L站](https://linux.do/) 的主题帖中，只显示你指定用户的所有评论。
- 可自定义筛选人名单，随时开关筛选功能。
- 配置简单，界面轻便，支持自动保存设置。

------

## 安装方法

### 方式一：直接下载安装包（推荐）

1. 前往 [GitHub Releases 页面](https://github.com/YumingMa-CN/LDoLens/releases) 下载 `.crx` 文件，_或直接下载[最新版 Release](https://github.com/YumingMa-CN/LDoLens/releases/download/v1.0.0/LDoLens-v1.0.crx)_
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启 **开发者模式**
4. 将下载好的 `.crx` 文件**直接拖入**扩展页面进行安装
5. 安装成功后，浏览器工具栏会显示 L站评论筛选器图标 

### 方式二：源码自定义打包（生成属于你自己的 CRX）

1. 按上面方式克隆或下载项目源码到本地
2. （可选）根据需要修改代码
3. 打包生成`.crx`安装包：
   1. 打开 `chrome://extensions/` 并启用**开发者模式**
   2. 点击页面左上角的“打包扩展程序”
   3. “扩展程序根目录”填项目文件夹
   4. 若您没有私钥，则**不用**指定私钥，Chrome 会自动生成 `.pem` 文件，请妥善保管。后续升级须用同一个 `.pem` 文件，保证扩展ID不变
   5. 用生成的 `.crx` 文件安装（安装方式参考[方式一](#方式一：直接下载安装包（推荐）)）或分发

> 插件安装成功后，访问 L 站的任意主题页面，页面右侧会自动出现悬浮窗口

------

## 使用方法

1. 在 L站帖子页面（`https://linux.do/t/xxxx`） 点击工具栏插件图标
2. 在弹出的过滤器设置界面，勾选你想要“只看”的用户名（支持一个或多个）；若**全不选**，则视为不启用筛选。
3. 确认后，该页面自动只显示这些人的评论，屏蔽其它发言
4. 可随时关闭或修改筛选条件，操作立刻生效

------

## 权限说明

- `storage`：用于本地保存你的筛选设置
- `scripting`：用于动态修改页面内容，实现评论筛选功能
- `https://linux.do/t/*`：仅作用于 LinuxDo 论坛的主题页面

------

## 文件结构说明

```
LDoLens
├── background.js
├── content.js
├── icons
│   ├── filter-icon-128.png
│   ├── filter-icon-16.png
│   ├── filter-icon-48.png
│   └── funnel-icon.svg
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
├── style.css
├── README.md
├── README-en.md
└── LICENSE
```

------

## 常见问题

- 未找到悬浮窗口？请确认页面地址为 `https://linux.do/t/` 下的帖子。
- 如反馈BUG或建议，请在 issue 区留言或联系。

------

## 许可协议

MIT License

------

## 致谢

感谢 LinuxDo（L站）社区老友们的支持和测试！