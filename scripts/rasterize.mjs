import sharp from "sharp";
import { mkdir } from "fs/promises";

const OUT = "public/art";
await mkdir(OUT, { recursive: true });

const PRINT = { width: 1800, height: 2400 };
const PHONE = { width: 1170, height: 2532 };

async function bgOf(input) {
  const { dominant } = await sharp(input).stats();
  return { r: dominant.r, g: dominant.g, b: dominant.b };
}

async function fromSvg(name, svgPath, bg) {
  const svg = await sharp(svgPath, { density: 300 }).toBuffer();
  const printBuf = await sharp(svg)
    .resize(PRINT.width, PRINT.height, { fit: "cover" })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();
  const art = await sharp(svg).resize({ width: 990 }).png().toBuffer();
  const artMeta = await sharp(art).metadata();
  const top = Math.round((PHONE.height - artMeta.height) / 2 - 90);
  await sharp({
    create: { ...PHONE, channels: 3, background: bg },
  })
    .composite([{ input: art, left: Math.round((PHONE.width - 990) / 2), top }])
    .jpeg({ quality: 92 })
    .toFile(`${OUT}/${name}-wallpaper.jpg`);
  await sharp(printBuf).toFile(`${OUT}/${name}-print.jpg`);
  console.log("svg →", name);
}

await fromSvg("pink-freud", "design-src/pink-freud.svg", { r: 251, g: 248, b: 243 });
await fromSvg("call-your-mother", "design-src/call-your-mother.svg", { r: 233, g: 223, b: 204 });
await fromSvg("save-me", "design-src/save-me.svg", { r: 248, g: 243, b: 234 });
await fromSvg("offshore", "design-src/offshore.svg", { r: 247, g: 238, b: 215 });

// painterly evergreen: generated art, cropped for a print and a phone screen
const tree = "public/art/evergreen-dusk.jpg";
const sage = await bgOf(tree);
const sageSolid = { r: sage.b > sage.g ? sage.b : sage.g, g: sage.g, b: Math.max(sage.r, sage.b) };
const treePhone = await sharp(tree)
  .resize(PHONE.width, PHONE.height, { fit: "cover" })
  .jpeg({ quality: 92 })
  .toBuffer();
await sharp(treePhone).toFile(`${OUT}/evergreen-dusk-wallpaper.jpg`);
await sharp(tree)
  .resize(PRINT.width, PRINT.height, { fit: "cover" })
  .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
  .toFile(`${OUT}/evergreen-dusk-print.jpg`);
console.log("tree →", sageSolid);

// small card-sized thumbs keep the gallery fast
for (const name of [
  "pink-freud",
  "call-your-mother",
  "save-me",
  "offshore",
  "evergreen-dusk",
]) {
  for (const kind of ["print", "wallpaper"]) {
    await sharp(`${OUT}/${name}-${kind}.jpg`)
      .resize({ width: 760 })
      .jpeg({ quality: 82 })
      .toFile(`${OUT}/${name}-${kind}-thumb.jpg`);
  }
}
console.log("done");
