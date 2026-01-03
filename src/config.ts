import dotenv from 'dotenv';

dotenv.config();

export const config = {
    app: {
        headless: process.env.HEADLESS !== 'false', // Default to true
    },
    credentials: {
        username: process.env.APP_USERNAME || '',
        password: process.env.APP_PASSWORD || '',
    },
    urls: {
        login: process.env.LOGIN_URL || '',
        report: process.env.REPORT_URL || '',
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        to: process.env.EMAIL_TO || '',
    }
};

export const checkConfig = () => {
    const missing = [];
    if (!config.credentials.username) missing.push('APP_USERNAME');
    if (!config.credentials.password) missing.push('APP_PASSWORD');
    if (!config.urls.login) missing.push('LOGIN_URL');
    if (!config.urls.report) missing.push('REPORT_URL');

    // Email checks
    if (!config.email.user) missing.push('EMAIL_USER');
    if (!config.email.pass) missing.push('EMAIL_PASS');
    if (!config.email.to) missing.push('EMAIL_TO');

    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
};
