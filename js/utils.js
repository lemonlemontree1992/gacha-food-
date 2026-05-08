// 工具函数

// 检测是否在支付宝环境
function isInAlipay() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('alipay') || ua.includes('alipayclient');
}

// 检测是否在微信环境
function isInWechat() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
}

// 生成设备指纹（简化版，生产环境建议使用 fingerprintjs2）
async function getDeviceId() {
    // 尝试从 localStorage 获取已有的设备ID
    let deviceId = localStorage.getItem('gacha_device_id');

    if (!deviceId) {
        // 生成新的设备ID
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('device-fingerprint', 2, 2);

        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');

        // 简单的哈希函数
        deviceId = 'dev_' + simpleHash(fingerprint);
        localStorage.setItem('gacha_device_id', deviceId);
    }

    return deviceId;
}

// 简单哈希函数
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// 获取今日日期字符串 (YYYY-MM-DD)
function getTodayStr() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// 获取今日反馈记录
function getTodayFeedback() {
    const key = 'gacha_feedback_' + getTodayStr();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

// 保存今日反馈记录
function saveTodayFeedback(foodName, action) {
    const key = 'gacha_feedback_' + getTodayStr();
    const data = getTodayFeedback();
    data[foodName] = action;
    localStorage.setItem(key, JSON.stringify(data));
}

// 检查今日是否已对该档口反馈
function hasFeedbackToday(foodName) {
    const data = getTodayFeedback();
    return data.hasOwnProperty(foodName);
}

// 获取今日抽奖次数
function getTodaySpinCount() {
    const key = 'gacha_spin_count_' + getTodayStr();
    return parseInt(localStorage.getItem(key) || '0');
}

// 增加今日抽奖次数
function incrementTodaySpinCount() {
    const key = 'gacha_spin_count_' + getTodayStr();
    const count = getTodaySpinCount() + 1;
    localStorage.setItem(key, count.toString());
    return count;
}

// Toast 提示
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 显示弹窗提示（用于非支付宝环境的外卖入口）
function showModalToast(message) {
    const modal = document.getElementById('toastModal');
    const messageEl = document.getElementById('toastMessage');
    messageEl.textContent = message;
    modal.classList.add('show');
}

// 隐藏弹窗
function hideModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(m => m.classList.remove('show'));
}

// 复制文本到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

// API 请求封装
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`/api/${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '请求失败');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        // 离线模式：返回缓存数据或默认值
        return null;
    }
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isInAlipay,
        isInWechat,
        getDeviceId,
        getTodayStr,
        getTodayFeedback,
        saveTodayFeedback,
        hasFeedbackToday,
        getTodaySpinCount,
        incrementTodaySpinCount,
        showToast,
        showModalToast,
        hideModal,
        copyToClipboard,
        apiRequest
    };
}