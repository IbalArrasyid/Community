import {test, expect} from '@playwright/test';
import {CommunityArticleDetailPage} from '../../pages/community-article-detail.page';

test('single posts show CMS content, heading anchors, share links and mobile layout @smoke', async ({page, request}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer in the dev stack.');
  const response = await request.get('/api/public/community/content?type=ARTICLE');
  expect(response.ok()).toBe(true);
  const result = await response.json();
  const article = result.data[0];
  test.skip(!article, 'Requires at least one published article in the development community.');

  const detail = new CommunityArticleDetailPage(page);
  await detail.goto(article.slug);
  await expect(detail.main.getByRole('heading', {level: 1})).toHaveText(article.title);
  await expect(detail.body(article.title)).toBeVisible();
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute('content', article.published_at);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  const whatsapp = detail.share.getByRole('link', {name: 'WhatsApp', exact: true});
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/?text=' + encodeURIComponent(article.title + '\n' + canonical));
  await expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer');

  const headings = detail.body(article.title).locator('h2, h3').filter({hasText: /\S/});
  if (await headings.count()) {
    await expect(detail.contents).toBeVisible();
    await expect(detail.contents.getByRole('link')).toHaveCount(await headings.count());
    await expect(headings.first()).toHaveAttribute('id', /.+/);
    const id = await headings.first().getAttribute('id');
    await detail.contents.getByRole('link').first().click();
    await expect(page).toHaveURL(url => url.hash === '#' + encodeURIComponent(id!));
  } else {
    await expect(detail.contents).toHaveCount(0);
  }

  await page.setViewportSize({width: 390, height: 844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('contentinfo').getByText(/Hi\.Events/i)).toBeVisible();
  await detail.main.getByRole('link', {name: 'Back · Articles', exact: true}).click();
  await expect(detail.main.getByRole('form', {name: 'Search', exact: true})).toBeVisible();
});

test('a denied clipboard exposes a selectable link instead of reporting success', async ({page, request}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer in the dev stack.');
  const response = await request.get('/api/public/community/content?type=ARTICLE');
  expect(response.ok()).toBe(true);
  const result = await response.json();
  const article = result.data[0];
  test.skip(!article, 'Requires at least one published article in the development community.');

  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {writeText: async () => { throw new Error('Clipboard denied for this test'); }},
  }));
  const detail = new CommunityArticleDetailPage(page);
  await detail.goto(article.slug);
  await detail.copyLink();
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  await expect(detail.main.getByRole('textbox', {name: 'Copy link', exact: true})).toHaveValue(canonical!);
  await expect(page.getByText('Link copied', {exact: true})).toHaveCount(0);
});
