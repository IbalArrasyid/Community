import {test, expect} from '@playwright/test';
import {CommunityArticlesPage} from '../../pages/community-articles.page';
import {uniqueName} from '../../utils/unique';

test('visitors can search articles, reset and use the mobile listing @smoke', async ({page}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer in the dev stack.');
  const articles = new CommunityArticlesPage(page);
  await articles.goto();
  await expect(articles.main.getByRole('heading', {level: 1})).toHaveCount(1);

  const query = uniqueName('No matching community article');
  await articles.search(query, 'oldest');
  await expect(page).toHaveURL(url => url.searchParams.get('q') === query && url.searchParams.get('sort') === 'oldest' && !url.searchParams.has('page'));
  await expect(articles.main.getByRole('status')).toContainText('No articles found.');
  await expect(articles.main.getByRole('region', {name: 'Articles', exact: true}).getByRole('article')).toHaveCount(0);

  await articles.reset();
  await expect(articles.form.getByLabel('Search', {exact: true})).toHaveValue('');
  await expect(articles.form.getByLabel('Published', {exact: true})).toHaveValue('newest');
  await page.setViewportSize({width: 390, height: 844});
  await expect(articles.form.getByRole('button', {name: 'Search', exact: true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('contentinfo').getByText(/Hi\.Events/i)).toBeVisible();
});

test('a published article opens its full content and links back to the listing', async ({page, request}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer in the dev stack.');
  const response = await request.get('/api/public/community/content?type=ARTICLE');
  expect(response.ok()).toBe(true);
  const result = await response.json();
  const article = result.data[0];
  test.skip(!article, 'Requires at least one published article in the development community.');

  const articles = new CommunityArticlesPage(page);
  await articles.goto();
  await articles.openArticle(article.title);
  await expect(articles.main.getByRole('heading', {level: 1})).toHaveText(article.title);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new URL('/articles/' + encodeURIComponent(article.slug), page.url()).toString());
  await articles.main.getByRole('link', {name: 'Back · Articles'}).click();
  await expect(articles.form).toBeVisible();
});
