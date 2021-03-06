// this is called via main podfile
// via node ./node_modules/.bin/react-native config
// requires an xcodeproj in this project as well as a podfile

/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  dependency: {
    platforms: {
      // https://github.com/react-native-community/cli/blob/master/docs/dependencies.md
      ios: {
        scriptPhases: [
          {
            name: '[react-native-mo-fontlink] Link fonts',
            // must be a shell script, source is included directly in xcode
            path: './fontlink-ios.sh',
            execution_position: 'after_compile',
          },
        ],
      },
    },
  },
};
