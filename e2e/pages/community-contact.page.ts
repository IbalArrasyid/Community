import type {Page} from '@playwright/test';

export class CommunityContactPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/contact');
  }

  get form() {
    return this.page.getByRole('main').getByRole('form', {name: 'Contact', exact: true});
  }

  async fill(message: string): Promise<void> {
    await this.form.getByLabel('Name', {exact: true}).fill('Community Visitor');
    await this.form.getByLabel('Email', {exact: true}).fill('visitor@example.test');
    await this.form.getByLabel('Subject', {exact: true}).fill('Community event');
    await this.form.getByLabel('Message', {exact: true}).fill(message);
  }

  async submit(): Promise<void> {
    await this.form.getByRole('button', {name: 'Send Message', exact: true}).click();
  }
}
