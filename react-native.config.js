console.error('react-native-mo-fontlink: react-native.config.js');

module.exports = {
  dependency: {
    platforms: {
      ios: {
        scriptPhases: [
          {
            name: '[react-native-mo-fontlink] Link fonts',
            path: 'node ../node_modules/react-native-mo-fontlink/lib/fontlink.js',
            execution_position: 'before_compile',
          },
        ],
      },
    },
  },
};
