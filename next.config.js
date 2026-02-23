// next.config.js
const path = require('path');

module.exports = {
  output: 'export',
  experimental: {
    esmExternals: 'loose',
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

    // Replace raw-loader with webpack 5 native asset/source for ?raw imports
    config.module.rules.push({
      resourceQuery: /raw/,
      type: 'asset/source',
    });

    // Exclude ?raw queries from Next.js built-in CSS processing
    const cssRules = config.module.rules.find(
      rule => rule.oneOf && Array.isArray(rule.oneOf)
    );
    if (cssRules) {
      cssRules.oneOf.forEach(rule => {
        if (rule.test && rule.test.toString().includes('css')) {
          rule.resourceQuery = { not: [/raw/] };
        }
      });
    }

    return config;
  },
}
