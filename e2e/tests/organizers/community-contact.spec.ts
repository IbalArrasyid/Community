import {test, expect} from '@playwright/test';
import {CommunityContactPage} from '../../pages/community-contact.page';

test('contact shows confirmation only after the API acknowledges receipt @smoke', async ({page}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer in the dev stack.');
  const requests: Record<string, string>[] = [];
  await page.route('**/public/community/contact', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({status: 201, contentType: 'application/json', body: JSON.stringify({data: {received: true}})});
  });
  const contact = new CommunityContactPage(page);
  await contact.goto();
  await contact.fill('Please contact us about the next community workshop.');
  await contact.submit();
  await expect(contact.form.getByRole('status')).toContainText('Your message has been received.');
  await expect(contact.form.getByLabel('Email', {exact: true})).toHaveValue('');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({name: 'Community Visitor', email: 'visitor@example.test', subject: 'Community event', website: ''});
  await page.setViewportSize({width: 390, height: 844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('a contact delivery error keeps the message and never reports success', async ({page}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer in the dev stack.');
  await page.route('**/public/community/contact', route => route.fulfill({status: 500, contentType: 'application/json', body: JSON.stringify({message: 'Service unavailable'})}));
  const contact = new CommunityContactPage(page);
  await contact.goto();
  const message = 'Please help with registration for our community event.';
  await contact.fill(message);
  await contact.submit();
  await expect(contact.form.getByRole('alert')).toBeVisible();
  await expect(contact.form.getByLabel('Message', {exact: true})).toHaveValue(message);
  await expect(contact.form.getByRole('status')).toHaveCount(0);
});

test('an unconfirmed API response does not clear the contact form', async ({page}) => {
  test.skip(!process.env.E2E_COMMUNITY_ORGANIZER_ID, 'Requires a configured public community organizer in the dev stack.');
  await page.route('**/public/community/contact', route => route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({data: {received: false}})}));
  const contact = new CommunityContactPage(page);
  await contact.goto();
  await contact.fill('Please follow up about our event collaboration.');
  await contact.submit();
  await expect(contact.form.getByRole('alert')).toBeVisible();
  await expect(contact.form.getByLabel('Email', {exact: true})).toHaveValue('visitor@example.test');
  await expect(contact.form.getByRole('status')).toHaveCount(0);
});
