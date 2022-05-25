// this is called via main podfile
// via node ./node_modules/.bin/react-native config
// requires an xcodeproj in this project.

/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  dependency: {
    platforms: {
      // https://github.com/react-native-community/cli/blob/master/docs/dependencies.md
      ios: {
        scriptPhases: [
          {
            name: '[react-native-mo-fontlink] Link fonts',
            // path: 'node ./lib/fontlink.js',
            path: './fontlink-ios.sh',
            execution_position: 'after_compile',
          },
        ],
      },
    },
  },
};
