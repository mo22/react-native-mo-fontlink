# react-native-mo-fontlink

Provide font-autolinking for react-native / metro (ios and android)

Instead of fiddling with `Info.plist` and adding resources and checking if the font filenames are correct,
simply `require()` or `import` them.

### IOS

On IOS, this works by adding a custom build phase (via `react-native.config.js`, which requires this module
to have a podspec and xcodeproj) that moves the font files in the build dir
(`${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}`) from `assets/something/.../font.ttf` to `/`.

All found fonts are added to `Info.plist` (also in the build dir).

Additionally the postscript font names are compared to the filenames. For a font to work, the filename must
match the postscript name.

### IOS Simulator

```


curl "http://localhost:8081/index.bundle?platform=ios&dev=true"

__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  module.exports = _$$_REQUIRE(_dependencyMap[0], "react-native/Libraries/Image/AssetRegistry").registerAsset({
    "__packager_asset": true,
    "httpServerLocation": "/assets/assets/fonts",
    "scales": [1],
    "hash": "2bcc211c05fc425a57b2767a4cdcf174",
    "name": "Lato-Light",
    "type": "ttf"
  });
},1570,[408],"assets/fonts/Lato-Light.ttf");
```

export TARGET_BUILD_DIR=/Users/mmoeller/Library/Developer/Xcode/DerivedData/phiber-fkqbuqublhcfnbbegwkevhcyuhpl/Build/Products/Debug-iphonesimulator
export UNLOCALIZED_RESOURCES_FOLDER_PATH=phiber.app
export INFOPLIST_PATH=phiber.app/Info.plist


### Android

Android works out of the box as it seems.
