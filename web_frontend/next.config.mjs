/** @type {import('next').NextConfig} */
const nextConfig = {
  // パフォーマンス最適化
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 静的最適化
  trailingSlash: false,
  
  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;