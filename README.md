# 美食扭蛋机 🎰

帮你决定今天吃什么的趣味工具。

## 功能特性

- 🎲 **随机抽选** - 70%概率抽中食堂档口，30%概率抽中其他美食
- 📊 **数据统计** - 记录抽中次数、时段分布、档口排行
- 👍 **用户反馈** - 点赞/踩功能，记录真实用餐体验
- 📱 **二维码分享** - 一键生成二维码，扫码即用
- 🔗 **外卖入口** - 非食堂美食自动显示淘宝闪购外卖入口
- 📈 **管理后台** - 密码保护，查看详细统计数据

## 目录结构

```
gacha-food/
├── index.html              # 首页 - 扭蛋机主体
├── admin.html              # 管理后台页面
├── css/
│   ├── main.css           # 首页样式
│   └── admin.css          # 管理后台样式
├── js/
│   ├── data/
│   │   └── foods.js       # 食堂数据配置
│   ├── utils.js           # 工具函数
│   ├── main.js            # 首页逻辑
│   └── admin.js           # 管理后台逻辑
├── api/
│   ├── spin.js            # 抽奖记录API
│   ├── feedback.js        # 用户反馈API
│   └── stats.js           # 统计查询API
├── package.json           # 依赖配置
├── vercel.json            # Vercel部署配置
└── README.md              # 项目说明
```

## 部署步骤

### 1. 注册账号

- [Vercel](https://vercel.com) - 前端托管
- [Supabase](https://supabase.com) - 数据库

### 2. 配置 Supabase

创建项目后，执行以下SQL初始化数据库表：

```sql
-- 抽奖记录表
CREATE TABLE spin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_name TEXT NOT NULL,
    food_emoji TEXT,
    floor INTEGER,
    device_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户反馈表
CREATE TABLE feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_name TEXT NOT NULL,
    food_emoji TEXT,
    action TEXT NOT NULL CHECK (action IN ('like', 'dislike')),
    device_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_spin_logs_created_at ON spin_logs(created_at);
CREATE INDEX idx_spin_logs_food_name ON spin_logs(food_name);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX idx_feedbacks_food_name ON feedbacks(food_name);
```

### 3. 配置 Vercel 环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `SUPABASE_URL` | Supabase项目的URL |
| `SUPABASE_SERVICE_KEY` | Supabase的service_role key |
| `ADMIN_PASSWORD` | 管理后台密码（自定义） |

### 4. 部署

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 部署到生产环境
npm run deploy
```

### 5. 访问

部署完成后，你会获得一个类似 `gacha-food.vercel.app` 的域名。

## 管理后台

访问 `/admin.html`，输入管理员密码即可查看统计数据。

默认密码：`admin123`（上线前请修改）

## 自定义配置

### 修改食堂档口

编辑 `js/data/foods.js` 文件：

```javascript
const foods = [
    // 4楼餐厅
    { emoji: "🥗", name: "4楼沙拉", floor: 4 },
    // ...添加更多档口
];
```

### 修改外卖跳转链接

编辑 `js/main.js` 文件中的 `CONFIG.ALIPAY_URL`。

### 修改抽奖概率

编辑 `js/main.js` 文件中的 `CONFIG.CANTEEN_PROBABILITY`。

## 技术栈

- 前端：HTML / CSS / JavaScript
- 托管：Vercel
- 数据库：Supabase (PostgreSQL)
- 图表：Chart.js
- 二维码：qrcode.js

## License

MIT