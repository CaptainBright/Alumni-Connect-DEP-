import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Basic CORS for Render to call Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Authenticate the incoming request from Render
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.EMAIL_API_KEY) {
        return res.status(401).json({ message: 'Unauthorized proxy request' });
    }

    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ message: 'Missing required email fields' });
    }

    try {
        // Vercel allows SMTP connections natively
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });

        return res.status(200).json({ message: 'Email proxied and sent successfully' });
    } catch (error) {
        console.error('Vercel Email Proxy Error:', error);
        return res.status(500).json({ message: 'Failed to proxy email', error: error.message });
    }
}
