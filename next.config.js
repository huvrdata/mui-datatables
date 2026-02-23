// next.config.js
const path = require('path');

module.exports = {
  experimental: {
    esmExternals: 'loose',
  },
  exportPathMap: function() {
    return {
      '/': { page: '/' },
      '/examples': { page: '/examples' },
    }
  },
  webpack: (config, { defaultLoaders }) => {
    const examplesDir = path.resolve(__dirname, 'examples');
    const srcDir = path.resolve(__dirname, 'src');
    const distDir = path.resolve(__dirname, 'dist');

    // Transpile JSX in the examples directory
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      include: [examplesDir],
      use: [defaultLoaders.babel],
    });

    // Redirect examples' import of ../../src/ to the pre-built dist/
    // to avoid Babel conflicts between Next.js and the library's build config
    config.resolve.alias = {
      ...config.resolve.alias,
      [srcDir]: distDir,
    };

    return config;
  },
}
