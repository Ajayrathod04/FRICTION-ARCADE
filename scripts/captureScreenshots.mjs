import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser for refined screenshot capture...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
    ],
  });

  // 1. Desktop Hero (1440 x 900)
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({ path: 'screenshots/desktop-hero.png' });
  console.log('Captured screenshots/desktop-hero.png');

  // 2. Mobile Hero (390 x 844)
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobilePage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);
  await mobilePage.screenshot({ path: 'screenshots/mobile-hero.png' });
  console.log('Captured screenshots/mobile-hero.png');

  // 3. Desktop Mission (Interactive Booking Stage with inputs)
  await desktopPage.click('#btn-hero-start');
  await desktopPage.waitForTimeout(800);
  const inputs = await desktopPage.$$('.flawed-input');
  if (inputs.length >= 3) {
    await inputs[0].fill('mumbai');
    await inputs[1].fill('pune');
    await inputs[2].fill('18-10-2026');
  }
  await desktopPage.evaluate(() => {
    const el = document.querySelector('.booking-challenge-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: 'screenshots/desktop-mission.png' });
  console.log('Captured screenshots/desktop-mission.png');

  // 4. Mobile Mission (390 x 844)
  await mobilePage.click('#btn-hero-start');
  await mobilePage.waitForTimeout(800);
  await mobilePage.evaluate(() => {
    const el = document.querySelector('.booking-challenge-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'screenshots/mobile-mission.png' });
  console.log('Captured screenshots/mobile-mission.png');

  // 5. Desktop Repair (Designer Mode repair puzzle with correct option selected)
  await desktopPage.click('.skip-challenge-btn');
  await desktopPage.waitForTimeout(600);
  // In Case File modal, click "Enter Designer Mode"
  const enterDesignerBtn = await desktopPage.$('.case-file-action button');
  if (enterDesignerBtn) {
    await enterDesignerBtn.click();
    await desktopPage.waitForTimeout(600);
    // Select option A (the correct fix for labels)
    const options = await desktopPage.$$('.repair-option-btn');
    if (options.length > 0) {
      await options[0].click();
      await desktopPage.waitForTimeout(400);
    }
  }
  await desktopPage.screenshot({ path: 'screenshots/desktop-repair.png' });
  console.log('Captured screenshots/desktop-repair.png');

  await browser.close();
  console.log('All screenshots refined and captured successfully!');
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
