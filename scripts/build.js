const path = require('path');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
const SVGO = require('svgo');

const inFile = path.resolve(__dirname, "../sonnenstr58-floor0.svg");
const outDir = path.resolve(__dirname, "../dist");

const template = (svg) => `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap" rel="stylesheet">
  <style>
    body {
        margin: 0;
    }
    svg {
        width: 100vw;
        height: 100vh;
    }
  </style>
</head>
<body>
${svg}
</body>
</html>
`;

const optimizeSVG = async (svg) => {
    const svgo = new SVGO();
    const optimized = await svgo.optimize(svg);
    return {
        svg: optimized.data,
        width: optimized.info.width,
        height: optimized.info.height,
    };
}

const generateIndex = async (svg) => {
    const html = template(svg);
    await fs.writeFile(path.join(outDir, 'index.html'), html);
    return html;
}

const generatePicture = async (html, { width, height }) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.setViewport({ width: Math.ceil(width), height: Math.ceil(height) });
    await page.screenshot({ path: path.join(outDir, 'floor0.png') });
    await browser.close();
}

const main = async () => {
    const rawSVG = await fs.readFile(inFile, 'utf-8');
    const { svg, width, height } = await optimizeSVG(rawSVG);
    await fs.writeFile(path.join(outDir, 'floor0.svg'), svg);
    const html = await generateIndex(svg);
    await generatePicture(html, { width: width * 2, height: height * 2 });
};

main().then(() => console.log("worked")).catch((err) => console.error("errored:", err));
