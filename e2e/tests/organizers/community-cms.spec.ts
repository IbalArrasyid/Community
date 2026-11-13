import {test, expect} from '../../fixtures';
import {createFreshOrganizer} from '../../api/factory';
import {CommunityCmsPage} from '../../pages/community.page';
import {uniqueName} from '../../utils/unique';

test('an authorized editor creates a draft, previews it and publishes it @smoke', async ({authedPage: page, api}) => {
  const organizer = await createFreshOrganizer(api, uniqueName('Community CMS'));
  const cms = new CommunityCmsPage(page);
  const title = uniqueName('Our community');
  const body = 'A community built around shared learning and local events.';

  await cms.goto(organizer.id);
  await cms.create(title, 'about', body);
  await cms.dialog.getByRole('button', {name: 'Preview', exact: true}).click();
  await expect(cms.dialog.locator('iframe')).toHaveAttribute('sandbox', '');
  await expect(cms.dialog.frameLocator('iframe').locator('body')).toContainText(body);
  await cms.save();

  await expect(cms.dialog).toHaveCount(0);
  await expect(cms.row(title)).toContainText('Draft');
  await cms.row(title).getByRole('button', {name: 'Edit', exact: true}).click();
  await cms.dialog.getByLabel('Status', {exact: true}).click();
  await page.getByRole('option', {name: 'Published', exact: true}).click();
  await cms.save();

  await expect(cms.dialog).toHaveCount(0);
  await expect(cms.row(title)).toContainText('Published');
});
