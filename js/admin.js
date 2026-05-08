// 管理后台逻辑

// 状态
let currentRange = 'today';
let chartTrend = null;
let chartHourly = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    checkAuth();

    // 绑定事件
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRange = btn.dataset.range;
            loadAllData();
        });
    });

    document.getElementById('exportBtn').addEventListener('click', exportCSV);

    // 加载数据
    loadAllData();
});

// 检查登录状态
function checkAuth() {
    // 简单检查，生产环境应验证token
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (!isLoggedIn) {
        // 显示密码输入
        const password = prompt('请输入管理密码：');
        if (password !== 'admin123') {  // 默认密码
            alert('密码错误');
            window.location.href = '/';
            return;
        }
        sessionStorage.setItem('admin_logged_in', 'true');
    }
}

// 加载所有数据
async function loadAllData() {
    await Promise.all([
        loadOverview(),
        loadTrendChart(),
        loadHourlyChart(),
        loadRanking(),
        loadRecent()
    ]);
}

// 加载概览数据
async function loadOverview() {
    const data = await apiRequest(`stats?type=overview&range=${currentRange}`);

    if (data) {
        document.getElementById('totalVisitors').textContent = formatNumber(data.visitors || 0);
        document.getElementById('totalSpins').textContent = formatNumber(data.spins || 0);
        document.getElementById('totalLikes').textContent = formatNumber(data.likes || 0);
        document.getElementById('likeRate').textContent = data.likeRate ? `${data.likeRate}%` : '-';
    } else {
        // 模拟数据
        document.getElementById('totalVisitors').textContent = '128';
        document.getElementById('totalSpins').textContent = '356';
        document.getElementById('totalLikes').textContent = '89';
        document.getElementById('likeRate').textContent = '73%';
    }
}

// 加载趋势图
async function loadTrendChart() {
    const data = await apiRequest(`stats?type=trend&range=${currentRange}`);

    let labels, values;

    if (data) {
        labels = data.labels;
        values = data.values;
    } else {
        // 模拟数据
        labels = getMockLabels();
        values = getMockValues();
    }

    if (chartTrend) {
        chartTrend.destroy();
    }

    const ctx = document.getElementById('trendChart').getContext('2d');
    chartTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '抽奖次数',
                data: values,
                borderColor: '#ff7043',
                backgroundColor: 'rgba(255, 112, 67, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// 加载时段分布图
async function loadHourlyChart() {
    const data = await apiRequest(`stats?type=hourly&range=${currentRange}`);

    let labels, values;

    if (data) {
        labels = data.labels;
        values = data.values;
    } else {
        // 模拟数据
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        values = [5, 3, 2, 1, 0, 0, 2, 5, 15, 25, 45, 60, 55, 35, 30, 25, 20, 35, 42, 38, 25, 15, 10, 8];
    }

    if (chartHourly) {
        chartHourly.destroy();
    }

    const ctx = document.getElementById('hourlyChart').getContext('2d');
    chartHourly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '抽奖次数',
                data: values,
                backgroundColor: 'rgba(255, 112, 67, 0.8)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// 加载排行榜
async function loadRanking() {
    const data = await apiRequest(`stats?type=ranking&range=${currentRange}`);
    const tbody = document.getElementById('rankingBody');

    if (data && data.length > 0) {
        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td><span class="rank-badge ${getRankClass(index + 1)}">${index + 1}</span></td>
                <td>
                    <div class="food-name-cell">
                        <span class="food-emoji">${item.emoji}</span>
                        <span>${item.name}</span>
                    </div>
                </td>
                <td>${item.count}</td>
                <td>${item.likes || 0}</td>
                <td>${item.dislikes || 0}</td>
                <td><span class="like-rate ${getLikeRateClass(item.likeRate)}">${item.likeRate || 0}%</span></td>
            </tr>
        `).join('');
    } else {
        // 模拟数据
        const mockData = [
            { name: '3楼麻辣香锅', emoji: '🔥', count: 45, likes: 38, dislikes: 7, likeRate: 84 },
            { name: '4楼江西小炒', emoji: '🌶️', count: 42, likes: 35, dislikes: 7, likeRate: 83 },
            { name: '3楼黄牛肉米线', emoji: '🍜', count: 38, likes: 30, dislikes: 8, likeRate: 79 },
            { name: '3楼陕西面馆', emoji: '🍜', count: 35, likes: 28, dislikes: 7, likeRate: 80 },
            { name: '3楼烧腊', emoji: '🍗', count: 32, likes: 25, dislikes: 7, likeRate: 78 },
            { name: '3楼冒菜', emoji: '🥘', count: 28, likes: 22, dislikes: 6, likeRate: 79 },
            { name: '4楼水饺', emoji: '🥟', count: 25, likes: 20, dislikes: 5, likeRate: 80 },
            { name: '4楼面条', emoji: '🍜', count: 22, likes: 17, dislikes: 5, likeRate: 77 },
            { name: '3楼小碗菜', emoji: '🥘', count: 20, likes: 15, dislikes: 5, likeRate: 75 },
            { name: '3楼咖喱鸡排饭', emoji: '🍛', count: 18, likes: 14, dislikes: 4, likeRate: 78 }
        ];

        tbody.innerHTML = mockData.map((item, index) => `
            <tr>
                <td><span class="rank-badge ${getRankClass(index + 1)}">${index + 1}</span></td>
                <td>
                    <div class="food-name-cell">
                        <span class="food-emoji">${item.emoji}</span>
                        <span>${item.name}</span>
                    </div>
                </td>
                <td>${item.count}</td>
                <td>${item.likes}</td>
                <td>${item.dislikes}</td>
                <td><span class="like-rate ${getLikeRateClass(item.likeRate)}">${item.likeRate}%</span></td>
            </tr>
        `).join('');
    }
}

// 加载最近记录
async function loadRecent() {
    const data = await apiRequest(`stats?type=recent&range=${currentRange}`);
    const container = document.getElementById('recentList');

    if (data && data.length > 0) {
        container.innerHTML = data.map(item => `
            <div class="recent-item">
                <span class="recent-emoji">${item.emoji}</span>
                <div class="recent-info">
                    <div class="recent-name">${item.name}</div>
                    <div class="recent-time">${formatTime(item.created_at)}</div>
                </div>
                <span class="recent-feedback">${item.feedback || ''}</span>
            </div>
        `).join('');
    } else {
        // 模拟数据
        const mockRecent = [
            { name: '3楼麻辣香锅', emoji: '🔥', created_at: new Date(Date.now() - 5 * 60000).toISOString(), feedback: '👍' },
            { name: '4楼江西小炒', emoji: '🌶️', created_at: new Date(Date.now() - 15 * 60000).toISOString(), feedback: '👍' },
            { name: '3楼黄牛肉米线', emoji: '🍜', created_at: new Date(Date.now() - 30 * 60000).toISOString(), feedback: '' },
            { name: '3楼陕西面馆', emoji: '🍜', created_at: new Date(Date.now() - 45 * 60000).toISOString(), feedback: '👎' },
            { name: '精致寿司', emoji: '🍣', created_at: new Date(Date.now() - 60 * 60000).toISOString(), feedback: '' }
        ];

        container.innerHTML = mockRecent.map(item => `
            <div class="recent-item">
                <span class="recent-emoji">${item.emoji}</span>
                <div class="recent-info">
                    <div class="recent-name">${item.name}</div>
                    <div class="recent-time">${formatTime(item.created_at)}</div>
                </div>
                <span class="recent-feedback">${item.feedback}</span>
            </div>
        `).join('');
    }
}

// 导出CSV
async function exportCSV() {
    const data = await apiRequest(`stats?type=ranking&range=${currentRange}&export=true`);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '排名,档口,抽中次数,点赞,踩,好评率\n';

    // 模拟数据
    const mockData = [
        { name: '3楼麻辣香锅', count: 45, likes: 38, dislikes: 7, likeRate: 84 },
        { name: '4楼江西小炒', count: 42, likes: 35, dislikes: 7, likeRate: 83 },
        { name: '3楼黄牛肉米线', count: 38, likes: 30, dislikes: 8, likeRate: 79 }
    ];

    const exportData = data || mockData;

    exportData.forEach((item, index) => {
        csvContent += `${index + 1},${item.name},${item.count},${item.likes},${item.dislikes},${item.likeRate}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `美食扭蛋统计_${getTodayStr()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('导出成功');
}

// 辅助函数
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    return num.toString();
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString();
}

function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
}

function getLikeRateClass(rate) {
    return rate >= 70 ? 'like-rate' : 'like-rate low';
}

function getMockLabels() {
    const labels = [];
    const today = new Date();

    if (currentRange === 'today') {
        for (let i = 6; i <= 22; i++) {
            labels.push(`${i}:00`);
        }
    } else if (currentRange === 'week') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today - i * 86400000);
            labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
        }
    } else if (currentRange === 'month') {
        for (let i = 29; i >= 0; i -= 3) {
            const d = new Date(today - i * 86400000);
            labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
        }
    } else {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(`${d.getMonth() + 1}月`);
        }
    }

    return labels;
}

function getMockValues() {
    const count = getMockLabels().length;
    return Array.from({ length: count }, () => Math.floor(Math.random() * 50) + 10);
}