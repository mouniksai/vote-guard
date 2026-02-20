/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    // In production (HF Spaces), proxy /api calls to the Express backend
    // This avoids CORS issues since both services share the same origin
    async rewrites() {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    },
}

module.exports = nextConfig
