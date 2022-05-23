# react-native-mo-fontlink

Provide font-autolinking for react-native / metro (ios and android)

Instead of fiddling with `Info.plist` and adding resources and checking if the font filenames are correct,
simply `require()` or `import` them.

### notes

`node_modules/react-native/cli.js bundle` calls `./cli-plugin-metro/build/commands/bundle/saveAssets.js` which
actually copies the require()d fonts to `--assets-dest`, but keeping the full path.

- still checking the postscript names might be useful.
