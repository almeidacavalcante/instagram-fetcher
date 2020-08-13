import puppeteer from 'puppeteer';

const run = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://almeidacavalcante.com');
  await page.screenshot({
    path: 'almeidacavalcante.png'
  });

  await browser.close();
}

await run();