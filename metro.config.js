console.error('react-native-mo-fontlink: metro.config.js');

/** @type {import('metro-config').ConfigT} */
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
