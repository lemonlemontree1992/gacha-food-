// Vercel Serverless Function - 配置API
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

    try {
        const { key } = req.query;

        if (key === 'admin_password') {
            // 返回管理员密码（从环境变量获取）
            const password = process.env.ADMIN_PASSWORD || 'admin123';
            return res.status(200).json({ value: password });
        }

        return res.status(400).json({ error: 'Invalid config key' });
    } catch (error) {
        console.error('Config API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}