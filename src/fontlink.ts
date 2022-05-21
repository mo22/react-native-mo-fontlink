import * as plist from 'plist';
import * as shelljs from 'shelljs';
import * as fs from 'fs';
import * as path from 'path';


export async function getPostscriptName(path: string): Promise<string | undefined> {
  try {
    const data = await fs.promises.readFile(path);
    return require('fontname').parse(data)?.[0]?.postScriptName ?? undefined;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}


if (require.main === module) {
  (async () => {

    console.log('XXXXXXXXX fontlink.ts');
    console.log(process.cwd());


    // [ ] revert yarn: plist, shelljs, fontname
    // [ ] revert tsc: noEmit

    // <string>Lato-Bold.ttf</string>
    // <string>Lato-Light.ttf</string>
    // <string>ABCDiatype-Bold.otf</string>
    // <string>ABCDiatype-BoldItalic.otf</string>
    // <string>ABCDiatype-Medium.otf</string>
    // <string>ABCDiatype-MediumItalic.otf</string>
    // <string>ABCDiatype-Regular.otf</string>
    // <string>ABCDiatype-RegularItalic.otf</string>
    // <string>PitchSans-Medium.otf</string>
    // <string>PitchSans-Semibold.otf</string>

    // question: which fonts?


    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

    // cwd: is ios

    if (!process.env.TARGET_BUILD_DIR) throw new Error(`TARGET_BUILD_DIR missing`);
    if (!process.env.UNLOCALIZED_RESOURCES_FOLDER_PATH) throw new Error(`UNLOCALIZED_RESOURCES_FOLDER_PATH missing`);
    const assetPath = process.env.TARGET_BUILD_DIR + '/' + process.env.UNLOCALIZED_RESOURCES_FOLDER_PATH;
    if (!fs.existsSync(assetPath)) throw new Error(`assetPath not found: ${assetPath}`);
    console.log('assetPath', assetPath);

    const addPlistFonts = new Set<string>();
    for (const file of shelljs.ls('../assets/fonts/*')) {
      const psName = await getPostscriptName(file);
      const fileBaseName = path.basename(file).slice(0, -path.extname(file).length);
      if (psName !== fileBaseName) {
        throw new Error(`file ${file} has postscript name ${psName} but basename is ${fileBaseName}`);
      }
      addPlistFonts.add(path.basename(file));
      // not sufficient?
      shelljs.cp(file, assetPath);
    }

    if (!process.env.INFOPLIST_FILE) throw new Error(`INFOPLIST_FILE missing`);
    const plistOrig = fs.readFileSync(process.env.INFOPLIST_FILE).toString('utf8');
    const plistObj = plist.parse(plistOrig) as any;
    plistObj['UIAppFonts'] = Array.from(new Set([
      ...plistObj['UIAppFonts'] ?? [],
      ...addPlistFonts ?? [],
    ]));
    const plistNew = plist.build(plistObj);
    if (plistOrig !== plistNew) {
      console.log('plist changed!');
      fs.writeFileSync(process.env.INFOPLIST_FILE!, plistNew);
    }


    // [ ] get list of fonts to install.
    // [ ] get the actual postscript font names of those.
    // [ ] ios: copy the font assets to "${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"
    // [ ] ios: add them to Info.plist UIAppFonts [remember which we added?]


  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
