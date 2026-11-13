import {test, expect} from '@playwright/test';
import {CommunityEventsPage} from '../../pages/community-events.page';
import {uniqueName} from '../../utils/unique';

test('visitors can search events, reset and browse on mobile @smoke', async ({page}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer.');
  const events = new CommunityEventsPage(page);
  await events.goto();
  await expect(events.main.getByRole('heading', {level: 1})).toHaveCount(1);
  const query = uniqueName('Unmatched community event');
  await events.search(query);
  await expect(page).toHaveURL(url => url.searchParams.get('q') === query && !url.searchParams.has('page'));
  await expect(events.main.getByRole('status')).toContainText('No upcoming events yet.');
  await expect(events.main.getByRole('article')).toHaveCount(0);
  await events.reset();
  await expect(events.form.getByLabel('Search events', {exact: true})).toHaveValue('');
  await page.setViewportSize({width: 390, height: 844});
  await expect(events.form.getByRole('button', {name: 'Search', exact: true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('contentinfo').getByText(/Hi\.Events/i)).toBeVisible();
});

test('public event cards retain their existing ticketing destination', async ({page}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer.');
  const events = new CommunityEventsPage(page);
  await events.goto();
  const card = events.main.getByRole('article').first();
  test.skip(await card.count() === 0, 'Requires an upcoming published event.');
  const heading = card.getByRole('heading');
  const title = await heading.innerText();
  const destination = await heading.getByRole('link').getAttribute('href');
  expect(destination).toMatch(/^\/event\/[^/]+\/.+/);
  await card.getByRole('link', {name: 'View event: ' + title, exact: true}).click();
  await expect(page).toHaveURL(url => url.pathname === destination);
  await expect(page.getByRole('heading', {name: title, exact: true}).first()).toBeVisible();
});
