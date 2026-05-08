// Vercel Serverless Function - 统计API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, range = 'today' } = req.query;

    try {
        const { startDate, endDate } = getDateRange(range);

        switch (type) {
            case 'overview':
                return await getOverview(res, startDate, endDate);
            case 'trend':
                return await getTrend(res, range);
            case 'hourly':
                return await getHourly(res, startDate, endDate);
            case 'ranking':
                return await getRanking(res, startDate, endDate);
            case 'recent':
                return await getRecent(res, startDate, endDate);
            default:
                return res.status(400).json({ error: 'Invalid type' });
        }
    } catch (error) {
        console.error('Stats API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function getDateRange(range) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
        case 'today':
            return { startDate: today, endDate: now };
        case 'week':
            const weekAgo = new Date(today - 7 * 86400000);
            return { startDate: weekAgo, endDate: now };
        case 'month':
            const monthAgo = new Date(today - 30 * 86400000);
            return { startDate: monthAgo, endDate: now };
        case 'all':
            return { startDate: new Date(2020, 0, 1), endDate: now };
        default:
            return { startDate: today, endDate: now };
    }
}

async function getOverview(res, startDate, endDate) {
    // 获取抽奖总数
    const { count: spins } = await supabase
        .from('spin_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    // 获取独立访客数
    const { data: visitors } = await supabase
        .from('spin_logs')
        .select('device_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    const uniqueVisitors = new Set(visitors?.map(v => v.device_id)).size;

    // 获取点赞数
    const { count: likes } = await supabase
        .from('feedbacks')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'like')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    // 获取总反馈数
    const { count: totalFeedbacks } = await supabase
        .from('feedbacks')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    const likeRate = totalFeedbacks > 0 ? Math.round((likes / totalFeedbacks) * 100) : 0;

    return res.status(200).json({
        visitors: uniqueVisitors,
        spins: spins || 0,
        likes: likes || 0,
        likeRate
    });
}

async function getTrend(res, range) {
    // 简化实现：返回每日数据
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 1;
    const labels = [];
    const values = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(dateStr.slice(5)); // MM-DD

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const { count } = await supabase
            .from('spin_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', date.toISOString())
            .lt('created_at', nextDate.toISOString());

        values.push(count || 0);
    }

    return res.status(200).json({ labels, values });
}

async function getHourly(res, startDate, endDate) {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const values = Array(24).fill(0);

    const { data } = await supabase
        .from('spin_logs')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (data) {
        data.forEach(item => {
            const hour = new Date(item.created_at).getHours();
            values[hour]++;
        });
    }

    return res.status(200).json({ labels, values });
}

async function getRanking(res, startDate, endDate) {
    const { data } = await supabase
        .from('spin_logs')
        .select('food_name, food_emoji')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    // 统计各档口抽中次数
    const counts = {};
    const emojis = {};
    data?.forEach(item => {
        counts[item.food_name] = (counts[item.food_name] || 0) + 1;
        emojis[item.food_name] = item.food_emoji;
    });

    // 获取反馈数据
    const { data: feedbacks } = await supabase
        .from('feedbacks')
        .select('food_name, action')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    const likes = {};
    const dislikes = {};
    feedbacks?.forEach(item => {
        if (item.action === 'like') {
            likes[item.food_name] = (likes[item.food_name] || 0) + 1;
        } else {
            dislikes[item.food_name] = (dislikes[item.food_name] || 0) + 1;
        }
    });

    // 组装结果
    const result = Object.entries(counts)
        .map(([name, count]) => ({
            name,
            emoji: emojis[name],
            count,
            likes: likes[name] || 0,
            dislikes: dislikes[name] || 0,
            likeRate: (likes[name] || 0) + (dislikes[name] || 0) > 0
                ? Math.round((likes[name] || 0) / ((likes[name] || 0) + (dislikes[name] || 0)) * 100)
                : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    return res.status(200).json(result);
}

async function getRecent(res, startDate, endDate) {
    const { data: spins } = await supabase
        .from('spin_logs')
        .select('food_name, food_emoji, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

    const { data: feedbacks } = await supabase
        .from('feedbacks')
        .select('food_name, action, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    // 合并反馈信息
    const feedbackMap = {};
    feedbacks?.forEach(f => {
        const key = `${f.food_name}_${f.created_at.split('T')[0]}`;
        feedbackMap[key] = f.action === 'like' ? '👍' : '👎';
    });

    const result = spins?.map(s => ({
        name: s.food_name,
        emoji: s.food_emoji,
        created_at: s.created_at,
        feedback: feedbackMap[`${s.food_name}_${s.created_at.split('T')[0]}`] || ''
    })).slice(0, 20);

    return res.status(200).json(result || []);
}