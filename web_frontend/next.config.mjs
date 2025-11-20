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

  // Docker本番環境用: standalone出力を有効化
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

export default nextConfig;