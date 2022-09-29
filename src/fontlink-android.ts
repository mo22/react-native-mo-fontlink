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
  const bundleURL = new URL('index.bundle?platform=android&dev=true', baseURL).toString();
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
    const resDir = process.argv[2];
    const variant = process.argv[3];
    const buildDir = process.argv[4];

    await fs.promises.mkdir(path.join(resDir, 'font'), { recursive: true });
    await fs.promises.mkdir(path.join(resDir, 'values'), { recursive: true });

    const fontFiles: string[] = [];

    const generatedRawResDir = path.join(buildDir, 'generated', 'res', 'react', variant, 'raw');
    if (fs.existsSync(generatedRawResDir)) {
      for (const file of fs.readdirSync(generatedRawResDir)) {
        if (isFontFile(file)) {
          fontFiles.push(path.join(generatedRawResDir, file));
        }
      }
    } else {
      console.log('WARNING: assets not copied, not bundled? trying to fetch from bundler');
      const someTempDir = path.join(buildDir, 'fontlink-tmp');
      await fs.promises.mkdir(someTempDir, { recursive: true });
      await retrieveFontAssetsFromBundler({ assetPath: someTempDir });
      for (const file of fs.readdirSync(someTempDir)) {
        if (isFontFile(file)) {
          fontFiles.push(path.join(someTempDir, file));
        }
      }
    }

    const fontlinkData: string[] = [];
    for (const fontFile of fontFiles) {
      console.log('fontFile', fontFile);
      const data = await fs.promises.readFile(fontFile);
      console.log('isFontFile', isFontFile(fontFile));
      const postScriptName = getPostScriptName(data);
      console.log('getPostScriptName', postScriptName);
      const resourceName = path.basename(fontFile, path.extname(fontFile)).toLowerCase().replace(/[^a-z0-9]/g, '_');
      console.log('resourceName', resourceName);
      console.log('extname', path.extname(fontFile));
      if (!postScriptName) continue;
      fontlinkData.push(resourceName);
      fontlinkData.push(postScriptName);
      await fs.promises.writeFile(path.join(resDir, 'font', resourceName + path.extname(fontFile)), data);
    }
    if (fontlinkData.length > 0) {
      await fs.promises.writeFile(
        path.join(resDir, 'values', 'fontlink.xml'),
        `<resources><array name="fontlink">${fontlinkData.map((i) => `<item>${i}</item>`).join()}</array></resources>\n`
      );
    }

  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
