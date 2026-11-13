import type {Page} from '@playwright/test';

export class CommunityCmsPage {
  constructor(private readonly page: Page) {}

  async goto(organizerId: number): Promise<void> {
    await this.page.goto('/manage/organizer/' + organizerId + '/community');
  }

  get dialog() {
    return this.page.getByRole('dialog');
  }

  async create(title: string, slug: string, body: string): Promise<void> {
    await this.page.getByRole('button', {name: 'Create content', exact: true}).click();
    await this.dialog.getByLabel('Title', {exact: true}).fill(title);
    await this.dialog.getByLabel('Slug', {exact: true}).fill(slug);
    await this.dialog.locator('[contenteditable="true"]').fill(body);
  }

  row(title: string) {
    return this.page.locator('section').filter({has: this.page.getByRole('heading', {name: title, exact: true})});
  }

  async save(): Promise<void> {
    await this.dialog.getByRole('button', {name: 'Save', exact: true}).click();
  }
}
