/** @type {import('next').NextConfig} */
const nextConfig = {

    // 🔑 忽略特定的水合错误
    compiler: {
        // 移除 console.log（生产环境）
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },
};

export default nextConfig;
