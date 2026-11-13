import type {Page} from '@playwright/test';

export class CommunityArticlesPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/articles');
  }

  get main() {
    return this.page.getByRole('main');
  }

  get form() {
    return this.main.getByRole('form', {name: 'Search', exact: true});
  }

  async search(query: string, sort = 'newest'): Promise<void> {
    await this.form.getByLabel('Search', {exact: true}).fill(query);
    await this.form.getByLabel('Published', {exact: true}).selectOption(sort);
    await this.form.getByRole('button', {name: 'Search', exact: true}).click();
  }

  async openArticle(title: string): Promise<void> {
    await this.main.getByRole('link', {name: title, exact: true}).click();
  }

  async reset(): Promise<void> {
    await this.form.getByRole('link', {name: 'Reset', exact: true}).click();
  }
}
