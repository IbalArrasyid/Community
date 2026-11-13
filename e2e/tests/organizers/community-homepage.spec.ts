import {test, expect} from '@playwright/test';

test('visitors can explore the community homepage on desktop and mobile @smoke', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('banner').getByRole('link', {name: 'Barter Up.'})).toBeVisible();
  await expect(page.getByRole('main').getByRole('heading', {level: 1})).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', {name: 'Explore events'}).first()).toHaveAttribute('href', '/events');
  await expect(page.getByRole('contentinfo').getByText(/Hi\.Events/i)).toBeVisible();

  await page.setViewportSize({width: 390, height: 844});
  await expect(page.getByRole('banner').getByRole('link', {name: 'Barter Up.'})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('banner').getByRole('link', {name: 'Sign in'}).click();
  await expect(page.getByLabel('Email', {exact: true})).toBeVisible();
});
