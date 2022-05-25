import * as plist from 'plist';
import * as fs from 'fs';
import * as path from 'path';
const fontname = require('fontname');


if (require.main === module) {

  if (!process.env.TARGET_BUILD_DIR) {
    throw new Error(`TARGET_BUILD_DIR missing`);
  }
  if (!process.env.UNLOCALIZED_RESOURCES_FOLDER_PATH) {
    throw new Error(`UNLOCALIZED_RESOURCES_FOLDER_PATH missing`);
  }
  if (!process.env.INFOPLIST_PATH) {
    throw new Error(`INFOPLIST_PATH missing`);
  }

  const assetPath = path.join(process.env.TARGET_BUILD_DIR, process.env.UNLOCALIZED_RESOURCES_FOLDER_PATH);
  if (!fs.existsSync(assetPath)) {
    throw new Error(`assetPath not found: ${assetPath}`);
  }
  const infoPlistPath = path.join(process.env.TARGET_BUILD_DIR, process.env.INFOPLIST_PATH);
  if (!fs.existsSync(infoPlistPath)) {
    throw new Error(`infoPlistPath not found: ${infoPlistPath}`);
  }

  function walk(dir: string) {
    let res: string[] = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        res = [...res, ...walk(filePath)];
      } else {
        res.push(filePath);
      }
    }
    return res;
  }

  function isFontFile(path: string) {
    return path.endsWith('.ttf') || path.endsWith('.otf');
  }

  // walk assetPath +'/assets/' recursively looking for .otf or .ttf files and move them to the correct place
  {
    const files = walk(path.join(assetPath, 'assets'));
    for (const file of files) {
      if (isFontFile(file)) {
        console.log('MOVE', file);
        fs.renameSync(file, path.join(assetPath, path.basename(file)));
      }
    }
  }

  // check the postscript names of fonts:
  {
    for (const file of fs.readdirSync(assetPath)) {
      if (isFontFile(file)) {
        const data = fs.readFileSync(path.join(assetPath, file));
        const fontinfo = fontname.parse(data);
        if (fontinfo) {
          const postScriptName = fontinfo?.[0]?.postScriptName;
          if (postScriptName) {
            const fileName = path.basename(file).slice(0, -path.extname(file).length);
            if (fileName !== postScriptName) {
              console.error(`WARNING: font file ${file} should be named ${postScriptName}${path.extname(file)}`);
            }
          }
        }
      }
    }
  }

  // go through all fonts in the assetPath and add to info.plist
  {
    const fonts = new Set<string>();
    for (const file of fs.readdirSync(assetPath)) {
      if (isFontFile(file)) {
        fonts.add(path.basename(file));
      }
    }
    const origPlistText = fs.readFileSync(infoPlistPath, 'utf8');
    const origPlist = plist.parse(origPlistText) as plist.PlistObject;
    const newPlist = {
      ...origPlist,
      UIAppFonts: [
        ...new Set([
          ...((origPlist.UIAppFonts as plist.PlistArray) ?? []),
          ...fonts,
        ]),
      ]
    };
    const newPlistText = plist.build(newPlist, { indent: '\t' });
    if (newPlistText !== origPlistText) {
      fs.writeFileSync(infoPlistPath, newPlistText);
    }
  }

}
