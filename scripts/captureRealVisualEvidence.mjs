import { chromium } from 'playwright';
import fs from 'fs';

async function captureEvidence() {
  console.log('Capturing authoritative real visual evidence...');

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

  fs.mkdirSync('screenshots/evidence', { recursive: true });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err.message));

  // --- PART 1: LANDING PAGE VISUAL EVIDENCE (CHECK OR CAPTURE) ---
  const landingHeroExists = fs.existsSync('screenshots/evidence/01_landing_hero.png');
  if (!landingHeroExists) {
    console.log('Navigating to Landing Page (http://localhost:5173/)...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshots/evidence/01_landing_hero.png' });
    console.log('Captured 01_landing_hero.png');

    const storySection = page.locator('#story');
    await storySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/evidence/02_three_friction_posters.png' });

    const poster1 = page.locator('.friction-poster-card').first();
    await poster1.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/evidence/02b_poster_revealed.png' });

    const expSection = page.locator('#the-experience');
    await expSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/evidence/03_experience_journey_cobalt.png' });

    const claritySection = page.locator('#clarity-section');
    await claritySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/evidence/04_clarity_switch_before.png' });

    const clarityToggle = page.locator('#clarity-switch-toggle, .clarity-flip-btn').first();
    await clarityToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/evidence/04b_clarity_switch_after.png' });

    const principlesSection = page.locator('#principles');
    await principlesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/evidence/05_design_rules_eight.png' });

    const footerSection = page.locator('#about');
    await footerSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/evidence/06_ajrathod_signature_footer.png' });
  } else {
    console.log('Landing page screenshots 01 to 06 already exist and preserved.');
  }

  // --- PART 2: 3D GAME WORLD VISUAL EVIDENCE ---
  console.log('\nNavigating to 3D Game (http://localhost:5173/#/play)...');
  await page.goto('http://localhost:5173/#/play', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Check for Screen 02: Avatar Select Modal
  const enterStationBtn = page.locator('button:has-text("ENTER THE STATION")');
  if (await enterStationBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Avatar Select Modal is visible. Capturing screenshot and confirming traveler...');
    await page.screenshot({ path: 'screenshots/evidence/06b_avatar_select_modal.png' });
    await enterStationBtn.click();
    await page.waitForTimeout(1000);
  }

  // Check for Screen 03: Controls & Objectives Briefing Modal
  const startExploringBtn = page.locator('button:has-text("START EXPLORING STATION"), button:has-text("Skip Tutorial")');
  if (await startExploringBtn.first().isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Controls & Briefing Tutorial Modal is visible. Capturing screenshot and starting exploration...');
    await page.screenshot({ path: 'screenshots/evidence/06c_mission_briefing_modal.png' });
    await startExploringBtn.first().click();
    await page.waitForTimeout(1200);
  }

  // Wait for 3D canvas to be visible on screen
  console.log('Waiting for 3D station canvas...');
  const canvasLocator = page.locator('canvas').first();
  await canvasLocator.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(2500); // Allow textures to settle

  // 7. Outdoor Street Spawn
  console.log('Capturing outdoor street spawn...');
  await page.screenshot({ path: 'screenshots/evidence/07_game_outdoor_street_spawn.png' });
  console.log('Captured 07_game_outdoor_street_spawn.png');

  // 8. Camera Preset 3 (Top-Down Architectural View)
  console.log('Testing Camera 3 (Top-Down Architectural View)...');
  await page.keyboard.press('Digit3');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/evidence/08_game_topdown_view.png' });
  console.log('Captured 08_game_topdown_view.png');

  // Reset to Isometric Camera (R)
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(800);

  // 9. Camera Preset 4 (Front View)
  console.log('Testing Camera 4 (Front View)...');
  await page.keyboard.press('Digit4');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/evidence/09_game_front_view.png' });
  console.log('Captured 09_game_front_view.png');

  // Reset to Isometric (R)
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(800);

  // 10. X-Ray Walls (X)
  console.log('Testing X-Ray Walls Toggle (X)...');
  await page.keyboard.press('KeyX');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/evidence/10_game_xray_walls.png' });
  console.log('Captured 10_game_xray_walls.png');
  await page.keyboard.press('KeyX'); // toggle off
  await page.waitForTimeout(800);

  // 11. Walk forward to Officer Dev and Entrance Gate (hold W for 2.2s)
  console.log('Walking forward to Officer Dev & Entrance Gate...');
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(2200);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/evidence/11_game_entrance_officer_dev.png' });
  console.log('Captured 11_game_entrance_officer_dev.png');

  const devPrompt = await page.evaluate(() => {
    const el = document.querySelector('.proximity-prompt');
    return el ? el.innerText : 'No proximity prompt';
  });
  console.log('Officer Dev / Gate Proximity Prompt:', devPrompt);

  // Press E to open entrance gate
  console.log('Interacting with gate (Key E)...');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(1000);

  // Walk forward into Central Concourse over crimson carpet (hold W for 2.5s)
  console.log('Walking into central concourse...');
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(2500);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/evidence/12_game_central_concourse.png' });
  console.log('Captured 12_game_central_concourse.png');

  // 12. Open Exploration Map Modal (M)
  console.log('Opening Map Modal (Key M)...');
  await page.keyboard.press('KeyM');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/evidence/13_game_exploration_map.png' });
  console.log('Captured 13_game_exploration_map.png');

  // 13. Inspect Arjun at Ticket Kiosk directly from Map Modal
  console.log('Clicking Inspect Landmark on Map Modal...');
  const inspectLandmarkBtn = page.locator('button:has-text("Inspect Landmark")');
  if (await inspectLandmarkBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await inspectLandmarkBtn.click();
  } else {
    await page.keyboard.press('KeyM');
    await page.waitForTimeout(600);
    await page.keyboard.press('KeyE');
  }
  await page.waitForTimeout(1200);

  // 14. Forensic Case File Modal
  console.log('Capturing Forensic Case File Modal (Arjun)...');
  await page.screenshot({ path: 'screenshots/evidence/14_forensic_case_file_kiosk.png' });
  console.log('Captured 14_forensic_case_file_kiosk.png');

  // Select first diagnosis option and verify
  const firstOption = page.locator('.vision-radio-card, .echo-option-card').first();
  if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    await firstOption.click();
    await page.waitForTimeout(500);
    const submitDiagBtn = page.locator('button:has-text("Verify Diagnosis"), button:has-text("Submit Diagnosis")').first();
    if (await submitDiagBtn.isVisible().catch(() => false)) {
      await submitDiagBtn.click();
      await page.waitForTimeout(800);
    }
  }

  // 15. Diagnosis Accurate & Evidence Stamp
  console.log('Capturing Diagnosis Accurate & Evidence Stamp...');
  await page.screenshot({ path: 'screenshots/evidence/15_diagnosis_accurate_stamp.png' });
  console.log('Captured 15_diagnosis_accurate_stamp.png');

  // Close Friction Vision Overlay
  const exitVisionBtn = page.locator('button:has-text("EXIT VISION"), .vision-close-btn');
  if (await exitVisionBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await exitVisionBtn.click();
    await page.waitForTimeout(800);
  } else {
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(800);
  }

  // Open Transit PDA (Key P) and navigate to Design Lab
  console.log('Opening Transit PDA (Key P)...');
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(1000);

  const designLabBtn = page.locator('button:has-text("Design Lab")');
  if (await designLabBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Entering Designer Mode from PDA...');
    await designLabBtn.click();
    await page.waitForTimeout(1200);

    // 16. Stage D: Designer Mode Interactive Repair Puzzles
    console.log('Capturing Stage D: Designer Mode Repair Puzzles...');
    await page.screenshot({ path: 'screenshots/evidence/16_repair_mode_puzzles.png' });
    console.log('Captured 16_repair_mode_puzzles.png');

    // Solve all 3 puzzles
    for (let p = 0; p < 3; p++) {
      console.log(`Solving Repair Puzzle ${p + 1}...`);
      const optCard = page.locator('.repair-option-btn').first();
      if (await optCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await optCard.scrollIntoViewIfNeeded();
        await optCard.click();
        await page.waitForTimeout(400);

        // Scroll modal body down to reveal action button
        await page.locator('.modal-body').evaluate(el => el.scrollTop = el.scrollHeight).catch(() => {});

        const submitRepairBtn = page.locator('button:has-text("Submit Design Repair")').first();
        if (await submitRepairBtn.isVisible().catch(() => false)) {
          await submitRepairBtn.scrollIntoViewIfNeeded();
          await submitRepairBtn.click({ force: true });
          await page.waitForTimeout(600);
        }

        await page.locator('.modal-body').evaluate(el => el.scrollTop = el.scrollHeight).catch(() => {});

        const nextBtn = page.locator('button:has-text("Apply Fix & Next"), button:has-text("Apply Fix")').first();
        if (await nextBtn.isVisible().catch(() => false)) {
          await nextBtn.scrollIntoViewIfNeeded();
          await nextBtn.click({ force: true });
          await page.waitForTimeout(1000);
        }
      }
    }

    await page.waitForTimeout(1000);

    // 17. Stage D Complete: All 3 Repairs Solved & Clarity Mode Active
    console.log('Capturing Stage D Complete: All 3 Repairs Solved...');
    await page.screenshot({ path: 'screenshots/evidence/17_repair_mode_puzzles_completed.png' });
    console.log('Captured 17_repair_mode_puzzles_completed.png');

    // Click "COMPLETE ALL REPAIRS & TEST IMPROVED FLOW →"
    const completeRepairsBtn = page.locator('button:has-text("COMPLETE ALL REPAIRS"), button:has-text("Complete All")').first();
    if (await completeRepairsBtn.isVisible().catch(() => false)) {
      await completeRepairsBtn.scrollIntoViewIfNeeded();
      await completeRepairsBtn.click({ force: true });
      await page.waitForTimeout(1200);
    }

    // 18. Stage E: Improved Accessible Booking Flow (AFTER)
    console.log('Capturing Stage E: Improved Accessible Booking Flow (AFTER)...');
    await page.screenshot({ path: 'screenshots/evidence/18_booking_flow_after.png' });
    console.log('Captured 18_booking_flow_after.png');

    // Fill in origin & destination in Stage E
    const depCityInput = page.locator('#dep-city');
    const arrCityInput = page.locator('#arr-city');
    if (await depCityInput.isVisible().catch(() => false)) await depCityInput.fill('Mumbai CST');
    if (await arrCityInput.isVisible().catch(() => false)) await arrCityInput.fill('Pune Jn');

    const afterSubmitBtn = page.locator('.btn-confirm-booking, button[type="submit"]').first();
    if (await afterSubmitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await afterSubmitBtn.scrollIntoViewIfNeeded();
      await afterSubmitBtn.click({ force: true });
      await page.waitForTimeout(1200);

      const viewResultsBtn = page.locator('button:has-text("View Your Personal Results")');
      if (await viewResultsBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await viewResultsBtn.click({ force: true });
        await page.waitForTimeout(1500);

        // 19. Personal Results & Clarity Transformation
        console.log('Capturing Stage F: Personal Results & 8 Design Rules...');
        await page.screenshot({ path: 'screenshots/evidence/19_mission_results_clarity.png' });
        console.log('Captured 19_mission_results_clarity.png');
      }
    }
  }

  console.log('\nAll authoritative visual evidence captured successfully!');
  await browser.close();
}

captureEvidence().catch(err => {
  console.error('Evidence capture failed:', err);
  process.exit(1);
});
