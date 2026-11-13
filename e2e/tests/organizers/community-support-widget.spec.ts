import {test, expect} from '@playwright/test';
import {CommunitySupportPage} from '../../pages/community-support.page';

test('the global support launcher opens a contact fallback without a live provider @smoke', async ({page}) => {
  await page.addInitScript(() => {
    let runtime: Record<string, string> = {};
    Object.defineProperty(window, 'hievents', {
      configurable: true,
      get: () => ({...runtime, VITE_CHATWOOT_BASE_URL: '', VITE_CHATWOOT_WEBSITE_TOKEN: ''}),
      set: value => { runtime = value; },
    });
  });
  await page.goto('/auth/login');
  const support = new CommunitySupportPage(page);
  const launcher = support.contactLauncher;
  await launcher.click();
  const dialog = support.dialog;
  await expect(dialog.getByLabel('Name', {exact: true})).toBeVisible();
  await expect(dialog.getByRole('button', {name: 'Send Message', exact: true})).toBeVisible();
  await expect(page.locator('#chatwoot-script')).toHaveCount(0);
  await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
  await expect(dialog).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test('configured live chat initializes once and survives public SPA navigation', async ({page}) => {
  await page.addInitScript(() => {
    let runtime: Record<string, string> = {};
    Object.defineProperty(window, 'hievents', {
      configurable: true,
      get: () => ({...runtime, VITE_CHATWOOT_BASE_URL: 'https://chat.example.test', VITE_CHATWOOT_WEBSITE_TOKEN: 'test-website-token'}),
      set: value => { runtime = value; },
    });
  });
  let sdkRequests = 0;
  await page.route('https://chat.example.test/packs/js/sdk.js', async route => {
    sdkRequests++;
    await route.fulfill({contentType: 'application/javascript', body: `
      window.chatwootSDK = {run() {
        const html = document.documentElement;
        html.dataset.chatRuns = String(Number(html.dataset.chatRuns || '0') + 1);
        window.$chatwoot = {toggle(state) { html.dataset.chatOpen = state; }};
        window.dispatchEvent(new Event('chatwoot:ready'));
      }};
    `});
  });
  await page.goto('/');
  const support = new CommunitySupportPage(page);
  const launcher = support.liveLauncher;
  await expect(page.locator('#chatwoot-script')).toHaveCount(0);
  await launcher.click();
  await expect(page.locator('html')).toHaveAttribute('data-chat-open', 'open');
  await page.getByRole('banner').getByRole('link', {name: 'About', exact: true}).click();
  await expect(page).toHaveURL(/\/about$/);
  await launcher.click();
  await expect(page.locator('html')).toHaveAttribute('data-chat-runs', '1');
  await expect(page.locator('#chatwoot-script')).toHaveCount(1);
  await expect(support.root).toHaveCount(1);
  expect(sdkRequests).toBe(1);
  await page.goto('/auth/login');
  await expect(launcher).toBeVisible();
});

test('a failed live-chat SDK offers a real contact form', async ({page}) => {
  await page.addInitScript(() => {
    let runtime: Record<string, string> = {};
    Object.defineProperty(window, 'hievents', {
      configurable: true,
      get: () => ({...runtime, VITE_CHATWOOT_BASE_URL: 'https://chat.example.test', VITE_CHATWOOT_WEBSITE_TOKEN: 'test-website-token'}),
      set: value => { runtime = value; },
    });
  });
  await page.route('https://chat.example.test/packs/js/sdk.js', route => route.abort('failed'));
  await page.goto('/auth/login');
  const support = new CommunitySupportPage(page);
  await support.liveLauncher.click();
  const dialog = support.dialog;
  await expect(dialog.getByRole('alert')).toContainText('Live chat is unavailable. Please send us a message.');
  await expect(dialog.getByLabel('Message', {exact: true})).toBeVisible();
  await expect(dialog.getByRole('status')).toHaveCount(0);
});
