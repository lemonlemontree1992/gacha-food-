// Vercel Serverless Function - 页面访问记录API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { device_id } = req.body;

        // 记录页面访问（可选：可以创建单独的 pageviews 表）
        // 当前访客统计基于 spin_logs 的 device_id 去重计算
        // 这里只返回成功，实际统计在 stats API 中基于 spin_logs 计算

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Pageview API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}