module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
          'module-resolver',
          {
              root: ['./src'],
              extensions: [
                  '.ios.ts',
                  '.android.ts',
                  '.ts',
                  '.ios.tsx',
                  '.android.tsx',
                  '.tsx',
                  '.jsx',
                  '.js',
                  '.json',
              ],
              alias: {
                  '@assets': './src/assets',
                  '@components': './src/components',
                  '@libs': './src/libs',
                  '@screens': './src/screens',
                  '@styles': './src/styles'
              },
          },
      ]
  ],
  };
};
