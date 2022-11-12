const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;


/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: assetPrefix,
  reactStrictMode: true,
  swcMinify: true,
  // See
  // https://github.com/h3poteto/megalodon/blob/fed72b48d1eba3b674aecfa0c79c0ad52591b118/example/browser/webpack.config.js
  webpack:
      (config,
       {buildId, dev, isServer, defaultLoaders, nextRuntime, webpack}) => {
        const megalodonConfig = {
          resolve: {
            fallback: {
              net: false,
              tls: false,
              dns: false,
            }
          }
        };
        if (!('resolve' in config)) {
          config.resolve = megalodonConfig.resolve
        } else if (!('fallback' in config.resolve)) {
          config.resolve.fallback = megalodonConfig.resolve.fallback;
        } else {
          config.resolve.fallback = {
            ...config.resolve.fallback,
            ...megalodonConfig.resolve.fallback
          };
        }
        return config
      },
}

                   module.exports = nextConfig
