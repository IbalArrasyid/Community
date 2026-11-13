import {Page} from '@playwright/test';

export class CommunityEventsPage {
  constructor(readonly page: Page) {}
  get main() { return this.page.locator('#community-main'); }
  get form() { return this.main.getByRole('form', {name: 'Search events'}); }
  async goto() { await this.page.goto('/events'); }
  async search(query: string) {
    await this.form.getByLabel('Search events', {exact: true}).fill(query);
    await this.form.getByRole('button', {name: 'Search', exact: true}).click();
  }
  async reset() { await this.form.getByRole('link', {name: 'Reset', exact: true}).click(); }
}
