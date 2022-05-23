console.error('react-native-mo-fontlink: react-native.config.js');

/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  dependency: {
    platforms: {
      ios: {
        scriptPhases: [
          {
            name: '[react-native-mo-fontlink] Link fonts',
            path: './fontlink-ios.sh',
            execution_position: 'after_compile',
          },
        ],
      },
    },
  },
};
