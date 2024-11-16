/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google OAuth profile pictures
      'avatars.githubusercontent.com' // GitHub profile pictures
    ]
  }
}

module.exports = nextConfig
