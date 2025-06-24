// [新增] 注入守卫，防止脚本重复执行
(function() {

    // 2. 注入守卫逻辑放在函数内部的最上方
    // 这里的 return 现在是合法的，因为它在一个函数内部
    if (window.hasCommentFiltererInjected) {
      return; 
    }
    window.hasCommentFiltererInjected = true;


let state = { commenters: new Map(), traceReplies: false, lastSelectedIds: [] };
let mainObserver = null;
let currentTopicId = null;
const iconUrl = chrome.runtime.getURL('icons/my-filter-icon.png'); 

function resetStateAndUI() {
    if (mainObserver) mainObserver.disconnect();
    mainObserver = null;
    document.getElementById('comment-filter-icon')?.remove();
    document.getElementById('comment-filter-modal')?.remove();
    state = { commenters: new Map(), traceReplies: false, lastSelectedIds: [] };
}

function initializeForTopic() {
    createAndAppendUI();
    startMainObserver();
}

function startMainObserver() {
    if (mainObserver) mainObserver.disconnect();
    mainObserver = new MutationObserver(debounce(handleDOMChange, 300));
    mainObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
}

function handleDOMChange() {
    createAndAppendUI();
    updateFilterList();
    if (state.lastSelectedIds.length > 0) applyFilter(state.lastSelectedIds, false);
}

function updateFilterList() {
    const freshCommenters = getCommenters();
    const userListElement = document.getElementById('user-filter-list');
    if (!userListElement) return;
    const isFilterActive = state.lastSelectedIds.length > 0;
    freshCommenters.forEach((commenterData, userId) => {
        state.commenters.set(userId, commenterData);
        if (!userListElement.querySelector(`input[value="${userId}"]`)) {
            const isCheckedByDefault = isFilterActive;
            const checkedAttribute = isCheckedByDefault ? 'checked' : '';
            const li = document.createElement('li');
            li.className = 'filter-user-item';
            li.innerHTML = `<label><input type="checkbox" class="user-checkbox" value="${userId}" ${checkedAttribute}><img src="${commenterData.avatar}" class="filter-user-avatar"><span class="filter-user-name">${commenterData.name}</span></label>`;
            userListElement.appendChild(li);
            if (isCheckedByDefault) state.lastSelectedIds.push(userId);
        } else {
            const avatarImg = userListElement.querySelector(`input[value="${userId}"]`).closest('li').querySelector('.filter-user-avatar');
            if (avatarImg && avatarImg.src !== commenterData.avatar && commenterData.avatar) avatarImg.src = commenterData.avatar;
        }
    });
}

function createAndAppendUI() {
    if (document.getElementById('comment-filter-icon')) return;
    const initialCommenters = getCommenters();
    if (initialCommenters.size === 0) return;
    state.commenters = initialCommenters;

    const filterIcon = document.createElement('div');
    filterIcon.id = 'comment-filter-icon';
    document.body.appendChild(filterIcon);

    filterIcon.title = '筛选评论用户 (可上下拖动)';
    filterIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000000" class="bi bi-funnel" viewBox="0 0 16 16">
  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"/>
</svg>`;
    
    makeElementDraggable(filterIcon);
    
    if (!document.getElementById('comment-filter-modal')) {
        const modal = document.createElement('div');
        modal.id = 'comment-filter-modal';
        modal.className = 'filter-modal-hidden';
        let userListHTML = Array.from(state.commenters.values()).map(c => `<li class="filter-user-item"><label><input type="checkbox" class="user-checkbox" value="${c.id}"><img src="${c.avatar}" class="filter-user-avatar"><span class="filter-user-name">${c.name}</span></label></li>`).join('');
        modal.innerHTML = `<div class="filter-modal-content"><div class="filter-modal-header"><h3>筛选评论用户</h3><button id="close-filter-modal" title="关闭">&times;</button></div><div class="filter-modal-body"><input type="text" id="user-search-input" placeholder="搜索用户..."><ul id="user-filter-list">${userListHTML}</ul></div><div class="filter-modal-footer"><div class="trace-switch-container"><label class="trace-switch"><input type="checkbox" id="trace-replies-checkbox"><span class="slider round"></span></label><span>追踪回复链</span></div><div class="action-buttons-container"><button id="select-all-users">全选</button><button id="deselect-all-users">取消全选</button><button id="apply-filter-btn">应用筛选</button></div></div></div>`;
        document.body.appendChild(modal);
        modal.querySelector('#close-filter-modal').addEventListener('click', () => modal.classList.add('filter-modal-hidden'));
        modal.addEventListener('click', (e) => { if (e.target.id === 'comment-filter-modal') modal.classList.add('filter-modal-hidden'); });
        modal.querySelector('#user-search-input').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            modal.querySelectorAll('.filter-user-item').forEach(item => {
                const username = item.querySelector('.filter-user-name').textContent.toLowerCase();
                item.style.display = username.includes(searchTerm) ? '' : 'none';
            });
        });
        modal.querySelector('#select-all-users').addEventListener('click', () => modal.querySelectorAll('.user-checkbox').forEach(cb => cb.checked = true));
        modal.querySelector('#deselect-all-users').addEventListener('click', () => modal.querySelectorAll('.user-checkbox').forEach(cb => cb.checked = false));
        modal.querySelector('#apply-filter-btn').addEventListener('click', () => {
            applyFilter(Array.from(modal.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value));
            modal.classList.add('filter-modal-hidden');
        });
        modal.querySelector('#trace-replies-checkbox').addEventListener('change', (e) => {
            state.traceReplies = e.target.checked;
            if (state.lastSelectedIds.length > 0) applyFilter(state.lastSelectedIds);
        });
    }
    filterIcon.addEventListener('click', () => { // event参数 'e' 已经不需要了
        // 直接检查 filterIcon 自身是否有 wasDragged 标记
        // 如果刚刚拖动过 (wasDragged 为 true)，就直接返回，不执行后面的开窗代码
        if (filterIcon.wasDragged) {
            return;
        }
        
        // 如果没有拖动过，就正常打开弹窗
        document.getElementById('comment-filter-modal')?.classList.remove('filter-modal-hidden');
    });

}

function makeElementDraggable(element) {
    let pos_y = 0, initial_mouse_y = 0;
    
    const savedTop = localStorage.getItem('filterIconPositionTop');
    if (savedTop) {
        element.style.top = savedTop;
    }

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        element.wasDragged = false;
        initial_mouse_y = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        element.wasDragged = true;
        pos_y = initial_mouse_y - e.clientY;
        initial_mouse_y = e.clientY;
        
        const newTop = element.offsetTop - pos_y;
        const maxY = window.innerHeight - element.offsetHeight;
        
        // 只更新top值，实现垂直拖动
        element.style.top = `${Math.max(0, Math.min(newTop, maxY))}px`;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        if(element.wasDragged) {
            localStorage.setItem('filterIconPositionTop', element.style.top);
        }
    }
}

// ... applyFilter, getCommenters, debounce, waitForElement, 和启动器保持不变 ...
function applyFilter(selectedUserIds, isUserAction = true) {
    if (isUserAction) state.lastSelectedIds = selectedUserIds;
    const allPostsOnPage = document.querySelectorAll('article[data-post-id]');
    if (selectedUserIds.length === 0) { allPostsOnPage.forEach(post => post.style.display = ''); return; }
    let finalUserIdsToShow = new Set(selectedUserIds);
    if (state.traceReplies) {
        const userIdToPostsMap = new Map();
        allPostsOnPage.forEach(post => {
            const userId = post.querySelector('.names a[data-user-card]')?.getAttribute('data-user-card');
            if (userId) { if (!userIdToPostsMap.has(userId)) userIdToPostsMap.set(userId, []); userIdToPostsMap.get(userId).push(post); }
        });
        const queue = [...selectedUserIds];
        const processedUsers = new Set(selectedUserIds);
        while (queue.length > 0) {
            const currentUserId = queue.shift();
            const userPosts = userIdToPostsMap.get(currentUserId) || [];
            for (const post of userPosts) {
                const replyTab = post.querySelector('.reply-to-tab span');
                if (!replyTab) continue;
                const parentUsername = replyTab.textContent.trim();
                const parentUser = Array.from(state.commenters.values()).find(c => c.name === parentUsername);
                if (parentUser && !processedUsers.has(parentUser.id)) {
                    finalUserIdsToShow.add(parentUser.id);
                    processedUsers.add(parentUser.id);
                    queue.push(parentUser.id);
                }
            }
        }
    }
    allPostsOnPage.forEach(post => {
        const postAuthorId = post.querySelector('.names a[data-user-card]')?.getAttribute('data-user-card');
        post.style.display = (postAuthorId && finalUserIdsToShow.has(postAuthorId)) ? '' : 'none';
    });
}
function getCommenters() {
  const posts = document.querySelectorAll('article[data-post-id]');
  const commenters = new Map();
  posts.forEach(post => {
    const userLink = post.querySelector('.names a[data-user-card]');
    if (userLink) {
      const username = userLink.textContent.trim();
      const userId = userLink.getAttribute('data-user-card');
      const avatarSrc = post.querySelector('.post-avatar img.avatar')?.src || '';
      if (userId && !commenters.has(userId)) {
        commenters.set(userId, { id: userId, name: username, avatar: avatarSrc });
      } else if (userId && commenters.has(userId)) {
        const existing = commenters.get(userId);
        if (!existing.avatar && avatarSrc) existing.avatar = avatarSrc;
      }
    }
  });
  return commenters;
}
let debounceTimer;
function debounce(func, delay) { return function() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => func.apply(this, arguments), delay); }; }
function waitForElement(selector) { return new Promise(resolve => { if (document.querySelector(selector)) return resolve(document.querySelector(selector)); const observer = new MutationObserver(() => { if (document.querySelector(selector)) { resolve(document.querySelector(selector)); observer.disconnect(); } }); observer.observe(document.body, { childList: true, subtree: true }); }); }
const navigationObserver = new MutationObserver(() => {
    const titleElement = document.querySelector('h1[data-topic-id]');
    const newTopicId = titleElement ? titleElement.getAttribute('data-topic-id') : null;
    if (newTopicId && newTopicId !== currentTopicId) {
        currentTopicId = newTopicId;
        resetStateAndUI();
        waitForElement('article[data-post-id]').then(initializeForTopic);
    }
});
navigationObserver.observe(document.body, { childList: true, subtree: true });
waitForElement('h1[data-topic-id]').then(element => {
    const initialTopicId = element.getAttribute('data-topic-id');
    if (initialTopicId !== currentTopicId) {
        currentTopicId = initialTopicId;
        initializeForTopic();
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 检查是否是来自后台的“清理”命令
    if (request.action === 'cleanup') {
        console.log('接收到清理命令，正在移除UI和监听器...');
        
        // 调用我们已经写好的重置函数，它会移除所有东西
        resetStateAndUI();
        
        // 我们还需要把注入守卫重置，以便用户再导航回帖子页时能重新注入
        window.hasCommentFiltererInjected = false;
        
        // (可选)可以回复一个消息给后台，表示已处理
        sendResponse({ status: "cleaned" }); 
    }
    // 保持消息通道开放，以备异步响应
    return true; 
});



})();
