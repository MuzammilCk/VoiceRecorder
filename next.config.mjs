/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/assemblyai/:path*',
                destination: 'https://api.assemblyai.com/v2/:path*'
            },
            {
                source: '/hume/:path*',
                destination: 'https://api.hume.ai/:path*'
            },
            {
                source: '/acr/:path*',
                destination: 'https://identify-us-west-2.acrcloud.com/:path*'
            }
        ];
    }
};
