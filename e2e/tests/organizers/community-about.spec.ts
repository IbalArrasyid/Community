import {test, expect} from '@playwright/test';
import {CommunityAboutPage} from '../../pages/community-about.page';

test('visitors can read About and contact the community on mobile @smoke', async ({page}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer in the dev stack.');
  const about = new CommunityAboutPage(page);
  await about.goto();

  await expect(about.main.getByRole('heading', {level: 1})).toHaveCount(1);
  await expect(about.banner).toBeVisible();
  await expect(about.main.getByRole('link', {name: 'Explore events'}).first()).toHaveAttribute('href', '/events');
  await expect(about.contactLink).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/about$/);
  await expect(page.getByRole('contentinfo').getByText(/Hi\.Events/i)).toBeVisible();

  await page.setViewportSize({width: 390, height: 844});
  await expect(about.banner).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await about.openContact();
  await expect(page.getByLabel('Name', {exact: true})).toBeVisible();
  await expect(page.getByLabel('Email', {exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Send Message'})).toBeVisible();
});
