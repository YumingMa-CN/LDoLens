document.addEventListener('DOMContentLoaded', function () {
    const enableSwitch = document.getElementById('enableSwitch');

    // 初始化开关：从存储中读取保存的状态
    chrome.storage.sync.get('pluginEnabled', function (data) {
        enableSwitch.checked = !!data.pluginEnabled;
    });

    // 监听开关点击事件
    enableSwitch.addEventListener('change', function () {
        const isEnabled = enableSwitch.checked;
        // 保存新状态到存储
        chrome.storage.sync.set({ pluginEnabled: isEnabled });
        
        // 通知后台立即更新当前页面
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            if (activeTab && activeTab.id) {
                 // 告诉后台，状态变了，请立即对当前页面执行操作
                 chrome.runtime.sendMessage({
                    action: "updateTab",
                    tabId: activeTab.id,
                    isEnabled: isEnabled
                });
            }
        });
    });
});