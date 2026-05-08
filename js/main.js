// 美食扭蛋机 - 主要逻辑

// 配置
const CONFIG = {
    ALIPAY_URL: 'https://ur.alipay.com/_2m8rCylYokzSaPsBdYi9yv',
    CANTEEN_PROBABILITY: 0.7  // 70%概率抽中食堂美食
};

// 状态
let isSpinning = false;
let currentFood = null;
let deviceId = null;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 获取设备ID
    deviceId = await getDeviceId();

    // 绑定事件
    document.getElementById('handle').addEventListener('click', spin);
    document.getElementById('flashBuyBtn').addEventListener('click', openFlashBuy);
    document.getElementById('likeBtn').addEventListener('click', () => submitFeedback('like'));
    document.getElementById('dislikeBtn').addEventListener('click', () => submitFeedback('dislike'));
    document.getElementById('shareBtn').addEventListener('click', copyShareLink);
    document.getElementById('adminLink').addEventListener('click', showAdminModal);
    document.getElementById('adminCancel').addEventListener('click', hideModal);
    document.getElementById('adminConfirm').addEventListener('click', verifyAdmin);
    document.getElementById('toastConfirm').addEventListener('click', hideModal);

    // 生成二维码
    generateQRCode();

    // 记录页面访问
    recordPageView();
});

// 加权随机选择函数，食堂美食权重更高
function getWeightedRandomFood() {
    const canteenFoodCount = foods.filter(f => f.floor > 0).length;
    const random = Math.random();

    if (random < CONFIG.CANTEEN_PROBABILITY) {
        // 抽中食堂美食
        const canteenFoods = foods.filter(f => f.floor > 0);
        return canteenFoods[Math.floor(Math.random() * canteenFoods.length)];
    } else {
        // 抽中其他美食
        const otherFoods = foods.filter(f => f.floor === 0);
        return otherFoods[Math.floor(Math.random() * otherFoods.length)];
    }
}

// 扭蛋主函数
async function spin() {
    if (isSpinning) return;
    isSpinning = true;

    const handle = document.getElementById('handle');
    const capsuleBall = document.getElementById('capsuleBall');
    const capsuleEmoji = document.getElementById('capsuleEmoji');
    const flyingCapsule = document.getElementById('flyingCapsule');
    const flyingEmoji = document.getElementById('flyingEmoji');
    const foodCard = document.getElementById('foodCard');
    const foodEmoji = document.getElementById('foodEmoji');
    const foodName = document.getElementById('foodName');
    const blessingCard = document.getElementById('blessingCard');
    const blessingText = document.getElementById('blessingText');
    const feedbackSection = document.getElementById('feedbackSection');

    handle.classList.add('disabled');
    foodCard.classList.remove('show');
    blessingCard.classList.remove('show');
    feedbackSection.style.opacity = '1';
    capsuleBall.classList.add('spinning');

    // 重置反馈按钮状态
    resetFeedbackButtons();

    let spinCount = 0;
    const spinInterval = setInterval(() => {
        capsuleEmoji.textContent = getWeightedRandomFood().emoji;
        spinCount++;

        if (spinCount >= 22) {
            clearInterval(spinInterval);
            capsuleBall.classList.remove('spinning');

            const finalFood = getWeightedRandomFood();
            currentFood = finalFood;
            const finalBlessing = blessings[Math.floor(Math.random() * blessings.length)];
            capsuleEmoji.textContent = finalFood.emoji;
            flyingEmoji.textContent = finalFood.emoji;

            // 重置飞行扭蛋动画
            flyingCapsule.style.left = '50%';
            flyingCapsule.style.top = '45%';
            flyingCapsule.style.transform = 'translate(-50%, -50%)';

            flyingCapsule.classList.remove('animate');
            void flyingCapsule.offsetWidth;
            flyingCapsule.classList.add('animate');

            setTimeout(() => {
                flyingCapsule.classList.remove('animate');
                foodEmoji.textContent = finalFood.emoji;
                foodName.textContent = finalFood.name;
                blessingText.textContent = finalBlessing;
                foodCard.classList.add('show');
                blessingCard.classList.add('show');
                createConfetti();

                // 判断是否以"3楼"或"4楼"开头，控制闪购入口显示
                const flashBuyRight = document.getElementById('flashBuyRight');
                if (finalFood.floor > 0) {
                    flashBuyRight.style.display = 'none';
                } else {
                    flashBuyRight.style.display = 'flex';
                }

                // 检查今日是否已反馈
                if (hasFeedbackToday(finalFood.name)) {
                    disableFeedbackButtons();
                }

                // 记录抽奖
                recordSpin(finalFood);

                setTimeout(() => {
                    handle.classList.remove('disabled');
                    isSpinning = false;
                }, 500);
            }, 1500);
        }
    }, 80);
}

// 打开闪购外卖
function openFlashBuy() {
    if (isInAlipay()) {
        // 支付宝环境：直接跳转
        window.location.href = CONFIG.ALIPAY_URL;
    } else {
        // 其他环境：弹窗提示
        showModalToast('请打开淘宝闪购选购');
    }
}

// 提交用户反馈
async function submitFeedback(action) {
    if (!currentFood) return;

    // 检查今日是否已反馈
    if (hasFeedbackToday(currentFood.name)) {
        showToast('今日已反馈过该档口');
        return;
    }

    // 禁用按钮
    disableFeedbackButtons();

    // 保存本地记录
    saveTodayFeedback(currentFood.name, action);

    // 发送到服务器
    const result = await apiRequest('feedback', 'POST', {
        food_name: currentFood.name,
        food_emoji: currentFood.emoji,
        action: action,
        device_id: deviceId
    });

    if (result) {
        showToast(action === 'like' ? '感谢反馈！祝用餐愉快！' : '好的，换个口味再试试吧~');
    } else {
        showToast('反馈已记录（离线模式）');
    }
}

// 重置反馈按钮状态
function resetFeedbackButtons() {
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');

    likeBtn.disabled = false;
    likeBtn.classList.remove('submitted');
    likeBtn.innerHTML = '<span>👍</span> 去了，很赞！';

    dislikeBtn.disabled = false;
    dislikeBtn.classList.remove('submitted');
    dislikeBtn.innerHTML = '<span>👎</span> 没去';
}

// 禁用反馈按钮
function disableFeedbackButtons() {
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');

    likeBtn.disabled = true;
    likeBtn.classList.add('submitted');
    likeBtn.innerHTML = '已反馈';

    dislikeBtn.disabled = true;
    dislikeBtn.classList.add('submitted');
    dislikeBtn.innerHTML = '已反馈';
}

// 记录抽奖
async function recordSpin(food) {
    // 增加本地计数
    incrementTodaySpinCount();

    // 发送到服务器
    await apiRequest('spin', 'POST', {
        food_name: food.name,
        food_emoji: food.emoji,
        floor: food.floor,
        device_id: deviceId
    });
}

// 记录页面访问
async function recordPageView() {
    // 发送到服务器
    await apiRequest('pageview', 'POST', {
        device_id: deviceId
    });
}

// 生成二维码
function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';

    new QRCode(qrContainer, {
        text: window.location.href,
        width: 150,
        height: 150,
        colorDark: '#333333',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
}

// 复制分享链接
async function copyShareLink() {
    const success = await copyToClipboard(window.location.href);
    if (success) {
        showToast('链接已复制，快去分享给同事吧！");
    } else {
        showToast('复制失败，请手动复制');
    }
}

// 显示管理弹窗
function showAdminModal() {
    document.getElementById('adminModal').classList.add('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
}

// 验证管理员密码
async function verifyAdmin() {
    const password = document.getElementById('adminPassword').value;

    // 简单密码验证（生产环境应通过服务器验证）
    const validPassword = await getAdminPassword();

    if (password === validPassword) {
        hideModal();
        window.location.href = '/admin.html';
    } else {
        showToast('密码错误');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// 获取管理员密码（从服务器）
async function getAdminPassword() {
    const result = await apiRequest('config?key=admin_password');
    return result?.value || 'admin123';  // 默认密码，上线前修改
}

// 彩屑动画
function createConfetti() {
    const colors = ['#ff8a80', '#ffcc80', '#a5d6a7', '#90caf9', '#ce93d8', '#fff59d', '#ffab91'];
    for (let i = 0; i < 35; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-15px';
            const size = 8 + Math.random() * 10;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
            confetti.style.animationDuration = (2.5 + Math.random() * 1.5) + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 35);
    }
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (document.getElementById('adminModal').classList.contains('show')) {
            verifyAdmin();
        } else if (document.getElementById('toastModal').classList.contains('show')) {
            hideModal();
        }
    }
    if (e.key === 'Escape') {
        hideModal();
    }
});