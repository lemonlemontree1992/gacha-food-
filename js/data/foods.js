// 食堂数据配置
const foods = [
    // 4楼餐厅 (7个)
    { emoji: "🥗", name: "4楼沙拉", floor: 4 },
    { emoji: "🥟", name: "4楼水饺", floor: 4 },
    { emoji: "🍚", name: "4楼自选称重档口菜", floor: 4 },
    { emoji: "🥣", name: "4楼蘸水", floor: 4 },
    { emoji: "🍛", name: "4楼自选档口", floor: 4 },
    { emoji: "🍜", name: "4楼面条", floor: 4 },
    { emoji: "🌶️", name: "4楼江西小炒", floor: 4 },
    // 3楼餐厅 (13个)
    { emoji: "🍜", name: "3楼山西面馆", floor: 3 },
    { emoji: "🍲", name: "3楼湖南米粉", floor: 3 },
    { emoji: "🥘", name: "3楼冒菜", floor: 3 },
    { emoji: "🍛", name: "3楼西北拉面抓饭", floor: 3 },
    { emoji: "🥟", name: "3楼粥/包子/锅贴", floor: 3 },
    { emoji: "🔥", name: "3楼麻辣香锅", floor: 3 },
    { emoji: "🍲", name: "3楼猪肚鸡", floor: 3 },
    { emoji: "🍜", name: "3楼五谷渔粉", floor: 3 },
    { emoji: "🍱", name: "3楼自选档口", floor: 3 },
    { emoji: "🍛", name: "3楼咖喱鸡排饭", floor: 3 },
    { emoji: "🍗", name: "3楼烧腊", floor: 3 },
    { emoji: "🥘", name: "3楼小碗菜", floor: 3 },
    { emoji: "🍜", name: "3楼黄牛肉米线", floor: 3 },
    // 其他美食 (8个) - 30%概率
    { emoji: "🍣", name: "精致寿司", floor: 0 },
    { emoji: "🍔", name: "双层汉堡", floor: 0 },
    { emoji: "🍕", name: "意式披萨", floor: 0 },
    { emoji: "🌮", name: "墨西哥卷饼", floor: 0 },
    { emoji: "🍝", name: "奶油意面", floor: 0 },
    { emoji: "🥘", name: "韩式烤肉", floor: 0 },
    { emoji: "🥩", name: "澳洲牛排", floor: 0 },
    { emoji: "🦐", name: "油焖大虾", floor: 0 }
];

// 吉祥语配置
const blessings = [
    "🎊 祝你万事如意，事事顺心！",
    "💼 工作顺利，事业蒸蒸日上！",
    "💰 恭喜发财，今年挣大钱！",
    "💪 身体倍棒，吃嘛嘛香！",
    "🌟 万事如意，心想事成，好运连连！",
    "🎯 工作顺利，升职加薪，前程似锦！",
    "💎 财源滚滚来，钱包鼓鼓哒！",
    "🏃 身体健康，精力充沛，活力满满！",
    "✨ 祝你万事如意，烦恼全消散！",
    "🚀 工作顺利，所向披靡，业绩翻番！",
    "🧧 挣大钱，发大财，数钱数到手抽筋！",
    "🏋️ 身体倍棒，百病不侵，健康长寿！",
    "🍀 万事如意，好运挡不住！",
    "📈 工作顺心，业绩长虹，步步高升！",
    "💵 日进斗金，财源广进，钱包满满！",
    "💪 身体健康，平安喜乐，百岁无忧！",
    "🌸 万事顺遂，心想事成，幸福美满！",
    "⭐ 事业有成，工作顺心，万事大吉！",
    "🔮 财运亨通，日进斗金，富贵双全！",
    "🌈 身体倍儿棒，心情美美哒，吃嘛嘛香！"
];

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { foods, blessings };
}