// 1. 首次安装时，默认设置为“开启”状态
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get('pluginEnabled', (data) => {
        if (typeof data.pluginEnabled === 'undefined') {
            chrome.storage.sync.set({ pluginEnabled: true });
        }
    });
});

// 2. 封装注入和移除脚本的逻辑
const targetHost = "linux.do";

async function injectScripts(tabId) {
    console.log(`Injecting scripts into tab: ${tabId}`);
    try {
        await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['style.css']
        });
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
    } catch (err) {
        console.error(`Failed to inject scripts: ${err}`);
    }
}

async function removeScripts(tabId) {
    console.log(`Removing scripts from tab: ${tabId} by reloading.`);
    // 移除脚本最可靠的方式是重新加载页面
    await chrome.tabs.reload(tabId);
}

// 3. 监听网页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // SPA网站的URL变化不一定有 changeInfo.status，所以主要关注URL本身
    // changeInfo.url 是 SPA 导航时最可靠的指标
    if (changeInfo.url) {
        const topicUrlPattern = /^https:\/\/linux\.do\/t\//;

        // 检查新 URL 是否是帖子页面
        if (topicUrlPattern.test(changeInfo.url)) {
            // 是帖子页面，检查插件是否开启，然后注入脚本
            chrome.storage.sync.get('pluginEnabled', (data) => {
                if (data.pluginEnabled) {
                    injectScripts(tabId);
                }
            });
        } else if (changeInfo.url.includes("linux.do")) {
            // 仍然在 linux.do 网站，但不再是帖子页面（例如回到了首页）
            // 发送消息，命令 content script 清理自己
            chrome.tabs.sendMessage(tabId, { action: "cleanup" })
              .catch(err => console.log("发送清理消息失败，可能页面上没有脚本，这属于正常情况。", err));
        }
    }
});

// 4. 监听来自 popup 的消息，实现即时开关
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTab") {
        if (request.isEnabled) {
            injectScripts(request.tabId);
        } else {
            removeScripts(request.tabId);
        }
    }
    return true; // 表示会异步响应
});