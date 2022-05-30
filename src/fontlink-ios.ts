import * as plist from 'plist';
import * as fs from 'fs';
import * as path from 'path';

function isFontFile(path: string) {
  return path.endsWith('.ttf') || path.endsWith('.otf');
}

function getPostScriptName(data: Buffer): string | null {
  const fontname = require('fontname');
  const fontinfo = fontname.parse(data);
  return fontinfo?.[0]?.postScriptName ?? null;
}

async function retrieveFontAssetsFromBundler(args: { assetPath: string; baseURL?: string; }) {
  const baseURL = args.baseURL ?? 'http://localhost:8081/';
  const bundleURL = new URL('index.bundle?platform=ios&dev=true', baseURL).toString();
  const res = await fetch(bundleURL);
  if (!res.ok) throw new Error(`retrieveFontAssetsFromBundler: ${bundleURL}: ${res.status} ${res.statusText}`);
  const text = await res.text();
  const assets: {
    __packager_asset: boolean;
    httpServerLocation: string; //
    // width: 28,
    // height: 28,
    // scales: [1],
    hash: string;
    name: string;
    type: string;
  }[] = [...text.matchAll(/registerAsset\((\{[^\}]*\})\)/g)]
    .map((i) => JSON.parse(i[1]));
  const fontAssets = assets.filter((asset) => isFontFile(asset.name + '.' + asset.type));
  for (const asset of fontAssets) {
    const assetURL = new URL(asset.httpServerLocation + '/' + asset.name + '.' + asset.type, baseURL).toString();
    console.log(assetURL);
    const res = await fetch(assetURL);
    if (!res.ok) throw new Error(`retrieveFontAssetsFromBundler: ${assetURL}: ${res.status} ${res.statusText}`);
    const data = await res.arrayBuffer();
    fs.writeFileSync(path.join(args.assetPath, asset.name + '.' + asset.type), Buffer.from(data));
  }
}

if (require.main === module) {
  (async () => {
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

    // walk assetPath +'/assets/' recursively looking for .otf or .ttf files and move them to the correct place
    // @TODO: this does not work for simulator builds as assets are not bundled here.
    {
      const assetsPath = path.join(assetPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        const files = walk(assetsPath);
        for (const file of files) {
          if (isFontFile(file)) {
            console.log('MOVE', file);
            fs.renameSync(file, path.join(assetPath, path.basename(file)));
          }
        }
      } else {
        console.log('WARNING: assets not copied, not bundled? trying to fetch from bundler');
        console.log('XXXXXXXX', process.env.TARGET_BUILD_DIR);
        await retrieveFontAssetsFromBundler({
          assetPath: assetPath,
        });
      }
    }

    // check the postscript names of fonts:
    {
      for (const file of fs.readdirSync(assetPath)) {
        if (isFontFile(file)) {
          const data = fs.readFileSync(path.join(assetPath, file));
          const postScriptName = getPostScriptName(data);
          if (postScriptName) {
            const fileName = path.basename(file).slice(0, -path.extname(file).length);
            if (fileName !== postScriptName) {
              console.error(`WARNING: font file ${file} should be named ${postScriptName}${path.extname(file)}`);
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
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
