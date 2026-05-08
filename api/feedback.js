// Vercel Serverless Function - 用户反馈API
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
        const { food_name, food_emoji, action, device_id } = req.body;

        if (!food_name || !action || !device_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 检查今日是否已反馈（同一设备同一档口）
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await supabase
            .from('feedbacks')
            .select('*')
            .eq('food_name', food_name)
            .eq('device_id', device_id)
            .gte('created_at', today)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already feedbacked today' });
        }

        // 插入反馈记录
        const { data, error } = await supabase
            .from('feedbacks')
            .insert([{
                food_name,
                food_emoji,
                action,
                device_id,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Feedback API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}