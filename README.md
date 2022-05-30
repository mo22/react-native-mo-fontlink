# react-native-mo-fontlink

Provide font-autolinking for react-native / metro (ios and android)

Instead of fiddling with `Info.plist` and adding resources and checking if the font filenames are correct,
simply `require()` or `import` them.

### IOS

On IOS, this works by adding a custom build phase (via `react-native.config.js`, which requires this module
to have a podspec and xcodeproj) that moves the font files in the build dir
(`${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}`) from `assets/something/.../font.ttf` to `/`.

All found fonts are added to `Info.plist` (also in the build dir).

Additionally the postscript font names are compared to the filenames. For a font to work, the
filename must match the postscript name.

For IOS Simulator builds where the bundling process is skipped the bundler server is called at
`http://localhost:8081/index.bundle?platform=ios&dev=true` and the `registerAsset()` calls are
parsed from the bundle. The referenced fonts are then downloaded to the build dir.

### Android

Android works out of the box as it seems.
